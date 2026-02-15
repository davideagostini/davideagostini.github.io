---
title: "Stabilizing LazyColumn User Lists for Skip-Friendly Recomposition"
date: "2026-02-15"
description: "How to structure user lists in Jetpack Compose so LazyColumn can skip work and stay memory-safe."
tags: ["Jetpack Compose", "Performance", "LazyColumn", "Android", "Kotlin"]
---

LazyColumn is fast only when items are **stable** and **predictable**. If every user row looks "new" to Compose, it will happily recompose hundreds of items per frame, blow through your frame budget, and keep references alive longer than they should. Today’s goal: build a realistic "list of users" screen that actually lets the runtime skip work.

## Why Compose Keeps Rebuilding Your User Rows

The runtime decides whether it can reuse previous layout and drawing results based on stability. Mutable models, missing keys, or per-item local state all make Compose suspicious, so it recomposes *everything* just in case.

### BAD: Mutable models + missing keys + per-item remember

```kotlin
@Composable
fun UserListScreenBad(usersFlow: StateFlow<List<User>>) {
    // ❌ Collect hot flow directly in composition → every emission invalidates the whole list
    val users by usersFlow.collectAsState(emptyList())

    LazyColumn {
        items(users) { user ->
            UserRowBad(user)
        }
    }
}

// ❌ Mutable data class → equals() always true, but fields keep changing behind Compose's back
data class User(
    var id: String,
    var name: String,
    var isOnline: Boolean,
    var avatarUrl: String
)

@Composable
fun UserRowBad(user: User) {
    // ❌ Local remember duplicates state per row and leaks when rows leave the viewport
    val isOnline = remember { mutableStateOf(user.isOnline) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { isOnline.value = !isOnline.value } // Mutates local state, not upstream source
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        UserAvatar(url = user.avatarUrl)
        Column(Modifier.padding(start = 12.dp)) {
            Text(text = user.name, style = MaterialTheme.typography.bodyLarge)
            Text(
                text = if (isOnline.value) "Online" else "Offline",
                style = MaterialTheme.typography.bodyMedium,
                color = if (isOnline.value) Color(0xFF4CAF50) else Color.Gray
            )
        }
    }
}
```

**Problems:**
- The mutable `User` model keeps changing *without* notifying Compose, so the runtime can’t trust equality checks.
- `LazyColumn` receives no key, so it treats rows as interchangeable; off-screen rows lose their state when recycled.
- Each `UserRowBad` owns `remember` state. When 1,000 users scroll by, you keep 1,000 `mutableStateOf` instances in memory until GC.

### GOOD: Immutable UI state + stable keys + event hoisting

```kotlin
@Immutable // ✅ Hint to Compose that the object will not mutate after construction
data class UserUiState(
    val id: String,
    val name: String,
    val isOnline: Boolean,
    val avatarUrl: String
)

class UserDirectoryViewModel : ViewModel() {
    val uiState: StateFlow<UserDirectoryUiState> = ... // exposes List<UserUiState>

    fun togglePresence(userId: String) {
        // Update repository; flow emits a new immutable list
    }
}

@Composable
fun UserListScreen(viewModel: UserDirectoryViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        items(
            items = uiState.users,
            key = { it.id } // ✅ Stable key keeps row identity when scrolled/reordered
        ) { user ->
            UserRow(
                user = user,
                onTogglePresence = viewModel::togglePresence,
                modifier = Modifier.animateItemPlacement() // Works best when keys are stable
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
            .clickable { onTogglePresence(user.id) } // ✅ Event hoisted back to ViewModel
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        UserAvatar(url = user.avatarUrl)
        Column(Modifier.padding(start = 12.dp).weight(1f)) {
            Text(text = user.name, style = MaterialTheme.typography.bodyLarge)
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
- `@Immutable` (or `@Stable`) gives Compose confidence to skip comparisons when the instance reference is unchanged.
- Keys ensure LazyColumn recycles intelligently; animations also need them.
- No per-item `remember`, so rows stay lightweight, and state is centralized in the ViewModel.

## Prevent Cascading Recomposition from Filters & Side Effects

Search bars and presence updates are the usual culprits: every keystroke rebuilds the entire list because `filter` creates a brand-new `List`. Worse, devs drop side effects inside `items {}` and accidentally leak coroutines tied to recycled rows.

### BAD: Filtering inside LazyColumn + per-row coroutine scope

```kotlin
@Composable
fun FilterableUserListBad(users: List<UserUiState>, searchQuery: String) {
    val scope = rememberCoroutineScope()

    LazyColumn {
        items(users.filter { 
            it.name.contains(searchQuery, ignoreCase = true) ||
                it.isOnline && searchQuery == "online"
        }) { user ->
            // ❌ Launching coroutine per row → leaks when row leaves viewport
            LaunchedEffect(user.id) {
                scope.launch {
                    presenceRepository.sync(user.id)
                }
            }

            UserRow(user = user, onTogglePresence = { scope.launch { ... } })
        }
    }
}
```

**Problems:**
- `users.filter { ... }` runs for every recomposition and returns a fresh list, so Compose thinks *every* row changed.
- `LaunchedEffect` inside `items` runs for each visible row; when a row is recycled, the coroutine keeps running because its parent scope is `rememberCoroutineScope()` tied to the screen, not the item.

### GOOD: derivedStateOf for filters + itemScoped side effects

```kotlin
@Composable
fun FilterableUserList(
    users: List<UserUiState>,
    searchQuery: String,
    onSyncPresence: (String) -> Unit
) {
    // ✅ Memoize the expensive filter and only rebuild when inputs change
    val filteredUsers by remember(users, searchQuery) {
        derivedStateOf {
            if (searchQuery.isBlank()) users
            else users.filter { user ->
                user.name.contains(searchQuery, ignoreCase = true) ||
                    (searchQuery == "online" && user.isOnline)
            }
        }
    }

    LazyColumn {
        items(
            items = filteredUsers,
            key = { it.id }
        ) { user ->
            // ✅ Item-scoped effect cancels automatically when key leaves the composition
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

**Wins:**
- `derivedStateOf` memoizes the filtered list. Compose only recomputes when `users` or `searchQuery` change—exactly what we want.
- `LaunchedEffect(key)` is scoped to the item, so it cancels as soon as the row scrolls away, preventing orphan coroutines.
- Stable keys again ensure that the effect is tied to the correct user even if the list reorders.

## Operational Checklist for Compose-Friendly Lists

1. **Immutable models** for everything you hand to `LazyColumn`. Annotate with `@Immutable` or wrap domain models into UI DTOs.
2. **Stable keys** that never change during the lifetime of an item. Usually the database ID.
3. **Centralized state** in ViewModels / repositories. Rows should be pure functions of `UserUiState`.
4. **Memoized expensive work** (`derivedStateOf`, `remember`) scoped to the screen, not to each row.
5. **Item-scoped side effects** using `LaunchedEffect(key)` or `DisposableEffect` so they clean up when recycled.

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Compose skips work only when your LazyColumn items look stable. Feed it immutable UI models, provide stable keys, memoize filtered lists with <code>derivedStateOf</code>, and keep side effects item-scoped so rows stay lightweight. The payoff is a buttery user directory that remains smooth even with thousands of entries.</p>
</div>
