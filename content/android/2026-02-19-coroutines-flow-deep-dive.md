---
title: "Coroutines + Flow Deep Dive: From Basics to Production Patterns"
date: "2026-02-19"
description: "Master Kotlin Coroutines and Flow: suspend functions, structured concurrency, StateFlow, SharedFlow, error handling, and real-world patterns for Android."
tags: ["Android", "Kotlin", "Coroutines", "Flow", "Async", "Performance"]
---

Async programming in Android used to be a nightmare. Callbacks嵌套 (callback hell), memory leaks, and race conditions were everywhere.

**Kotlin Coroutines** fix this. They make async code look like sync code—and they're now the standard for Android development.

## The Problem: Callback Hell

Before Coroutines, async code looked like this:

```kotlin
// ❌ Old way: Callback hell
fun fetchUser(userId: String, callback: Callback<User>) {
    api.getUser(userId).enqueue(object : Callback<User> {
        override fun onResponse(call: Call<User>, response: Response<User>) {
            if (response.isSuccessful) {
                database.save(response.body()!!).enqueue(object : Callback<Void> {
                    override fun onResponse(call: Call<Void>, response: Response<Void>) {
                        callback.onSuccess(response.body()!!)
                    }
                    override fun onFailure(call: Call<Void>, t: Throwable) {
                        callback.onError(t)
                    }
                })
            }
        }
        override fun onFailure(call: Call<User>, t: Throwable) {
            callback.onError(t)
        }
    })
}
```

**Problems:**
- Hard to read
- Hard to handle errors
- Hard to cancel
- Easy to leak memory
- Can't use try/catch

## The Solution: Coroutines

With Coroutines, the same code looks like this:

```kotlin
// ✅ With Coroutines: Simple!
suspend fun fetchUser(userId: String): User {
    val user = api.getUser(userId)  // Suspends until done
    database.save(user)              // Still async, but clean
    return user
}
```

**Benefits:**
- Looks like sync code
- Easy error handling (try/catch)
- Easy to cancel
- No memory leaks
- Structured concurrency

---

## Core Concepts

### Suspend Functions

A `suspend` function can pause without blocking the thread:

```kotlin
// This function can "pause" at each 'delay' point
suspend fun fetchUser(id: String): User {
    // This line runs...
    val user = api.getUser(id)  // PAUSES here, doesn't block!
    // ...then continues when ready
    return user
}
```

**Key point:** The word `suspend` means "this function can pause and resume later."

### Launch vs Async

Two ways to start a Coroutine:

```kotlin
// fire-and-forget (no result)
viewModelScope.launch {
    val user = fetchUser(id)  // Don't care about result
}

// returns a result
val deferred = viewModelScope.async {
    fetchUser(id)  // Do this and give me the result
}
val user = deferred.await()  // Wait for result
```

**When to use:**
- `launch` → Fire and forget (most cases)
- `async` → When you need the result

---

## Flow: Reactive Streams

### What is Flow?

Flow is Kotlin's way to handle **streams of data**:

```kotlin
// A flow emits values over time
fun getUserUpdates(): Flow<User> = flow {
    while (true) {
        emit(fetchLatestUser())  // Emit new value
        delay(5000)              // Wait 5 seconds
    }
}

// Collecting the flow
viewModelScope.launch {
    getUserUpdates().collect { user ->
        updateUI(user)  // Called every 5 seconds
    }
}
```

### StateFlow: State Holder

StateFlow is perfect for UI state:

```kotlin
class UserViewModel : ViewModel() {
    
    // StateFlow: holds one value, emits updates
    private val _uiState = MutableStateFlow(UserUiState())
    val uiState: StateFlow<UserUiState> = _uiState
    
    fun loadUser(id: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val user = api.getUser(id)
                _uiState.value = _uiState.value.copy(
                    user = user,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message,
                    isLoading = false
                )
            }
        }
    }
}
```

### SharedFlow: Events

SharedFlow is perfect for one-time events:

```kotlin
class UserViewModel : ViewModel() {
    
    // SharedFlow: for events (navigation, toasts, etc.)
    private val _events = MutableSharedFlow<UserEvent>()
    val events: SharedFlow<UserEvent> = _events
    
    fun onUserClicked(user: User) {
        viewModelScope.launch {
            _events.emit(UserEvent.NavigateToDetail(user.id))
        }
    }
}

// In Activity/Fragment
@Composable
fun UserScreen(viewModel: UserViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is UserEvent.NavigateToDetail -> {
                    navController.navigate("/user/${event.userId}")
                }
                is UserEvent.ShowToast -> {
                    Toast.makeText(context, event.message, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
```

---

## Structured Concurrency

### The Problem

Without structured concurrency:

```kotlin
// ❌ BAD: If user leaves, this keeps running!
fun loadData() {
    GlobalScope.launch {
        while (true) {
            api.fetchData()
            delay(1000)
        }
    }
}
```

### The Solution: ViewModelScope

```kotlin
// ✅ GOOD: Cancelled when ViewModel is cleared
class UserViewModel : ViewModel() {
    fun loadData() {
        viewModelScope.launch {
            while (true) {
                api.fetchData()
                delay(1000)
            }
        }
    }
    
    // Called when ViewModel is destroyed
    // Automatically cancels all child coroutines
}
```

### CoroutineScope Rules

| Scope | When Cancelled | Use For |
|-------|-----------------|----------|
| `viewModelScope` | ViewModel destroyed | UI data loading |
| `lifecycleScope` | Activity/Fragment destroyed | UI-bound tasks |
| `GlobalScope` | Never (avoid!) | App-wide long tasks |

