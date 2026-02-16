---
title: "Compose LazyColumn Without Leaks: Stabilize Side Effects"
date: "2026-02-16"
description: "How to keep a user directory fast by taming LazyColumn recomposition, stability, and coroutine side effects."
tags: ["Jetpack Compose", "Performance", "LazyColumn", "Kotlin", "Android"]
---

A "simple" user directory screen can tank frames if every row keeps its own mutable state, launches coroutines on scroll, or skips stable keys. Today we will harden a `LazyColumn` that renders hundreds of `UserItem`s, making it safe for skipping and free from item-scoped leaks.

## 1. Start with immutable UI state and readable keys

When Compose cannot prove that an item is *stable*, it recomposes as a defensive move. New Android teams usually drop mutable data classes straight into `LazyColumn` and wonder why scrolling janks.

### BAD: Mutable models, missing keys, and per-row state

```kotlin
// ❌ Data class mutates after construction → Compose loses track of stability
 data class User(
     var id: String,
     var fullName: String,
     var isOnline: Boolean,
     var avatarUrl: String
 )

@Composable
fun UserDirectoryScreenBad(users: StateFlow<List<User>>) {
    val ui by users.collectAsState(emptyList())

    LazyColumn {
        items(ui) { user ->
            UserRowBad(user)
        }
    }
}

@Composable
fun UserRowBad(user: User) {
    // ❌ Each row owns `remember { mutableStateOf }` that never clears until GC
    val presence = remember { mutableStateOf(user.isOnline) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { presence.value = !presence.value } // Mutates only local state
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        UserAvatar(url = user.avatarUrl)
        Column(Modifier.padding(start = 12.dp)) {
            Text(text = user.fullName, style = MaterialTheme.typography.bodyLarge)
            Text(
                text = if (presence.value) "Online" else "Offline",
                style = MaterialTheme.typography.bodyMedium,
                color = if (presence.value) Color(0xFF4CAF50) else Color.Gray
            )
        }
    }
}
```

**What goes wrong?**
- Every emission from `users` forces a full recomposition because the list reference changes *and* the items are mutable.
- Missing `key` means `LazyColumn` reuses slots arbitrarily, so state stored in `UserRowBad` drifts between users.
- Per-row `remember` keeps references alive after the row leaves the viewport.

### GOOD: Immutable UI state + stable keys + event hoisting

```kotlin
@Immutable // ✅ Compose can now skip comparisons when the object reference is unchanged
 data class UserUiState(
     val id: String,
     val fullName: String,
     val isOnline: Boolean,
     val avatarUrl: String
 )

data class DirectoryUiState(
    val users: List<UserUiState> = emptyList()
)

class DirectoryViewModel : ViewModel() {
    val uiState: StateFlow<DirectoryUiState> = ...

    fun togglePresence(userId: String) {
        // Update repository; StateFlow emits a NEW immutable list
    }
}

@Composable
fun UserDirectoryScreen(viewModel: DirectoryViewModel = viewModel()) {
    val ui by viewModel.uiState.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        items(
            items = ui.users,
            key = { it.id } // ✅ Locks each slot to a stable user id
        ) { user ->
            UserRow(
                user = user,
                onTogglePresence = viewModel::togglePresence
            )
        }
    }
}

@Composable
fun UserRow(
    user: UserUiState,
    onTogglePresence: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onTogglePresence(user.id) }
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        UserAvatar(url = user.avatarUrl)
        Column(
            Modifier
                .padding(start = 12.dp)
                .weight(1f)
        ) {
            Text(text = user.fullName, style = MaterialTheme.typography.bodyLarge)
            Text(
                text = if (user.isOnline) "Online" else "Offline",
                style = MaterialTheme.typography.bodyMedium,
                color = if (user.isOnline) Color(0xFF4CAF50) else Color.Gray
            )
        }
    }
}
```

