---
title: "Evolving Architecture: Refactoring Legacy Apps Toward Clean + Modular"
date: "2026-03-09"
description: "A practical, beginner-friendly guide to migrating a legacy Android codebase to clean, modular architecture without stopping feature delivery."
tags: ["android", "architecture", "clean-architecture", "modularization", "refactoring", "kotlin"]
---

Legacy Android apps rarely start "clean".
Most of them grow feature by feature, deadline by deadline.

The good news: you **don’t need a big-bang rewrite**.
You can refactor safely in small steps while shipping features.

In this post, we’ll use a practical migration path that works even for teams with limited time.

## Why legacy apps feel hard to change

Typical legacy symptoms:

- `Activity`/`Fragment` with too much logic
- Network + database + UI code mixed together
- Global singletons and hidden dependencies
- Changes in one screen unexpectedly break another

The root problem is usually **unclear boundaries**.
Refactoring is about restoring boundaries, one slice at a time.

## Migration strategy (safe and incremental)

Use this order:

1. **Stabilize behavior first** (tests around current flows)
2. **Extract seams** (interfaces around unstable dependencies)
3. **Move logic out of UI** (ViewModel + UseCase)
4. **Split modules by responsibility** (`:app`, `:feature:*`, `:core:*`)
5. **Replace old paths gradually** behind the same UI contract

Think “strangler pattern”: new code grows around old code until old code can be removed.

---

## Example 1 — Business logic inside Fragment

### BAD: UI handles business rules and data access directly

```kotlin
class CheckoutFragment : Fragment(R.layout.fragment_checkout) {

    private lateinit var api: OrdersApi
    private lateinit var db: AppDatabase

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        val button = view.findViewById<Button>(R.id.placeOrderButton)

        button.setOnClickListener {
            val items = db.cartDao().getAllSync() // BAD: sync DB call on main thread risk

            // BAD: business rules directly in UI class
            if (items.isEmpty()) {
                Toast.makeText(requireContext(), "Cart is empty", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val total = items.sumOf { it.price * it.quantity }
            if (total < 10.0) {
                Toast.makeText(requireContext(), "Minimum order is $10", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // BAD: networking from Fragment; hard to test and mock
            lifecycleScope.launch {
                val response = api.createOrder(CreateOrderRequest(items))
                if (response.isSuccessful) {
                    db.cartDao().clear() // BAD: side effect hidden in UI layer
                    findNavController().navigate(R.id.action_checkout_to_success)
                } else {
                    Toast.makeText(requireContext(), "Checkout failed", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
```

Problems:

- UI layer knows too much
- No single place to test checkout rules
- Very hard to reuse logic in other screens

### GOOD: Move business rules to UseCase, UI reacts to state

```kotlin
// Domain model independent from UI framework
sealed class PlaceOrderResult {
    data object Success : PlaceOrderResult()
    data object EmptyCart : PlaceOrderResult()
    data object BelowMinimum : PlaceOrderResult()
    data class Failure(val reason: String) : PlaceOrderResult()
}

class PlaceOrderUseCase(
    private val cartRepository: CartRepository,
    private val ordersRepository: OrdersRepository
) {
    suspend operator fun invoke(): PlaceOrderResult {
        val items = cartRepository.getItems() // GOOD: abstraction hides data source details

        if (items.isEmpty()) return PlaceOrderResult.EmptyCart

        val total = items.sumOf { it.price * it.quantity }
        if (total < 10.0) return PlaceOrderResult.BelowMinimum

        return if (ordersRepository.placeOrder(items)) {
            cartRepository.clear()
            PlaceOrderResult.Success
        } else {
            PlaceOrderResult.Failure("Network error")
        }
    }
}

class CheckoutViewModel(
    private val placeOrderUseCase: PlaceOrderUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow("Idle")
    val uiState: StateFlow<String> = _uiState

    fun onPlaceOrderClicked() {
        viewModelScope.launch {
            _uiState.value = when (placeOrderUseCase()) {
                PlaceOrderResult.Success -> "Success"
                PlaceOrderResult.EmptyCart -> "Cart is empty"
                PlaceOrderResult.BelowMinimum -> "Minimum order is $10"
                is PlaceOrderResult.Failure -> "Checkout failed"
            }
        }
    }
}
```

