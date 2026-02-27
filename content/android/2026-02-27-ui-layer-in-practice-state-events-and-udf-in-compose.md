---
title: "UI Layer in Practice: State, Events, and UDF in Compose"
date: "2026-02-27"
description: "Learn how to structure a Compose UI layer with clear state, one-off events, and unidirectional data flow using practical BAD vs GOOD examples."
tags: ["android", "jetpack-compose", "architecture", "udf", "mvvm"]
---

A clean UI layer is not about writing less code. It is about writing code that is easy to reason about.

When your screen starts to grow, most bugs come from **mixed responsibilities**:

- UI decides business logic
- async work runs directly in composables
- navigation/snackbar/toast events get replayed after rotation

In this guide, we’ll build a practical mental model for **State + Events + UDF** in Jetpack Compose.

---

## 1) The core model

For each screen, think in 3 pieces:

- **State** → long-lived UI data (`loading`, `list`, `error`, `query`)
- **Action/Event from UI** → user intent (`OnRefresh`, `OnRetry`, `OnItemClick`)
- **Effect (one-shot)** → things that should happen once (`Navigate`, `ShowSnackbar`)

UDF (Unidirectional Data Flow) means:

1. UI sends an action
2. ViewModel processes it
3. ViewModel emits new state/effect
4. UI renders state and reacts to effect

No hidden side channels. No random mutations in the UI.

---

## 2) BAD vs GOOD #1 — State ownership

### ❌ BAD: state + async work inside Composable

```kotlin
@Composable
fun UsersScreen(repository: UsersRepository) {
    // BAD: state is owned by Composable and tied to recomposition/lifecycle quirks
    var users by remember { mutableStateOf<List<User>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    // BAD: launching data fetch directly from UI layer creates tight coupling
    LaunchedEffect(Unit) {
        isLoading = true
        error = null
        try {
            // BAD: UI calls repository directly (business/data concerns leak into UI)
            users = repository.getUsers()
        } catch (t: Throwable) {
            error = t.message
        } finally {
            isLoading = false
        }
    }

    when {
        isLoading -> CircularProgressIndicator()
        error != null -> Text("Error: $error")
        else -> LazyColumn {
            items(users) { user -> Text(user.name) }
        }
    }
}
```

Why this hurts:

- Hard to test without Compose runtime
- Hard to reuse logic across screens
- Easy to accidentally refetch on lifecycle/recomposition edge cases

### ✅ GOOD: ViewModel owns state, UI just renders

For beginners, this is the key mindset shift:

- **Composable = renderer** (draws what state says)
- **ViewModel = coordinator** (handles actions and updates state)
- **UseCase = business entry point** (what the app should do)

When you keep these roles separate, bugs become easier to trace.