---

## Error Handling

### Try/Catch

```kotlin
viewModelScope.launch {
    try {
        val user = api.getUser(id)
        _uiState.value = user
    } catch (e: HttpException) {
        // Handle HTTP errors
        _uiState.value = error("HTTP ${e.code()}")
    } catch (e: NetworkException) {
        // Handle network errors
        _uiState.value = error("No internet")
    } catch (e: Exception) {
        // Catch all
        _uiState.value = error(e.message ?: "Unknown error")
    }
}
```

### catch Operator

```kotlin
viewModelScope.launch {
    flow {
        emit(api.getData())
    }
    .catch { e ->
        emit(defaultValue)  // Handle error, emit fallback
    }
    .collect { data ->
        updateUI(data)
    }
}
```

### retry

```kotlin
viewModelScope.launch {
    flow {
        emit(api.getData())
    }
    .retry(3)  // Retry 3 times
    .catch { e ->
        showError(e)
    }
    .collect { }
}
```

---

## Real-World Patterns

### Pattern 1: Repository with Flow

```kotlin
class UserRepository(
    private val api: UserApi,
    private val dao: UserDao
) {
    // Get from cache first, then network
    fun getUser(id: String): Flow<User> = callbackFlow {
        // Emit cached data first
        val cached = dao.getUser(id)
        if (cached != null) {
            trySend(cached)
        }
        
        // Then fetch from network
        try {
            val user = api.getUser(id)
            dao.save(user)
            trySend(user)
        } catch (e: Exception) {
            if (cached == null) {
                close(e)
            }
        }
        
        awaitClose { }
    }
}
```

### Pattern 2: Combine Multiple Flows

```kotlin
class SearchViewModel(
    private val userRepository: UserRepository,
    private val productRepository: ProductRepository
) : ViewModel() {
    
    private val _searchQuery = MutableStateFlow("")
    
    val searchResults: Flow<SearchResults> = _searchQuery
        .debounce(300)  // Wait 300ms after typing stops
        .distinctUntilChanged()  // Don't emit if same
        .flatMapLatest { query ->
            if (query.isBlank()) {
                flowOf(SearchResults.empty())
            } else {
                combine(
                    userRepository.search(query),
                    productRepository.search(query)
                ) { users, products ->
                    SearchResults(users, products)
                }
            }
        }
        .stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            SearchResults.empty()
        )
}
```

### Pattern 3: Loading State

```kotlin
sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

class UserViewModel : ViewModel() {
    
    private val _userState = MutableStateFlow<UiState<User>>(UiState.Loading)
    val userState: StateFlow<UiState<User>> = _userState
    
    fun loadUser(id: String) {
        viewModelScope.launch {
            _userState.value = UiState.Loading
            _userState.value = try {
                UiState.Success(api.getUser(id))
            } catch (e: Exception) {
                UiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}

@Composable
fun UserScreen(viewModel: UserViewModel = hiltViewModel()) {
    val state by viewModel.userState.collectAsState()
    
    when (val current = state) {
        is UiState.Loading -> CircularProgressIndicator()
        is UiState.Success -> UserCard(user = current.data)
        is UiState.Error -> ErrorMessage(message = current.message)
    }
}
```

---

## When to Use What

### ✅ Use Flow When:

- **Multiple values over time** → User clicks, sensor data, network updates
- **Reactive data** → Database changes, network responses
- **Transforming data** → map, filter, combine

### ✅ Use suspend When:

- **One-time operations** → API call, database query
- **Simple async** → No need for reactive updates

### ✅ Use StateFlow When:

- **UI state** → Screen data, form fields
- **Single source of truth** → One current value

### ✅ Use SharedFlow When:

- **One-time events** → Navigation, toasts, snackbars
- **Event streams** → Logs, analytics

---

## Common Mistakes

### ❌ Don't Use GlobalScope

```kotlin
// ❌ BAD
GlobalScope.launch { }  // Hard to test, never cancels

// ✅ GOOD
viewModelScope.launch { }  // Cancelled with ViewModel
```

### ❌ Don't Forget to Handle Exceptions

```kotlin
// ❌ BAD
viewModelScope.launch {
    api.getData()  // If this throws, coroutine dies silently
}

// ✅ GOOD
viewModelScope.launch {
    try {
        api.getData()
    } catch (e: Exception) {
        handleError(e)
    }
}
```

### ❌ Don't Block in Coroutine

```kotlin
// ❌ BAD
viewModelScope.launch {
    Thread.sleep(1000)  // Blocks thread!
}

// ✅ GOOD
viewModelScope.launch {
    delay(1000)  // Pauses, doesn't block
}
```

---

## Quick Decision Guide

**🎯 Which to use?**

- **One API call** → `suspend fun` + `viewModelScope.launch`
- **UI state** → `StateFlow`
- **One-time events** → `SharedFlow`
- **Multiple values** → `Flow`
- **Load from DB + network** → `flow { }` with `callbackFlow`

**⚡ Performance tips:**
- Use `debounce` for search
- Use `distinctUntilChanged` to avoid duplicates
- Use `flatMapLatest` for latest-only
- Use `whileSubscribed` for auto-cancellation

---

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Start with StateFlow for UI state and suspend functions for one-time operations. Use viewModelScope—not GlobalScope. Remember: Flow is for data streams over time, suspend is for one-shot operations. Keep it simple!</p>
</div>
