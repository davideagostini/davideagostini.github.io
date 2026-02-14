---
title: "remember vs rememberSaveable in Compose: When to Use Each"
date: "2026-02-14"
description: "Learn the difference between remember and rememberSaveable in Jetpack Compose and when each one prevents state loss during configuration changes."
tags: ["Jetpack Compose", "Performance", "State", "Android", "Kotlin"]
---

Ever wondered why your Compose UI loses state during rotation? Or why some values reset while others persist? The answer lies in understanding **`remember`** vs **`rememberSaveable`**.

## The Problem: State Lost on Configuration Change

When your phone rotates or the system kills your app in background, you want certain UI state to survive. But by default, Compose recomposes from scratch—and some state disappears!

## Understanding the Difference

### What `remember` Does

```kotlin
@Composable
fun CounterScreen() {
    // ❌ PROBLEM: State lost on configuration change (rotation, dark mode toggle)
    var count by remember { mutableStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Count: $count",
            style = MaterialTheme.typography.headlineMedium
        )

        Button(onClick = { count++ }) {
            Text("Increment")
        }
    }
}
```

- Stores value **only during composition**
- Survives **recomposition** (same composition)
- Lost on **configuration change** (rotation, locale change)
- Lost when **process is killed**

### What `rememberSaveable` Does

```kotlin
@Composable
fun CounterScreenSaved() {
    // ✅ SURVIVES: Configuration changes and process death
    var count by rememberSaveable { mutableStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Count: $count",
            style = MaterialTheme.typography.headlineMedium
        )

        Button(onClick = { count++ }) {
            Text("Increment")
        }
    }
}
```

- Stores value in **Bundle** (for configuration changes)
- Uses **SavedStateHandle** internally (for process death)
- Survives **rotation**, **locale changes**, **system UI mode changes**
- Survives **process death** (with limitations)

## Real-World Scenario: User List with Filters

Here's a realistic example showing when each is appropriate:

```kotlin
// ✅ GOOD: Search query should persist during rotation
@Composable
fun SearchScreen() {
    // Remember search query across configuration changes
    var searchQuery by rememberSaveable { mutableStateOf("") }
    var selectedFilter by rememberSaveable { mutableStateOf(FilterType.ALL) }

    Column(modifier = Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            label = { Text("Search users") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        )

        // Filter chips - these should also persist
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterType.entries.forEach { filter ->
                FilterChip(
                    selected = selectedFilter == filter,
                    onClick = { selectedFilter = filter },
                    label = { Text(filter.name) }
                )
            }
        }

        // Results list - this should NOT persist (re-fetch on config change)
        val filteredUsers = remember(searchQuery, selectedFilter) {
            // This CAN be regular remember - we want fresh data after config change
            users.filter { user ->
                matchesFilter(user, searchQuery, selectedFilter)
            }
        }

        LazyColumn {
            items(filteredUsers) { user ->
                UserItem(user = user)
            }
        }
    }
}
```

## When NOT to Use rememberSaveable

```kotlin
// ❌ BAD: Don't use rememberSaveable for everything!
@Composable
fun BadExample() {
    // Heavy objects in rememberSaveable cause slow restores
    var heavyObject by rememberSaveable { mutableStateOf(HeavyObject()) }

    // ❌ CRITICAL: Never store ViewModels in rememberSaveable!
    var viewModel by rememberSaveable { mutableStateOf(MyViewModel()) }

    // ❌ DON'T: Store large lists that should be re-fetched
    var allUsers by rememberSaveable { mutableStateOf(fetchAllUsers()) }
}
```

- **Heavy objects** → Slow state restoration, serialized to Bundle
- **ViewModels** → Use `viewModel()` composable instead
- **Large cached data** → Should be re-fetched from repository
- **Temporary UI state** → Use regular `remember`

## Best Practice: ViewModel for Persistent State

```kotlin
// ✅ BEST: Use ViewModel for state that should survive config changes
class UserListViewModel : ViewModel() {
    // ViewModel survives configuration changes automatically
    // This is the recommended approach for most app state

    private val _uiState = MutableStateFlow(UserListUiState())
    val uiState: StateFlow<UserListUiState> = _uiState.asStateFlow()

    fun search(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }
}

@Composable
fun UserListScreen(viewModel: UserListViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    // Compose with ViewModel - automatic survival of config changes!
    Column(modifier = Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = uiState.searchQuery,
            onValueChange = { viewModel.search(it) },
            label = { Text("Search") }
        )

        LazyColumn {
            items(uiState.filteredUsers) { user ->
                UserItem(user = user)
            }
        }
    }
}
```

## Quick Decision Guide

| Use Case | Solution |
|----------|----------|
| Simple counter, toggle state | `rememberSaveable` |
| Search query, filter selection | `rememberSaveable` |
| Heavy computed values | `remember` (or `derivedStateOf`) |
| App data, user data, API responses | **ViewModel + StateFlow** |
| Navigation state | `rememberSaveable` or Navigation library |
| Animation states | `remember` (let Compose handle) |

## The Key Takeaway Box

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Use <code>rememberSaveable</code> for simple UI state (counters, toggles, search queries) that should survive rotation. For complex app state, user data, or anything that needs to survive process death → use <code>ViewModel + StateFlow</code>. Remember that <code>remember</code> alone only survives recomposition, not configuration changes!</p>
</div>