```kotlin
// Represents the whole screen state in one immutable object.
// GOOD: the UI reads ONE object instead of 3-4 scattered variables.
data class UsersUiState(
    val isLoading: Boolean = false,
    val users: List<User> = emptyList(),
    val errorMessage: String? = null
)

// UI intents only. Keep them simple and explicit.
sealed interface UsersAction {
    data object OnRefreshClicked : UsersAction
    data object OnRetryClicked : UsersAction
}

// Domain contract: this is what ViewModel calls.
// It hides repository details from the UI layer.
fun interface GetUsersUseCase {
    suspend operator fun invoke(): List<User>
}

// Domain implementation example.
class GetUsersUseCaseImpl(
    private val repository: UsersRepository
) : GetUsersUseCase {

    override suspend fun invoke(): List<User> {
        // Place business rules here (sorting/filter/validation), not in UI.
        return repository.getUsers()
            .sortedBy { it.name.lowercase() }
    }
}

class UsersViewModel(
    private val getUsers: GetUsersUseCase
) : ViewModel() {

    // Private mutable state inside ViewModel.
    // Public immutable state for the UI.
    private val _uiState = MutableStateFlow(UsersUiState(isLoading = true))
    val uiState: StateFlow<UsersUiState> = _uiState.asStateFlow()

    init {
        // Initial load happens once when VM is created.
        loadUsers()
    }

    fun onAction(action: UsersAction) {
        when (action) {
            UsersAction.OnRefreshClicked,
            UsersAction.OnRetryClicked -> loadUsers()
        }
    }

    private fun loadUsers() {
        viewModelScope.launch {
            // Start loading and clear old transient error.
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            runCatching { getUsers() }
                .onSuccess { result ->
                    // Success path: update users and stop loading.
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            users = result,
                            errorMessage = null
                        )
                    }
                }
                .onFailure { error ->
                    // Error path: keep old list if useful, surface message.
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Unknown error"
                        )
                    }
                }
        }
    }
}

@Composable
fun UsersRoute(
    viewModel: UsersViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
) {
    // Lifecycle-aware collection avoids collecting while UI is off-screen.
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    // Route layer connects ViewModel with pure UI renderer.
    UsersScreen(
        state = uiState,
        onAction = viewModel::onAction
    )
}

@Composable
fun UsersScreen(
    state: UsersUiState,
    onAction: (UsersAction) -> Unit
) {
    // Pure rendering logic: no direct repository call, no business rule.
    when {
        state.isLoading -> CircularProgressIndicator()

        state.errorMessage != null -> {
            Column {
                Text("Error: ${state.errorMessage}")
                Button(onClick = { onAction(UsersAction.OnRetryClicked) }) {
                    Text("Retry")
                }
            }
        }

        else -> {
            Column {
                Button(onClick = { onAction(UsersAction.OnRefreshClicked) }) {
                    Text("Refresh")
                }
                LazyColumn {
                    items(state.users) { user ->
                        Text(user.name)
                    }
                }
            }
        }
    }
}
```

Why this is beginner-friendly in practice:

- if data is wrong -> inspect UseCase/Repository
- if state transition is wrong -> inspect ViewModel
- if layout is wrong -> inspect Composable

Each bug has a clear home.

---

## 3) BAD vs GOOD #2 — One-off events (snackbar/navigation)

### ❌ BAD: using state for one-time effects

```kotlin
data class LoginUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val navigateToHome: Boolean = false // BAD: event encoded as persistent state
)

class LoginViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState = _uiState.asStateFlow()

    fun onLoginSuccess() {
        // BAD: this can be re-observed after config change and navigate again
        _uiState.update { it.copy(navigateToHome = true) }
    }
}

@Composable
fun LoginScreen(viewModel: LoginViewModel, navController: NavController) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    if (state.navigateToHome) {
        // BAD: can run multiple times on recomposition/restore
        navController.navigate("home")
    }
}
```

### ✅ GOOD: separate effect stream for one-shot actions

```kotlin
sealed interface LoginEffect {
    data object NavigateToHome : LoginEffect
    data class ShowSnackbar(val message: String) : LoginEffect
}

class LoginViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    // GOOD: no replay for past collectors; ideal for one-time UI effects
    private val _effects = MutableSharedFlow<LoginEffect>()
    val effects: SharedFlow<LoginEffect> = _effects

    fun onLoginClicked(email: String, password: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            val success = runCatching { fakeLogin(email, password) }.getOrElse { false }

            _uiState.update { it.copy(isLoading = false) }

            if (success) {
                // GOOD: emitted once, consumed once
                _effects.emit(LoginEffect.NavigateToHome)
            } else {
                _effects.emit(LoginEffect.ShowSnackbar("Invalid credentials"))
            }
        }
    }

    private suspend fun fakeLogin(email: String, password: String): Boolean {
        delay(300)
        return email.isNotBlank() && password.length >= 6
    }
}

@Composable
fun LoginRoute(
    viewModel: LoginViewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
    navController: NavController,
    snackbarHostState: SnackbarHostState
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    // GOOD: collect effects in a coroutine tied to this composable lifecycle
    LaunchedEffect(Unit) {
        viewModel.effects.collect { effect ->
            when (effect) {
                LoginEffect.NavigateToHome -> navController.navigate("home")
                is LoginEffect.ShowSnackbar -> snackbarHostState.showSnackbar(effect.message)
            }
        }
    }

    LoginScreen(
        state = state,
        onLoginClick = viewModel::onLoginClicked
    )
}
```

