---
title: "Compose StateHolder vs ViewModel: When to Use Which"
date: "2026-02-13"
description: "Stop putting everything in ViewModel. Learn when to use local StateHolder (remember { ... }) vs when you need a ViewModel for proper lifecycle awareness."
tags: ["Compose", "Architecture", "State Management"]
---

When building screens in Jetpack Compose, a common source of confusion is deciding where to hold state:

- **Local State** (`remember { MyStateHolder() }`)
- **ViewModel** (`viewModel()`)

Choosing the wrong one leads to bugs, unnecessary recompositions, or lost data on configuration changes.

## 1) What is a StateHolder?

A `StateHolder` is simply a class that holds UI state and exposes it via mutable/read-only properties.

```kotlin
// Simple state holder for a form
class LoginFormState(
    val username: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val error: String? = null
) {
    // Business logic encapsulated here
    fun updateUsername(value: String) {
        username = value
    }
}
```

**Key point:** A `StateHolder` doesn't know anything about the Android lifecycle.

---

## 2) Local State: `remember { MyStateHolder() }`

Use this when:

- The state is **only relevant for this screen**.
- You **don't need** the state to survive configuration changes (e.g., theme toggle, simple form inputs).
- You want to **avoid ViewModel overhead** (tests, DI setup).

### ✅ GOOD: Local StateHolder for simple screen state

```kotlin
@Composable
fun LoginScreen() {
    // ✅ GOOD: Local state that resets on configuration change.
    // Perfect for: theme, temporary form data, simple toggles.
    val formState = remember { LoginFormState() }

    Column {
        TextField(
            value = formState.username,
            onValueChange = { formState.updateUsername(it) },
            label = { Text("Username") }
        )
        // ...
    }
}
```

**Why it's good:**
- No DI, no ViewModel: dead simple.
- Cleans up automatically when the screen leaves the composition.
- Fast to test (just instantiate the class).

**Why it's bad (sometimes):**
- If the user rotates the device, `formState.username` will **reset to empty**.
- If this is a "draft" screen, you might lose user input.

---

## 3) ViewModel: The Lifecycle-Aware StateHolder

Use this when:

- The state **must survive configuration changes** (screen rotation, dark mode switch).
- You need to **share state** between multiple composables or screens.
- You need to **trigger side effects** (navigation, snackbars) based on state.

### ✅ GOOD: ViewModel for state that must persist

```kotlin
// ViewModel holds state across configuration changes
class LoginViewModel : ViewModel() {
    // This state survives screen rotation!
    val formState = MutableStateFlow(LoginFormState())

    fun onUsernameChange(value: String) {
        formState.value = formState.value.copy(username = value)
    }
}

@Composable
fun LoginScreen(viewModel: LoginViewModel = viewModel()) {
    // ✅ GOOD: ViewModel provides lifecycle-aware state.
    // State persists across rotation, etc.
    val formState by viewModel.formState.collectAsState()

    Column {
        TextField(
            value = formState.username,
            onValueChange = { viewModel.onUsernameChange(it) },
            label = { Text("Username") }
        )
        // ...
    }
}
```

**Why it's good:**
- Survives `Activity.onCreate()` calls (configuration changes).
- Built-in `SavedStateHandle` integration (automatic `Bundle` restoration).

**Why it's overkill (sometimes):**
- Adds boilerplate (DI, ViewModel factory).
- Harder to test in isolation without mocking frameworks.

---

## 4) Common Mistake: ViewModel for "screen-local" state

### ❌ BAD: Over-engineering with ViewModel for a toggle

```kotlin
// ❌ BAD: Using ViewModel for a simple toggle that doesn't need to survive rotation?
// Maybe. But if it's just "isDialogOpen", maybe local is fine.
class MyViewModel : ViewModel() {
    val isDialogOpen = MutableStateFlow(false)
}

@Composable
fun MyScreen(viewModel: MyViewModel = viewModel()) {
    val isOpen by viewModel.isDialogOpen.collectAsState()

    if (isOpen) {
        MyDialog(onDismiss = { viewModel.isDialogOpen.value = false })
    }
}
```

**Is this bad?** Not necessarily.
- If you want the dialog to stay open during rotation → ViewModel is correct.
- If you don't care about rotation → `remember { mutableStateOf(false) }` is simpler.

**Rule of thumb:** Ask yourself: *"Do I care if this value resets on rotation?"*

- **Yes** → ViewModel (or `rememberSaveable`).
- **No** → `remember { ... }`.

---

## 5) Hybrid Approach: StateHolder inside ViewModel

For complex screens, you can still use a `StateHolder` class, but **host it inside a ViewModel**. This gives you testability + lifecycle safety.

```kotlin
// State logic encapsulated in a separate class (testable!)
class LoginFormState(
    val username: String = "",
    val password: String = ""
) {
    // Complex validation logic
    val isValid: Boolean
        get() = username.isNotBlank() && password.length >= 8
}

// ViewModel hosts the StateHolder
class LoginViewModel : ViewModel() {
    // StateHolder lives here, survives rotation
    val formState = MutableStateFlow(LoginFormState())
}

@Composable
fun LoginScreen(viewModel: LoginViewModel = viewModel()) {
    val formState by viewModel.formState.collectAsState()

    Button(
        enabled = formState.isValid,
        onClick = { /* login */ }
    ) {
        Text("Login")
    }
}
```

**Benefits:**
- State logic is in a plain Kotlin class (easy to unit test).
- ViewModel provides lifecycle safety.
- `StateFlow` is observable from Compose.

---

## 6) Summary Decision Tree

```
Do I need this state to SURVIVE rotation/configuration change?
│
├─ YES → Do I need to share this state with ANOTHER screen?
│   │
│   ├─ YES → Use ViewModel (+ SavedStateHandle if needed)
│   │
│   └─ NO → Use ViewModel (or rememberSaveable for single screen)
│
└─ NO → Do I need to share this state with another COMPOSABLE in THIS screen?
    │
    ├─ YES → Use `remember { MyStateHolder() }`
    │
    └─ NO → Use local `var` or `mutableStateOf()`
```

---

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">
    Don't default to ViewModel. Use <code>remember { MyStateHolder() }</code> for screen-local, rotation-agnostic state. Promote to <code>ViewModel</code> only when you need lifecycle safety, state sharing, or side-effect triggers.
  </p>
</div>
