---
title: "MVVM Done Right: ViewModel Contracts, Side Effects, and Lifecycle"
date: "2026-03-02"
description: "A beginner-friendly guide to building robust MVVM screens in Android with clear UI contracts, one-off side effects, and lifecycle-safe collection in Compose."
tags: ["android", "kotlin", "jetpack-compose", "mvvm", "architecture", "viewmodel"]
---

MVVM is still one of the most practical patterns in Android, but many apps suffer from "MVVM in name only":

- `ViewModel` knows too much about UI widgets
- one-off events (navigation, toast, snackbar) are stored as state
- flows are collected in unsafe lifecycle moments

In this note, we’ll build a **clean, beginner-friendly MVVM setup** with:

1. **UI Contract** (State + Event + Effect)
2. **Predictable state updates**
3. **Lifecycle-safe effect collection in Compose**

---

## 1) Define a clear ViewModel contract

A contract makes your screen behavior explicit and testable.

### ❌ BAD: vague contract, nullable fields, implicit actions

```kotlin
// BAD: Too many nullable values and no clear user intent model.
// The UI has to guess what to do.
data class LoginUiState(
    val isLoading: Boolean = false,
    val username: String? = null,
    val password: String? = null,
    val error: String? = null,
    val navigateToHome: Boolean = false // BAD: one-off event stored as state
)

class LoginViewModel : ViewModel() {
    private val _state = MutableStateFlow(LoginUiState())
    val state: StateFlow<LoginUiState> = _state

    fun login(username: String, password: String) {
        _state.value = _state.value.copy(isLoading = true)

        viewModelScope.launch {
            // Fake API
            delay(800)

            if (username == "demo" && password == "1234") {
                // BAD: UI might navigate again on recomposition/process restore
                _state.value = _state.value.copy(
                    isLoading = false,
                    navigateToHome = true
                )
            } else {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = "Invalid credentials"
                )
            }
        }
    }
}
```

### ✅ GOOD: explicit State + Event + Effect

```kotlin
// GOOD: UI state contains only persistent, renderable information.
data class LoginUiState(
    val email: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

// GOOD: Events model what the user (or UI) does.
sealed interface LoginEvent {
    data class EmailChanged(val value: String) : LoginEvent
    data class PasswordChanged(val value: String) : LoginEvent
    data object SubmitClicked : LoginEvent
}

// GOOD: Effects model one-off actions (navigation, toasts, snackbars).
sealed interface LoginEffect {
    data object NavigateToHome : LoginEffect
    data class ShowToast(val message: String) : LoginEffect
}

class LoginViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState

    private val _effects = MutableSharedFlow<LoginEffect>()
    val effects: SharedFlow<LoginEffect> = _effects

    fun onEvent(event: LoginEvent) {
        when (event) {
            is LoginEvent.EmailChanged -> {
                _uiState.update { it.copy(email = event.value, errorMessage = null) }
            }
            is LoginEvent.PasswordChanged -> {
                _uiState.update { it.copy(password = event.value, errorMessage = null) }
            }
            LoginEvent.SubmitClicked -> submitLogin()
        }
    }

    private fun submitLogin() {
        val current = _uiState.value

        if (current.email.isBlank() || current.password.isBlank()) {
            viewModelScope.launch {
                _effects.emit(LoginEffect.ShowToast("Please fill all fields"))
            }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }

            delay(800) // Simulated API call

            val success = current.email == "demo@site.com" && current.password == "1234"

            if (success) {
                _uiState.update { it.copy(isLoading = false) }
                _effects.emit(LoginEffect.NavigateToHome)
            } else {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        errorMessage = "Invalid credentials"
                    )
                }
            }
        }
    }
}
```

Why this is better:

- **State** is stable and renderable
- **Events** describe intent clearly
- **Effects** are one-time actions, so they don’t replay like state

---

## 2) Handle side effects with lifecycle awareness in Compose

One of the most common mistakes is collecting flows without lifecycle control, which can leak work or duplicate events.

### ❌ BAD: collecting effects in composition scope without lifecycle APIs

```kotlin
@Composable
fun LoginScreenBad(viewModel: LoginViewModel, onNavigateHome: () -> Unit) {
    // BAD: This may continue collecting when UI is not STARTED,
    // depending on surrounding composition/lifecycle behavior.
    LaunchedEffect(Unit) {
        viewModel.effects.collect { effect ->
            when (effect) {
                LoginEffect.NavigateToHome -> onNavigateHome()
                is LoginEffect.ShowToast -> {
                    // show toast
                }
            }
        }
    }

    // ... UI omitted
}
```

### ✅ GOOD: lifecycle-safe state + effect collection

```kotlin
@Composable
fun LoginScreen(
    viewModel: LoginViewModel,
    onNavigateHome: () -> Unit,
    showToast: (String) -> Unit
) {
    // GOOD: collect state in a lifecycle-aware way (STARTED by default).
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    val lifecycleOwner = LocalLifecycleOwner.current

    // GOOD: collect effects only while lifecycle is at least STARTED.
    LaunchedEffect(viewModel.effects, lifecycleOwner) {
        lifecycleOwner.lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            viewModel.effects.collect { effect ->
                when (effect) {
                    LoginEffect.NavigateToHome -> onNavigateHome()
                    is LoginEffect.ShowToast -> showToast(effect.message)
                }
            }
        }
    }

    Column(modifier = Modifier.padding(16.dp)) {
        OutlinedTextField(
            value = uiState.email,
            onValueChange = { viewModel.onEvent(LoginEvent.EmailChanged(it)) },
            label = { Text("Email") }
        )

        OutlinedTextField(
            value = uiState.password,
            onValueChange = { viewModel.onEvent(LoginEvent.PasswordChanged(it)) },
            label = { Text("Password") }
        )

        if (uiState.errorMessage != null) {
            Text(
                text = uiState.errorMessage,
                color = Color.Red,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        Button(
            onClick = { viewModel.onEvent(LoginEvent.SubmitClicked) },
            enabled = !uiState.isLoading,
            modifier = Modifier.padding(top = 12.dp)
        ) {
            Text(if (uiState.isLoading) "Loading..." else "Login")
        }
    }
}
```

---

## Practical rules you can apply today

- Keep `UiState` for **what to render now**
- Keep one-off actions in a separate `Effect` stream
- Use a single `onEvent(...)` entry point in the ViewModel
- Collect state/effects with lifecycle-aware APIs in Compose

These small rules remove lots of flaky behavior and make your screen easy to test.

<div class="key-takeaway">
  <strong>Key Takeaway:</strong> In MVVM, state is for durable UI data, events are user intent, and effects are one-time actions. If you separate these clearly and collect them with lifecycle awareness, your Compose screens become predictable, testable, and production-ready.
</div>
