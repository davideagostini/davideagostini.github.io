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

### Pattern 1: Repository with Flow (Cache-First)

This pattern shows how to get data from local cache first, then update from network. It's the most common pattern in production apps!

```kotlin
class UserRepository(
    private val api: UserApi,        // ← Network API (Retrofit)
    private val dao: UserDao          // ← Local database (Room)
) {
    // ============================================================
    // HOW IT WORKS:
    // 1. First, check local database (instant, no network)
    // 2. If found, emit cached data immediately (UI shows fast!)
    // 3. Then fetch from network in background
    // 4. Update UI with fresh data
    // 5. Save fresh data to local cache
    // ============================================================
    
    fun getUser(id: String): Flow<User> = callbackFlow {
        // Step 1: Check local cache first (FAST!)
        val cached = dao.getUser(id)
        
        // If we have cached data, show it immediately
        if (cached != null) {
            // trySend = emit a value to collectors (but don't close the flow)
            trySend(cached)  // ← UI updates instantly with cached data!
        }
        
        // Step 2: Fetch from network (in background)
        try {
            val user = api.getUser(id)  // ← Network call
            dao.save(user)               // ← Save to cache for next time
            trySend(user)                // ← UI updates with fresh data
        } catch (e: Exception) {
            // If network fails AND we had no cache, close with error
            if (cached == null) {
                close(e)  // ← Flow closes with error
            }
            // If we had cache, we already showed it - user sees stale data but no error!
        }
        
        // Step 3: Keep flow open for future updates
        // awaitClose = "don't close the flow yet, wait for more data"
        awaitClose { 
            // This runs when collector stops listening
            // Good for cleaning up resources
        }
    }
}

// ============================================================
// HOW TO USE THIS IN YOUR APP:
// ============================================================

// In ViewModel:
class UserDetailViewModel(
    private val repository: UserRepository
) : ViewModel() {
    
    // This automatically collects the flow and updates UI
    val user: StateFlow<User?> = repository.getUser("user123")
        .stateIn(
            viewModelScope,           // ← Cancel when ViewModel dies
            SharingStarted.WhileSubscribed(5000),  // ← Keep last value for 5 sec
            null                     // ← Initial value
        )
}

// In Compose Screen:
@Composable
fun UserDetailScreen(viewModel: UserDetailViewModel = hiltViewModel()) {
    val user by viewModel.user.collectAsState()
    
    if (user != null) {
        // Shows cached data instantly, then updates with fresh data
        UserCard(user = user!!)
    } else {
        // This happens if: no cache + still loading + no error
        CircularProgressIndicator()
    }
}
```

### Pattern 2: Combine Multiple Flows (Search)

This pattern is perfect for search - it combines multiple data sources and handles typing delays!

```kotlin
// ============================================================
// REAL-WORLD USE CASE: Search Screen
// User types → wait a bit → search users AND products
// ============================================================

class SearchViewModel(
    private val userRepository: UserRepository,
    private val productRepository: ProductRepository
) : ViewModel() {
    
    // ============================================================
    // Step 1: Create a MutableStateFlow for user input
    // This holds what the user types in the search box
    // ============================================================
    private val _searchQuery = MutableStateFlow("")
    
    // ============================================================
    // Step 2: Transform the query into results
    // This chain runs automatically whenever _searchQuery changes
    // ============================================================
    val searchResults: Flow<SearchResults> = _searchQuery
        // debounce(300) = "Wait 300ms after user stops typing"
        // WHY? Avoid searching on every keystroke!
        // User types "hel" → wait → "hel" → search!
        .debounce(300)  
        
        // distinctUntilChanged() = "Don't search if same as last time"
        // WHY? Avoid duplicate searches!
        .distinctUntilChanged()
        
        // flatMapLatest = "Cancel previous search, start new one"
        // WHY? If user types new letter, cancel old search!
        .flatMapLatest { query ->
            // If query is empty, return empty results
            if (query.isBlank()) {
                flowOf(SearchResults.empty())  // ← Emit empty, stop here
            } else {
                // combine() = "Run both searches in parallel, emit when both done"
                combine(
                    userRepository.search(query),      // ← Search users
                    productRepository.search(query)     // ← Search products
                ) { users, products ->
                    // This runs when BOTH searches complete
                    SearchResults(users, products)
                }
            }
        }
        
        // stateIn = "Convert Flow to StateFlow with initial value"
        // - viewModelScope = cancel when ViewModel dies
        // - WhileSubscribed(5000) = keep last value for 5 seconds after leaving screen
        // - SearchResults.empty() = initial value (before any search)
        .stateIn(
            viewModelScope,
            SharingStarted.WhileSubscribed(5000),
            SearchResults.empty()
        )
    
    // ============================================================
    // Step 3: Function to update query (called from UI)
    // ============================================================
    fun onQueryChanged(newQuery: String) {
        _searchQuery.value = newQuery  // ← This triggers the whole chain above!
    }
}

// ============================================================
// HOW TO USE THIS IN COMPOSE:
// ============================================================

@Composable
fun SearchScreen(
    viewModel: SearchViewModel = hiltViewModel()
) {
    var query by remember { mutableStateOf("") }
    
    // Collect results - automatically updates when results change!
    val results by viewModel.searchResults.collectAsState()
    
    Column {
        // Search input
        OutlinedTextField(
            value = query,
            onValueChange = { 
                query = it
                viewModel.onQueryChanged(it)  // ← Trigger search
            },
            placeholder = { Text("Search users and products...") }
        )
        
        // Show results
        if (results.isLoading) {
            CircularProgressIndicator()
        } else {
            // Show users
            results.users.forEach { user ->
                UserItem(user = user)
            }
            // Show products  
            results.products.forEach { product ->
                ProductItem(product = product)
            }
        }
    }
}
```