Why this is better:

- Business rules are testable in isolation
- UI becomes simpler and easier to maintain
- You can swap data implementations without rewriting screen logic

---

## Example 2 — God Repository coupled to everything

### BAD: One repository does networking, mapping, caching, and feature flags

```kotlin
class UserRepository(
    private val api: UserApi,
    private val db: AppDatabase,
    private val prefs: SharedPreferences
) {
    suspend fun getUserProfile(userId: String): UserProfileUiModel {
        val forceRefresh = prefs.getBoolean("force_refresh", false)

        // BAD: mixed cache policy + network + mapping in one method
        val entity = if (forceRefresh) {
            val dto = api.getUser(userId)
            val mapped = UserEntity(dto.id, dto.fullName, dto.avatarUrl)
            db.userDao().insert(mapped)
            mapped
        } else {
            db.userDao().findById(userId) ?: run {
                val dto = api.getUser(userId)
                val mapped = UserEntity(dto.id, dto.fullName, dto.avatarUrl)
                db.userDao().insert(mapped)
                mapped
            }
        }

        // BAD: repository returns UI model (wrong layer dependency)
        return UserProfileUiModel(
            title = entity.name,
            image = entity.avatar,
            showPremiumBadge = prefs.getBoolean("premium_enabled", false)
        )
    }
}
```

Problems:

- Single method has too many responsibilities
- Domain and UI concerns are mixed
- Hard to modularize later because dependencies are tangled

### GOOD: Separate concerns with data source + repository + mapper boundaries

```kotlin
// Domain model (safe to share across feature modules)
data class UserProfile(
    val id: String,
    val name: String,
    val avatarUrl: String
)

interface UserRemoteDataSource {
    suspend fun fetchUser(userId: String): UserDto
}

interface UserLocalDataSource {
    suspend fun getUser(userId: String): UserEntity?
    suspend fun saveUser(entity: UserEntity)
}

class DefaultUserRepository(
    private val remote: UserRemoteDataSource,
    private val local: UserLocalDataSource,
    private val mapper: UserMapper
) : UserRepository {

    override suspend fun getUserProfile(userId: String, forceRefresh: Boolean): UserProfile {
        // GOOD: clear cache policy, easy to test with fakes
        val localUser = if (!forceRefresh) local.getUser(userId) else null

        val finalEntity = localUser ?: run {
            val remoteDto = remote.fetchUser(userId)
            val entity = mapper.dtoToEntity(remoteDto)
            local.saveUser(entity)
            entity
        }

        // GOOD: repository returns domain model, not UI model
        return mapper.entityToDomain(finalEntity)
    }
}

class UserProfileUseCase(
    private val repository: UserRepository
) {
    suspend operator fun invoke(userId: String): UserProfile {
        return repository.getUserProfile(userId, forceRefresh = false)
    }
}
```

Why this is better:

- Clear module boundaries (`data` vs `domain` vs `ui`)
- Easier future migration to multi-module setup
- Lower risk refactors because responsibilities are explicit

---

## Practical module target (minimal starter split)

If your app is still monolithic, start with:

- `:app` → app wiring/navigation only
- `:core:common` → shared utils/constants
- `:core:data` → shared data infra (db/network clients)
- `:feature:profile`, `:feature:checkout`, ... → feature-specific UI + domain contracts

Don’t over-modularize early.
Create modules only when they improve ownership, build speed, or team parallel work.

<div class="key-takeaway">
  <strong>Key Takeaway:</strong> Don’t rewrite your legacy app from scratch. Add tests, extract boundaries, move logic into use cases, and split modules gradually. Small, safe refactors compound into clean architecture.
</div>
