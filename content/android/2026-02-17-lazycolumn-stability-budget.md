---
title: "Compose LazyColumn Stability Budget for User Directories"
date: "2026-02-17"
description: "Teach Compose to skip useless work by stabilizing your user list models, derived filters, and side effects."
tags: ["Jetpack Compose", "Performance", "LazyColumn", "Kotlin", "Android"]
---

Every morning our support team scrolls through a list of 3,000 users to see who needs help. The screen *looked* simple: a `LazyColumn` with avatars, names, and an online badge. Yet scrolling stuttered, memory usage crept up, and recomposition counters glowed red. Today we will fix that user directory step by step so that Compose can finally skip work instead of repainting every row on each update.

## 1. Freeze the data model + key rows properly

If a `LazyColumn` cannot prove that an item is stable, the slot loses its identity and Compose has no choice but to redraw. Mutable models and missing keys are the fastest way to burn the frame budget.

### BAD: Mutable models + implicit keys

```kotlin
// ❌ Mutable properties mean Compose must assume the object mutates outside Compose
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
        items(ui) { user -> // ❌ No key: slot reuse shuffles state
            UserRowBad(user)
        }
    }
}

@Composable
fun UserRowBad(user: User) {
    // ❌ Local state keeps references to whatever user happens to reuse the slot later
    val badgeColor = remember { mutableStateOf(Color.Gray) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { badgeColor.value = if (badgeColor.value == Color.Gray) Color.Green else Color.Gray }
            .padding(16.dp)
    ) {
        UserAvatar(url = user.avatarUrl)
        Column(Modifier.padding(start = 12.dp)) {
            Text(text = user.fullName)
            Text(
                text = if (user.isOnline) "Online" else "Offline",
                color = badgeColor.value // ❌ State now mismatched when rows are reused
            )
        }
    }
}
```

**What breaks?**
- Mutable `User` leaves Compose guessing, so every emission from the flow triggers full recomposition.
- Slot reuse + remembered state means row A can inherit badge state from row B when filtering or paging.
- The leak is silent until QA scrolls for a few minutes and sees badges flicker randomly.

### GOOD: Immutable DTO + explicit keys + event hoisting

```kotlin
@Immutable // ✅ Compose can now trust reference equality for skipping
 data class UserUiState(
     val id: String,
     val fullName: String,
     val isOnline: Boolean,
     val avatarUrl: String
 )

class DirectoryViewModel : ViewModel() {
    val uiState: StateFlow<List<UserUiState>> = ...

    fun onUserTapped(id: String) {
        // Update repository → emits NEW list; Compose diff uses stable references
    }
}

@Composable
fun UserDirectoryScreen(viewModel: DirectoryViewModel = viewModel()) {
    val users by viewModel.uiState.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        items(
            items = users,
            key = { it.id } // ✅ Slot lifetime now bound to unique user id
        ) { user ->
            UserRow(
                user = user,
                onUserTapped = viewModel::onUserTapped
            )
        }
    }
}

@Composable
fun UserRow(
    user: UserUiState,
    onUserTapped: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onUserTapped(user.id) }
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        UserAvatar(url = user.avatarUrl)
        Column(Modifier.padding(start = 12.dp).weight(1f)) {
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

**Result:** Compose now skips rows whose reference stays the same, badge state is derived from immutable data, and scrolling no longer swaps colors between users.

## 2. Memoize expensive filters + scope side effects to the row key

A support lead can filter "online" users or search by name. The naive version computed the filter *inside* `items {}` and launched a presence sync for every visible row — even rows that immediately scrolled away.

### BAD: Derived lists inside composition + unkeyed side effects

```kotlin
@Composable
fun FilterableDirectoryBad(
    users: List<UserUiState>,
    query: String,
    syncPresence: suspend (String) -> Unit
) {
    val scope = rememberCoroutineScope() // ❌ Screen-scoped, never cancelled per row

    LazyColumn {
        items(
            // ❌ New list allocated on every recomposition → Compose thinks everything changed
            users.filter { user ->
                user.fullName.contains(query, ignoreCase = true) ||
                    (query == "online" && user.isOnline)
            }
        ) { user ->
            LaunchedEffect(Unit) { // ❌ Effect never cancels until screen leaves composition
                scope.launch { syncPresence(user.id) }
            }

            UserRow(user = user) { scope.launch { syncPresence(user.id) } }
        }
    }
}
```

**Pain points**
- Filtering inline creates a brand-new list reference, so Compose rebinds every slot.
- `LaunchedEffect(Unit)` restarts for *all* rows on any recomposition, triggering duplicate network calls.
- Off-screen rows keep coroutines alive, leaking memory and radio resources.

### GOOD: `derivedStateOf` + keyed `LaunchedEffect`

```kotlin
@Composable
fun FilterableDirectory(
    users: List<UserUiState>,
    query: String,
    onSyncPresence: (String) -> Unit
) {
    // ✅ Work once per (users, query) change, expose memoized reference to LazyColumn
    val filteredUsers by remember(users, query) {
        derivedStateOf {
            if (query.isBlank()) users
            else users.filter { user ->
                user.fullName.contains(query, ignoreCase = true) ||
                    (query == "online" && user.isOnline)
            }
        }
    }

    LazyColumn {
        items(
            items = filteredUsers,
            key = { it.id }
        ) { user ->
            // ✅ Tied to user.id, so it cancels automatically when the row leaves composition
            LaunchedEffect(user.id) {
                onSyncPresence(user.id)
            }

            UserRow(
                user = user,
                onUserTapped = onSyncPresence
            )
        }
    }
}
```

**Benefits**
- `derivedStateOf` returns the *same* list reference until the inputs change, so Compose can diff cheaply.
- Keyed effects ensure presence sync stops the moment the row is removed or replaced.
- No screen-level coroutine scopes linger; memory usage stays flat after heavy scrolling.

## 3. Measure, then guard the recomposition budget

Optimization is not a vibe check. Instrument the screen:

1. **Recomposition Highlighter**: `Modifier.recomposeHighlighter()` in QA builds pinpoints hot spots instantly.
2. **Layout Inspector counters**: Enable "Show Recomposition Counts" to ensure rows you expect to skip actually do.
3. **Heap sampling**: Run `adb shell dumpsys meminfo <package>` before and after scrolling through cached data. If totals climb, search for `remember { mutableStateOf(...) }` inside items.

Compose is happy to skip work when you make it easy: stable models, deterministic keys, memoized derived lists, and effects tied to the row identity. Bake those into every user directory before you worry about fancier tricks like lazy paging or `lazyListState.prefetch`.

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Treat LazyColumn like an accounting exercise: freeze the data, memoize filtered views, and scope side effects to the row key. Do that, and Compose repaints only the users that truly change, keeping your directory fast, battery-friendly, and leak-free.</p>
</div>
