---
title: "Domain Layer Basics: Use Cases, Business Rules, and Testability"
date: "2026-02-28"
description: "Learn what the Android Domain layer does, how to write focused Use Cases, and how BAD vs GOOD patterns improve clarity and testability."
tags: ["android", "architecture", "clean-architecture", "domain-layer", "testing"]
---

If your ViewModel feels heavy, your Domain layer is probably missing.

The Domain layer is where your app’s **business rules** live.
Not Retrofit details. Not Room queries. Not Compose UI rendering.

Think of it this way:

- **UI layer** = what the user sees and triggers
- **Domain layer** = what the app should do (rules)
- **Data layer** = how data is fetched/stored

When those concerns get mixed, code becomes fragile and hard to test.

---

## 1) What is a Use Case?

A **Use Case** is a small class that represents one business action:

- `GetUserProfileUseCase`
- `CheckoutCartUseCase`
- `ValidatePasswordUseCase`

A good Use Case usually:

- has one clear responsibility
- hides data-layer details from the UI
- returns a clear result (`Success/Error`, value, etc.)
- is easy to unit test without Android framework

---

## 2) BAD vs GOOD #1 — Business rules inside ViewModel

### ❌ BAD: ViewModel does everything

```kotlin
class CheckoutViewModel(
    private val cartRepository: CartRepository,
    private val paymentRepository: PaymentRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CheckoutUiState())
    val uiState: StateFlow<CheckoutUiState> = _uiState.asStateFlow()

    fun onCheckoutClicked(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            try {
                // BAD: ViewModel is calculating business rules directly.
                val cart = cartRepository.getCart(userId)

                // BAD: domain rule (minimum order amount) is in UI layer.
                if (cart.totalPrice < 10.0) {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = "Minimum order is €10"
                        )
                    }
                    return@launch
                }

                // BAD: discount logic is also in ViewModel.
                val discount = if (cart.items.size >= 5) 0.15 else 0.0
                val finalPrice = cart.totalPrice * (1 - discount)

                // BAD: payment call + business decisions mixed together.
                val paymentResult = paymentRepository.pay(
                    userId = userId,
                    amount = finalPrice
                )

                _uiState.update {
                    it.copy(isLoading = false, orderPlaced = paymentResult.success)
                }
            } catch (t: Throwable) {
                _uiState.update {
                    it.copy(isLoading = false, errorMessage = t.message ?: "Checkout failed")
                }
            }
        }
    }
}
```

Why this hurts:

- ViewModel becomes a God object
- business rules are duplicated across screens
- testing requires ViewModel setup for every rule variation

### ✅ GOOD: Move rules into `CheckoutCartUseCase`

```kotlin
// Domain model representing the result of checkout.
sealed interface CheckoutResult {
    data class Success(val orderId: String) : CheckoutResult
    data class Failure(val reason: String) : CheckoutResult
}

// Domain-level repository contracts.
// GOOD: Domain depends on interfaces, not concrete Retrofit/Room code.
interface CartGateway {
    suspend fun getCart(userId: String): Cart
}

interface PaymentGateway {
    suspend fun pay(userId: String, amount: Double): PaymentResponse
}

class CheckoutCartUseCase(
    private val cartGateway: CartGateway,
    private val paymentGateway: PaymentGateway
) {
    suspend operator fun invoke(userId: String): CheckoutResult {
        val cart = cartGateway.getCart(userId)

        // GOOD: business rule belongs to Domain layer.
        if (cart.totalPrice < 10.0) {
            return CheckoutResult.Failure("Minimum order is €10")
        }

        // GOOD: keep all pricing rules in one place.
        val discount = if (cart.items.size >= 5) 0.15 else 0.0
        val finalPrice = cart.totalPrice * (1 - discount)

        val paymentResponse = paymentGateway.pay(userId, finalPrice)

        return if (paymentResponse.success) {
            CheckoutResult.Success(orderId = paymentResponse.orderId)
        } else {
            CheckoutResult.Failure("Payment rejected")
        }
    }
}

class CheckoutViewModel(
    private val checkoutCart: CheckoutCartUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(CheckoutUiState())
    val uiState: StateFlow<CheckoutUiState> = _uiState.asStateFlow()

    fun onCheckoutClicked(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            when (val result = checkoutCart(userId)) {
                is CheckoutResult.Success -> {
                    // GOOD: ViewModel only maps domain result to UI state.
                    _uiState.update {
                        it.copy(isLoading = false, orderPlaced = true, orderId = result.orderId)
                    }
                }
                is CheckoutResult.Failure -> {
                    _uiState.update {
                        it.copy(isLoading = false, errorMessage = result.reason)
                    }
                }
            }
        }
    }
}
```

