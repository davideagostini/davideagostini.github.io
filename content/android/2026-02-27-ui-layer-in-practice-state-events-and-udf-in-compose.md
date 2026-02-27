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

```kotlin
// Represents the whole screen state in one immutable object
// GOOD: single source of truth for the UI

data class UsersUiState(
    val isLoading: Boolean = false,
    val users: List<User> = emptyList(),
    val errorMessage: String? = null
)

sealed interface UsersAction {
    data object OnRefreshClicked : UsersAction
    data object OnRetryClicked : UsersAction
}

class UsersViewModel(
    private val getUsers: GetUsersUseCase
) : ViewModel() {

    // GOOD: private mutable + public immutable exposure
    private val _uiState = MutableStateFlow(UsersUiState(isLoading = true))
    val uiState: StateFlow<UsersUiState> = _uiState.asStateFlow()

    init {
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
            // GOOD: update state atomically and predictably
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            runCatching { getUsers() }
                .onSuccess { result ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            users = result,
                            errorMessage = null
                        )
                    }
                }
                .onFailure { error ->
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
    // GOOD: lifecycle-aware collection to avoid off-screen updates
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

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
                    items(state.users) { user -> Text(user.name) }
                }
            }
        }
    }
}
```

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

## 4) Practical checklist for your next screen

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