### Pattern 3: Loading State (Sealed Class)

This pattern handles the three states every screen has: Loading, Success, and Error. It's battle-tested in production!

```kotlin
// ============================================================
// WHY USE A SEALED CLASS?
// ============================================================
// Sealed class = "This can ONLY be one of these states"
// Compiler knows ALL possible states → No forgot cases!
// 
// Instead of separate variables like:
//   var isLoading = false
//   var user: User? = null
//   var error: String? = null
// 
// We have ONE state that can only be:
//   - Loading (before data arrives)
//   - Success (data arrived)
//   - Error (something went wrong)
// ============================================================

sealed class UiState<out T> {
    // State 1: Still loading (no data yet)
    object Loading : UiState<Nothing>()
    
    // State 2: Got data successfully
    // data class = can hold the actual data
    data class Success<T>(val data: T) : UiState<T>()
    
    // State 3: Something went wrong
    // data class = can hold error message
    data class Error(val message: String) : UiState<Nothing>()
}

// ============================================================
// VIEWMODEL: Updates the state
// ============================================================
class UserViewModel(
    private val api: UserApi  // ← Your API service
) : ViewModel() {
    
    // Start with Loading state (before any data!)
    private val _userState = MutableStateFlow<UiState<User>>(UiState.Loading)
    val userState: StateFlow<UiState<User>> = _userState
    
    // Function to load user - called from UI
    fun loadUser(id: String) {
        viewModelScope.launch {
            // Step 1: Show loading
            _userState.value = UiState.Loading
            
            // Step 2: Try to fetch data
            _userState.value = try {
                // This can throw (network error, etc.)
                val user = api.getUser(id)
                UiState.Success(user)  // ← Success! Show data
            } catch (e: Exception) {
                // Catch any error
                UiState.Error(e.message ?: "Unknown error")  // ← Error! Show message
            }
        }
    }
}

// ============================================================
// COMPOSE SCREEN: Handle each state
// ============================================================
@Composable
fun UserScreen(
    userId: String,
    viewModel: UserViewModel = hiltViewModel()
) {
    // Collect state from ViewModel
    val state by viewModel.userState.collectAsState()
    
    // ============================================================
    // when = "handle each possible state"
    // Compiler ensures we handle ALL states!
    // ============================================================
    when (val current = state) {
        // State 1: Loading - show spinner
        is UiState.Loading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
        
        // State 2: Success - show the data
        is UiState.Success -> {
            // current.data = the actual User object!
            UserCard(user = current.data)
        }
        
        // State 3: Error - show error message
        is UiState.Error -> {
            // current.message = the error message!
            ErrorMessage(
                message = current.message,
                onRetry = { viewModel.loadUser(userId) }  // ← Allow retry!
            )
        }
    }
}

// ============================================================
// ERROR COMPONENT: Reusable error display
// ============================================================
@Composable
fun ErrorMessage(
    message: String,
    onRetry: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Show error icon/message
        Text(
            text = "Oops! Something went wrong",
            style = MaterialTheme.typography.titleMedium
        )
        Text(
            text = message,  // ← The actual error from API
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.error
        )
        
        // Retry button
        Button(
            onClick = onRetry,  // ← Try again!
            modifier = Modifier.padding(top = 16.dp)
        ) {
            Text("Try Again")
        }
    }
}
```

**Why this pattern is great:**
- ✅ One state variable instead of many
- ✅ Impossible to forget a state (compiler checks!)
- ✅ Clean UI code with `when`
- ✅ Easy to add retry
- ✅ Type-safe (know exactly what data looks like)

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
