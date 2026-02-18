---
title: "Coroutines + Flow Deep Dive: From Basics to Production Patterns"
date: "2026-02-19"
description: "Master Kotlin Coroutines and Flow: suspend functions, structured concurrency, StateFlow, SharedFlow, error handling, and real-world patterns for Android."
tags: ["Android", "Kotlin", "Coroutines", "Flow", "Async", "Performance"]
---

Async programming in Android used to be a nightmare. Callbacks (callback hell), memory leaks, and race conditions were everywhere.

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

// suspend = this function can "pause" without blocking the main thread
// Think of it like: "wait for this to finish, but don't freeze the app"
suspend fun fetchUser(userId: String): User {
    // This line looks synchronous, but under the hood:
    // - The app keeps running smoothly
    // - When the API responds, this continues
    val user = api.getUser(userId)  // ← API call happens here (app stays responsive!)
    
    // Save to local database - also async, but code looks sync
    database.save(user)              // ← Done in background
    
    // Return the user - the function is done
    return user                      // ← Back to the caller with the result
}
```

**Why this is better:**
- Code reads top-to-bottom (easy to understand)
- No callbacks = no confusion
- Try/catch works naturally

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
// What does "suspend" actually mean?

// Think of it like: "pause this function until done, but let other stuff run"
// The function doesn't freeze your app - it just... waits nicely!

suspend fun fetchUser(id: String): User {
    // Line 1: This runs first
    // Simple variable assignment
    
    // Line 2: The MAGIC happens here!
    // - API call starts
    // - Instead of freezing the app, this function "pauses" here
    // - The main thread is FREE to do other things
    // - When API responds, this function RESUMES from exactly here
    val user = api.getUser(id)  // ← PAUSES here ⏸️, resumes when done ▶️
    
    // Line 3: Continues after the API response
    // We have the user data now
    return user
}
```

**Beginner tip:** `suspend` doesn't mean "stop the app" - it means "wait for this, but keep the app responsive!"

**Key point:** The word `suspend` means "this function can pause and resume later."

### Launch vs Async

Two ways to start a Coroutine:

```kotlin
// ============================================================
// Option 1: launch - "Fire and Forget"
// ============================================================
// Use when: You don't need the result, just want to start work

viewModelScope.launch {          // ← Start a coroutine in ViewModelScope
    val user = fetchUser(id)   // ← Do some work (can use suspend functions)
    // ↑ We don't return anything from this block
    // ↑ If user leaves screen, this is CANCELLED automatically!
}
// Code here runs immediately (doesn't wait for fetchUser to finish)


// ============================================================
// Option 2: async - "Do work and give me the result"
// ============================================================
// Use when: You NEED the result of this operation

val deferred = viewModelScope.async {    // ← async returns a "Deferred" object
    fetchUser(id)                        // ← Do work, return a value
}
// ↑ IMPORTANT: Work STARTS here but doesn't wait!

val user = deferred.await()  // ← THIS line waits until async is done
// ↑ Only now do we have the actual user data

// ============================================================
// When to use which?
// ============================================================
// launch → 90% of cases (loading data, saving, etc.)
// async → When you need to do multiple things in parallel AND wait for all
```

**Simple rule:** Start with `launch`. Only use `async` when you specifically need the result.

---

## Flow: Reactive Streams

### What is Flow?

Flow is Kotlin's way to handle **streams of data** (values that come over time):

```kotlin
// ============================================================
// What is Flow?
// ============================================================
// Think of Flow like a water pipe:
// - Water (data) flows through it
// - Can have multiple drops (values)
// - Someone is collecting at the end
// - Can start/stop anytime

// ============================================================
// Creating a Flow: "emit" sends values
// ============================================================
fun getUserUpdates(): Flow<User> = flow {
    // This block runs when someone COLLECTS this flow
    while (true) {                                    // ← Keep emitting forever
        val user = fetchLatestUser()                  // ← Get fresh data
        emit(user)                                     // ← SEND this value to collectors
        delay(5000)                                    // ← Wait 5 seconds, then repeat
    }
}

// ============================================================
// Collecting a Flow: "collect" receives values
// ============================================================
viewModelScope.launch {
    // getUserUpdates() returns a Flow<User>
    // .collect { } means "whenever a new value comes, run this code"
    getUserUpdates().collect { user ->                 // ← Start listening
        updateUI(user)                                 // ← Called every 5 seconds!
    }                                                  // ← Keeps running until cancelled
}
```

**Beginner explanation:** Flow is like YouTube Live - the video is streaming, and viewers (collect) see it in real-time!

### StateFlow: State Holder

StateFlow is perfect for UI state - it's like a "live" variable that notifies the UI when it changes:

```kotlin
class UserViewModel : ViewModel() {
    
    // ============================================================
    // Step 1: Create the StateFlow
    // ============================================================
    // _uiState = "backing field" - private, can change
    // uiState = public version - read-only from outside
    
    private val _uiState = MutableStateFlow(UserUiState())  // ← Start with empty state
    val uiState: StateFlow<UserUiState> = _uiState         // ← Expose as read-only
    
    // ============================================================
    // Step 2: Update state (UI will automatically refresh!)
    // ============================================================
    fun loadUser(id: String) {
        viewModelScope.launch {                    // ← Start async work
            // Show loading spinner
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            try {
                // Fetch user from API (this suspends - app stays responsive!)
                val user = api.getUser(id)
                
                // Update state - UI automatically refreshes!
                _uiState.value = _uiState.value.copy(
                    user = user,                  // ← Store the user data
                    isLoading = false             // ← Hide loading spinner
                )
            } catch (e: Exception) {
                // Handle error - UI automatically refreshes!
                _uiState.value = _uiState.value.copy(
                    error = e.message,            // ← Store error message
                    isLoading = false             // ← Hide loading spinner
                )
            }
        }
    }
}
```

**Why StateFlow?**
- UI automatically updates when state changes
- No manual observer management
- Survives configuration changes (rotation)
- Exactly one source of truth

### SharedFlow: Events

SharedFlow is perfect for one-time events (things that should only happen once):

```kotlin
class UserViewModel : ViewModel() {
    
    // ============================================================
    // SharedFlow vs StateFlow:
    // - StateFlow: keeps current value (UI state)
    // - SharedFlow: one-time events (navigation, toasts)
    // ============================================================
    
    // Create a SharedFlow for events
    private val _events = MutableSharedFlow<UserEvent>()
    val events: SharedFlow<UserEvent> = _events       // ← Read-only version
    
    // ============================================================
    // Emit an event: "Hey UI, something happened!"
    // ============================================================
    fun onUserClicked(user: User) {
        viewModelScope.launch {
            // "emit" = send this event to all collectors
            _events.emit(UserEvent.NavigateToDetail(user.id))
        }
    }
}

// In Activity/Fragment (Compose)
@Composable
fun UserScreen(viewModel: UserViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    
    // ============================================================
    // Collect events: "Something happened, let's handle it!"
    // ============================================================
    LaunchedEffect(Unit) {  // ← Start collecting when screen opens
        viewModel.events.collect { event ->  // ← Listen for events
            when (event) {
                is UserEvent.NavigateToDetail -> {
                    // Navigate to detail screen
                    navController.navigate("/user/${event.userId}")
                }
                is UserEvent.ShowToast -> {
                    // Show toast message
                    Toast.makeText(context, event.message, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
```

**When to use SharedFlow:**
- Navigate to another screen
- Show a toast/snackbar
- Trigger an animation
- Log analytics
- Anything that should happen exactly once

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
// ============================================================
// The Problem: Memory Leaks
// ============================================================
// If you use GlobalScope, coroutines keep running even after
// user leaves the screen → memory leak, wasted battery!

// ============================================================
// The Solution: viewModelScope
// ============================================================
// viewModelScope is automatically cancelled when ViewModel is destroyed
// This happens when:
// - User navigates away from the screen
// - Activity/Fragment is destroyed
// - App goes to background (sometimes)

class UserViewModel : ViewModel() {
    
    // This coroutine runs forever... but when ViewModel is destroyed,
    // viewModelScope CORRECTLY CANCELS it!
    fun loadData() {
        viewModelScope.launch {           // ← Uses ViewModel's scope
            while (true) {                // ← Keep running
                api.fetchData()           // ← Do work
                delay(1000)               // ← Wait 1 second
            }
        }
        // ↑ When user leaves screen:
        // 1. ViewModel is destroyed
        // 2. viewModelScope.cancel() is called
        // 3. This coroutine stops - NO LEAK!
    }
}
```

**Why this matters:**
- Without viewModelScope: coroutine keeps running = battery drain + memory leak
- With viewModelScope: coroutine stops when not needed = good!

### CoroutineScope Rules (For Beginners)

**Which scope should I use?**

**⚡ viewModelScope (Most Common)**
- When: ViewModel is destroyed (user leaves screen)
- Use for: Loading data for UI
- Example: `viewModelScope.launch { fetchUser() }`
- This is what you'll use 90% of the time!

**🔄 lifecycleScope**
- When: Activity or Fragment is destroyed
- Use for: Tasks that should stop when user leaves the screen
- Example: `lifecycleScope.launch { collectFlow() }`

**⛔ GlobalScope (AVOID!)**
- When: Never automatically cancelled
- Use for: Almost never! Use the others instead
- Why: Hard to test, can cause memory leaks
- Rule: If you're using GlobalScope, think again!

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