---

## 3) BAD vs GOOD #2 — Hard-to-test Use Case vs test-friendly Use Case

### ❌ BAD: hidden dependencies and time calls inside logic

```kotlin
class IsStoreOpenUseCase {

    suspend operator fun invoke(): Boolean {
        // BAD: reads system time directly, hard to control in tests.
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)

        // BAD: magic numbers are unclear and easy to misuse.
        val isBusinessHour = hour >= 9 && hour <= 18

        // BAD: direct network/static access from inside Use Case.
        val isHoliday = RemoteConfigApi.isHolidayToday()

        return isBusinessHour && !isHoliday
    }
}
```

Why this hurts:

- unit tests become flaky (depends on real clock)
- needs complex mocking for static/global objects
- business rules are not explicit

### ✅ GOOD: inject dependencies and model rules clearly

```kotlin
// Small abstraction for current time.
// GOOD: tests can provide fake clock values.
fun interface ClockProvider {
    fun currentHour24(): Int
}

// Abstraction for holiday checks.
// Could be backed by remote config, local db, or API.
fun interface HolidayPolicy {
    suspend fun isHolidayToday(): Boolean
}

class IsStoreOpenUseCase(
    private val clockProvider: ClockProvider,
    private val holidayPolicy: HolidayPolicy,
    private val openingHour: Int = 9,
    private val closingHourExclusive: Int = 19
) {
    suspend operator fun invoke(): Boolean {
        val hour = clockProvider.currentHour24()

        // GOOD: explicit and readable rule.
        val isBusinessHour = hour in openingHour until closingHourExclusive

        val isHoliday = holidayPolicy.isHolidayToday()

        return isBusinessHour && !isHoliday
    }
}

// Example unit tests (pure Kotlin, no Android runtime).
class IsStoreOpenUseCaseTest {

    @Test
    fun `returns true during business hours on non-holiday`() = runTest {
        val useCase = IsStoreOpenUseCase(
            clockProvider = ClockProvider { 11 },
            holidayPolicy = HolidayPolicy { false }
        )

        val result = useCase()

        assertTrue(result)
    }

    @Test
    fun `returns false on holiday even during business hours`() = runTest {
        val useCase = IsStoreOpenUseCase(
            clockProvider = ClockProvider { 11 },
            holidayPolicy = HolidayPolicy { true }
        )

        val result = useCase()

        assertFalse(result)
    }
}
```

---

## 4) Practical structure you can start today

A simple package layout:

- `domain/usecase/` → one class per business action
- `domain/model/` → business-centric models (optional)
- `domain/repository/` or `gateway/` → interfaces only

Keep it lightweight. You don’t need 200 classes.
You just need clear boundaries.

---

## 5) Quick checklist for Domain layer quality

Before merging a feature, ask:

- Are business rules outside Composables/ViewModels?
- Does each Use Case have one reason to change?
- Are Domain dependencies interfaces (not concrete data implementations)?
- Can I test Use Cases with plain unit tests?

If yes, your architecture is moving in the right direction.

<div class="key-takeaway">
  <strong>Key Takeaway</strong>
  <p>
    The Domain layer is your app’s rulebook. Keep business logic in focused Use Cases,
    let ViewModels orchestrate UI state, and hide data details behind interfaces.
    This gives you cleaner code today and far easier testing as your app scales.
  </p>
</div>
