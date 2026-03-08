---
title: "Android Testing: Unit + Compose (Bad vs Good Patterns for Real Apps)"
date: "2026-02-24"
description: "Learn beginner-friendly Android testing with practical BAD vs GOOD examples for ViewModel unit tests and Jetpack Compose UI tests."
tags: ["Android", "Testing", "Unit Testing", "Jetpack Compose", "Kotlin", "TDD"]
---

# Android Testing: Unit + Compose (Bad vs Good Patterns for Real Apps)

If you want to grow as an Android developer (and as a future GDE), testing is a core skill.

The mistake many devs make is writing tests that **pass today but break tomorrow**.

In this post, we'll cover two practical BAD vs GOOD patterns:

1. **Unit testing a ViewModel**
2. **Compose UI testing with stable selectors**

---

## 1) Unit Testing a ViewModel

Let's test a simple login flow.

### BAD ❌: Hardcoded dispatcher + `Thread.sleep()`

```kotlin
// ================================================================
// BAD EXAMPLE
// Why it's bad:
// 1) Uses real Dispatchers.IO in production code under test
// 2) Uses Thread.sleep() to "wait" for async work
// 3) Test becomes slow and flaky
// ================================================================
class LoginViewModel(
    private val repository: AuthRepository
) : ViewModel() {

    private val _state = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val state: StateFlow<LoginUiState> = _state

    fun login(email: String, password: String) {
        // BAD: hardcoded dispatcher makes timing unpredictable in tests
        viewModelScope.launch(Dispatchers.IO) {
            _state.value = LoginUiState.Loading
            val success = repository.login(email, password)
            _state.value = if (success) LoginUiState.Success else LoginUiState.Error
        }
    }
}

class LoginViewModelBadTest {

    @Test
    fun login_success_bad() {
        val fakeRepo = FakeAuthRepository(success = true)
        val vm = LoginViewModel(fakeRepo)

        vm.login("dev@android.com", "123456")

        // BAD: arbitrary wait. Can fail on CI or slow machine.
        Thread.sleep(300)

        assertEquals(LoginUiState.Success, vm.state.value)
    }
}
```

### GOOD ✅: Inject dispatcher + `runTest`

```kotlin
// ================================================================
// GOOD EXAMPLE
// Improvements:
// 1) Dispatcher is injected (easy to control in tests)
// 2) Uses runTest + StandardTestDispatcher for deterministic timing
// 3) Uses advanceUntilIdle() to finish coroutines safely
// ================================================================
class LoginViewModel(
    private val repository: AuthRepository,
    private val ioDispatcher: CoroutineDispatcher
) : ViewModel() {

    private val _state = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val state: StateFlow<LoginUiState> = _state

    fun login(email: String, password: String) {
        viewModelScope.launch(ioDispatcher) {
            _state.value = LoginUiState.Loading
            val success = repository.login(email, password)
            _state.value = if (success) LoginUiState.Success else LoginUiState.Error
        }
    }
}

class LoginViewModelGoodTest {

    // Test dispatcher lets us control coroutine execution
    private val testDispatcher = StandardTestDispatcher()

    @Test
    fun login_success_good() = runTest {
        val fakeRepo = FakeAuthRepository(success = true)

        val vm = LoginViewModel(
            repository = fakeRepo,
            ioDispatcher = testDispatcher
        )

        vm.login("dev@android.com", "123456")

        // Runs queued coroutines until there's no pending work
        advanceUntilIdle()

        assertEquals(LoginUiState.Success, vm.state.value)
    }
}
```

---

## 2) Compose UI Testing

Now let's validate UI behavior for a login screen button.

### BAD ❌: Match by visible text only

```kotlin
// ================================================================
// BAD EXAMPLE
// Why it's bad:
// 1) Text can change with localization (EN -> IT -> ES)
// 2) Minor copy changes break tests even when behavior is correct
// ================================================================
@Composable
fun LoginScreen(onLoginClick: () -> Unit) {
    Button(onClick = onLoginClick) {
        Text("Login")
    }
}

class LoginScreenBadTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun click_login_bad() {
        var clicked = false

        composeRule.setContent {
            LoginScreen(onLoginClick = { clicked = true })
        }

        // BAD: fragile selector based on display text only
        composeRule.onNodeWithText("Login").performClick()

        assertTrue(clicked)
    }
}
```

### GOOD ✅: Stable test tags + semantics assertion

```kotlin
// ================================================================
// GOOD EXAMPLE
// Improvements:
// 1) Uses stable test tags that don't change with localization
// 2) Asserts UI state before interaction
// 3) Keeps tests resilient to wording updates
// ================================================================
object LoginTestTags {
    const val LOGIN_BUTTON = "login_button"
    const val ERROR_TEXT = "error_text"
}

@Composable
fun LoginScreen(
    enabled: Boolean,
    showError: Boolean,
    onLoginClick: () -> Unit
) {
    Column {
        Button(
            onClick = onLoginClick,
            enabled = enabled,
            modifier = Modifier.testTag(LoginTestTags.LOGIN_BUTTON)
        ) {
            Text("Login")
        }

        if (showError) {
            Text(
                text = "Invalid credentials",
                modifier = Modifier.testTag(LoginTestTags.ERROR_TEXT)
            )
        }
    }
}

class LoginScreenGoodTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun click_login_good() {
        var clicked = false

        composeRule.setContent {
            LoginScreen(
                enabled = true,
                showError = false,
                onLoginClick = { clicked = true }
            )
        }

        // Assert state first: button is visible and enabled
        composeRule
            .onNodeWithTag(LoginTestTags.LOGIN_BUTTON)
            .assertIsDisplayed()
            .assertIsEnabled()

        // Then interact
        composeRule.onNodeWithTag(LoginTestTags.LOGIN_BUTTON).performClick()

        assertTrue(clicked)

        // Extra behavior check: error should not be shown in this scenario
        composeRule.onNodeWithTag(LoginTestTags.ERROR_TEXT).assertDoesNotExist()
    }
}
```

---

## Quick Testing Checklist for Android Devs

- Keep business logic in testable classes (ViewModel/use cases)
- Inject dependencies (dispatchers, repositories, clocks)
- Prefer deterministic tests over timing hacks
- In Compose tests, prefer `testTag` for stable selectors
- Assert state **before and after** interactions

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Great Android tests are not just about coverage — they are about confidence. Avoid flaky shortcuts (like Thread.sleep and fragile text selectors), and build deterministic tests with injected dependencies, coroutine test APIs, and stable Compose tags. This is the testing mindset that scales to senior and GDE-level engineering.</p>
</div>