**Wins:**
- Immutable models and `@Immutable` give Compose confidence to skip recomposition when identities stay the same.
- Stable keys keep row identity aligned with data identity, so slot reuse no longer mixes state.
- Presence toggles flow through the ViewModel, so local state disappears and the memory graph stays small.

## 2. Control filtering + side effects so rows do not leak coroutines

The next regression we hit on client audits is a search bar that filters `users` on every keystroke **inside** `items {}`. Combine that with per-row `LaunchedEffect` and you now have hundreds of active coroutines for off-screen rows.

### BAD: Filtering inline and tying side effects to the screen scope

```kotlin
@Composable
fun FilterableDirectoryBad(
    users: List<UserUiState>,
    searchQuery: String,
    syncPresence: suspend (String) -> Unit
) {
    val screenScope = rememberCoroutineScope()

    LazyColumn {
        items(
            // ❌ Each recomposition allocates a brand-new filtered list
            users.filter { user ->
                user.fullName.contains(searchQuery, ignoreCase = true) ||
                    (searchQuery == "online" && user.isOnline)
            }
        ) { user ->
            // ❌ This coroutine keeps running even after the row scrolls away
            LaunchedEffect(Unit) {
                screenScope.launch { syncPresence(user.id) }
            }

            UserRow(
                user = user,
                onTogglePresence = { screenScope.launch { syncPresence(user.id) } }
            )
        }
    }
}
```

**Why it hurts:**
- Filtering inside `items` produces a new `List` for every keystroke, so Compose thinks *every* user changed and redraws the entire column.
- `LaunchedEffect(Unit)` is identical for each row, so side effects restart constantly and never cancel when the row leaves composition.
- `rememberCoroutineScope()` ties work to the screen, meaning off-screen coroutines survive until the screen disappears.

### GOOD: derivedStateOf for filters + keyed side effects

```kotlin
@Composable
fun FilterableDirectory(
    users: List<UserUiState>,
    searchQuery: String,
    onSyncPresence: (String) -> Unit
) {
    // ✅ Only recompute when inputs truly change
    val filteredUsers by remember(users, searchQuery) {
        derivedStateOf {
            if (searchQuery.isBlank()) users
            else users.filter { user ->
                user.fullName.contains(searchQuery, ignoreCase = true) ||
                    (searchQuery == "online" && user.isOnline)
            }
        }
    }

    LazyColumn {
        items(
            items = filteredUsers,
            key = { it.id }
        ) { user ->
            // ✅ Effect is scoped to the item key; it cancels automatically when scrolled out
            LaunchedEffect(user.id) {
                onSyncPresence(user.id)
            }

            UserRow(
                user = user,
                onTogglePresence = onSyncPresence
            )
        }
    }
}
```

**Benefits:**
- `derivedStateOf` memoizes the filtered result, so Compose compares *references*, not deep lists.
- Keyed `LaunchedEffect` belongs to the specific user id, guaranteeing cancellation when that row is removed or replaced.
- The screen no longer holds on to stale `CoroutineScope`s; each row borrows the composition-managed scope and keeps the memory profile tidy.

## 3. Instrument skipping and memory from day one

Beginners trust intuition over data. Do the opposite:
- Enable `Compose Layout Inspector → Show Recomposition Counts` to see which rows thrash first.
- Wrap expensive sections with `Modifier.recomposeHighlighter()` during QA builds to visualize hotspots.
- Run `adb shell dumpsys meminfo <package>` before/after scrolling 1,000 items; you will instantly spot leaks caused by item-scoped remembers.

Offline-first teams benefit the most: stable, skip-friendly lists burn less battery on shaky networks because fewer frames are inflated when cached data refreshes.

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Compose will happily skip work for your LazyColumn when items are immutable, keyed, and free from screen-scoped side effects. Treat derived lists and coroutine launches as shared resources, not per-row toys, and your user directory stays smooth and leak-free.</p>
</div>