---

## 4) Bonus — Multi-UseCase ViewModel (real-world pattern)

As apps grow, one screen usually needs more than one business action.

For example, a Users screen may need to:

- load users (initial data)
- refresh users (manual retry or pull-to-refresh)
- delete a user
- toggle user favorite status

In that case, a ViewModel can depend on multiple use cases **without becoming a God object**, as long as responsibilities stay clear.

```kotlin
data class UsersUiState(
    val isLoading: Boolean = false,
    val users: List<User> = emptyList(),
    val errorMessage: String? = null
)

sealed interface UsersAction {
    data object OnScreenStarted : UsersAction
    data object OnRefreshClicked : UsersAction
    data class OnDeleteClicked(val userId: String) : UsersAction
    data class OnFavoriteClicked(val userId: String) : UsersAction
}

class UsersViewModel(
    private val getUsers: GetUsersUseCase,
    private val refreshUsers: RefreshUsersUseCase,
    private val deleteUser: DeleteUserUseCase,
    private val toggleFavorite: ToggleFavoriteUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow(UsersUiState())
    val uiState: StateFlow<UsersUiState> = _uiState.asStateFlow()

    fun onAction(action: UsersAction) {
        when (action) {
            UsersAction.OnScreenStarted -> loadUsers()
            UsersAction.OnRefreshClicked -> refresh()
            is UsersAction.OnDeleteClicked -> delete(action.userId)
            is UsersAction.OnFavoriteClicked -> favorite(action.userId)
        }
    }

    private fun loadUsers() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            runCatching { getUsers() }
                .onSuccess { users ->
                    _uiState.update { it.copy(isLoading = false, users = users) }
                }
                .onFailure { t ->
                    _uiState.update { it.copy(isLoading = false, errorMessage = t.message) }
                }
        }
    }

    private fun refresh() {
        viewModelScope.launch {
            // refresh use case might sync remote->local, then we reload state
            runCatching { refreshUsers() }
                .onSuccess { loadUsers() }
                .onFailure { t ->
                    _uiState.update { it.copy(errorMessage = t.message ?: "Refresh failed") }
                }
        }
    }

    private fun delete(userId: String) {
        viewModelScope.launch {
            runCatching { deleteUser(userId) }
                .onSuccess { loadUsers() }
                .onFailure { t ->
                    _uiState.update { it.copy(errorMessage = t.message ?: "Delete failed") }
                }
        }
    }

    private fun favorite(userId: String) {
        viewModelScope.launch {
            runCatching { toggleFavorite(userId) }
                .onFailure { t ->
                    _uiState.update { it.copy(errorMessage = t.message ?: "Update failed") }
                }
        }
    }
}
```

### Why this stays clean

- ViewModel coordinates actions and state transitions.
- Each use case keeps business logic in Domain layer.
- Data layer details remain hidden behind repository interfaces.

A good rule: **many use cases are fine; many responsibilities in one class are not**.

---

## 5) Practical checklist for your next screen

Before merging a screen, verify:

- Is all long-lived UI data inside a `UiState` data class?
- Are all user intents modeled as actions (`sealed interface` or similar)?
- Are one-shot operations (navigation/snackbar) in a separate effect stream?
- Does the composable render state only (no direct repository/data calls)?

If yes, your screen will be easier to test, debug, and scale.

<div class="key-takeaway">
  <strong>Key Takeaway</strong>
  <p>
    In Compose, stability comes from clear ownership: <em>ViewModel owns state</em>, UI sends actions,
    and one-time effects travel in a separate stream. This simple UDF discipline removes most "random"
    UI bugs before they happen.
  </p>
</div>
