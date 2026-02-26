---
title: "Android Architecture Fundamentals: Layers, Boundaries, and Data Flow"
date: "2026-02-26"
description: "A practical guide to Android app architecture from first principles: how to structure UI, Domain, and Data layers with clean boundaries and predictable data flow."
tags: ["Android", "Architecture", "Clean Architecture", "Compose", "Kotlin"]
---

Most Android architecture problems are not caused by "bad code."  
They are caused by **unclear boundaries**.

When boundaries are weak, you get:
- ViewModels doing repository + mapping + validation + analytics
- random side effects in composables
- duplicated business rules in multiple screens
- fragile tests and risky refactors

In this post, we start from the basis and build a practical architecture model you can use in real apps.

## 1) The core goal of architecture

Architecture is not about pattern names.

Architecture is about making these three things predictable:

1. **Where logic lives**
2. **How data flows**
3. **What depends on what**

If your team can answer those quickly for any feature, your architecture is healthy.

---

## 2) The 3-layer mental model (UI, Domain, Data)

A solid default for Android apps is:

- **UI Layer** (Compose + ViewModel): render state, receive user events
- **Domain Layer** (Use Cases): business rules and feature logic
- **Data Layer** (Repositories + local/remote sources): data retrieval, caching, persistence

### Dependency rule

Dependencies should point inward:

`UI -> Domain -> Data`

Not the other way around.

- UI should not know Retrofit/SQL details.
- Data should not know Compose/UI concepts.
- Domain should not depend on Android framework whenever possible.

---

## 3) Define boundaries with contracts, not assumptions

Use interfaces/contracts to protect boundaries.

### Domain contract

```kotlin
// Domain-level contract.
// UI knows this contract, not how data is fetched.
interface ObserveUserProfile {
    operator fun invoke(userId: String): Flow<UserProfile>
}
```

### Data repository contract

```kotlin
// Domain depends on abstraction.
interface UserRepository {
    fun observeProfile(userId: String): Flow<UserProfile>
    suspend fun refreshProfile(userId: String)
}
```

### Implementation in Data layer

```kotlin
class UserRepositoryImpl(
    private val api: UserApi,
    private val dao: UserDao
) : UserRepository {

    override fun observeProfile(userId: String): Flow<UserProfile> {
        // Single source of truth: database stream.
        return dao.observeById(userId).map { entity -> entity.toDomain() }
    }

    override suspend fun refreshProfile(userId: String) {
        // Pull fresh data from remote and persist locally.
        val remote = api.getUser(userId)
        dao.upsert(remote.toEntity())
    }
}
```

This gives you testability and swap-ability without touching UI.

---

## 4) Data flow: unidirectional by default

For Compose screens, use predictable flow:

1. UI sends `Event`
2. ViewModel handles event
3. ViewModel calls use case/repository
4. ViewModel emits new `UiState`
5. UI renders state

### UI state and events

```kotlin
data class ProfileUiState(
    val isLoading: Boolean = false,
    val profile: UserProfile? = null,
    val error: String? = null
)

sealed interface ProfileEvent {
    data object RefreshClicked : ProfileEvent
    data class Retry(val userId: String) : ProfileEvent
}
```

### ViewModel orchestration

```kotlin
class ProfileViewModel(
    private val observeUserProfile: ObserveUserProfile,
    private val refreshUserProfile: RefreshUserProfile,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState(isLoading = true))
    val uiState: StateFlow<ProfileUiState> = _uiState

    fun bind(userId: String) {
        // Keep stream logic inside VM, not in composable.
        viewModelScope.launch {
            observeUserProfile(userId)
                .onEach { profile ->
                    _uiState.value = ProfileUiState(profile = profile)
                }
                .catch { e ->
                    _uiState.value = ProfileUiState(error = e.message)
                }
                .collect()
        }

        onEvent(ProfileEvent.Retry(userId))
    }

    fun onEvent(event: ProfileEvent) {
        when (event) {
            is ProfileEvent.RefreshClicked -> Unit // userId known from state in real impl
            is ProfileEvent.Retry -> {
                viewModelScope.launch {
                    _uiState.update { it.copy(isLoading = true, error = null) }
                    runCatching { refreshUserProfile(event.userId) }
                        .onFailure { e ->
                            _uiState.update { it.copy(isLoading = false, error = e.message) }
                        }
                }
            }
        }
    }
}
```

---

## 5) What belongs in each layer (quick checklist)

### UI Layer
- Compose UI components
- screen state models (`UiState`)
- user intent/events
- navigation triggers

### Domain Layer
- use cases (`Login`, `RefreshFeed`, `CalculateRiskScore`)
- validation and business rules
- orchestrating multiple repositories

### Data Layer
- Retrofit/Room/Proto/DataStore implementations
- DTO ↔ Entity ↔ Domain mapping
- cache policy + sync strategy

If a class violates this separation, refactoring gets expensive fast.

---

## 6) Common anti-patterns (and fixes)

### Anti-pattern 1: “God ViewModel”
**Symptom:** one ViewModel handles API calls, DB writes, mapping, validation, and analytics.

**Fix:** move business logic to use cases and data operations to repositories.

### Anti-pattern 2: Repository returns UI models
**Symptom:** repository returns `CardUiModel` or Compose-specific state.

**Fix:** repository returns domain model; map to UI model in UI layer.

### Anti-pattern 3: Composable launches business side effects
**Symptom:** network refresh logic inside `LaunchedEffect` with random keys.

**Fix:** composable emits intent; ViewModel/use case executes side effects.

---

## 7) Minimal folder structure that scales

```text
feature/profile/
  ui/
    ProfileScreen.kt
    ProfileViewModel.kt
    ProfileUiState.kt
  domain/
    ObserveUserProfile.kt
    RefreshUserProfile.kt
  data/
    UserRepositoryImpl.kt
    remote/UserApi.kt
    local/UserDao.kt
```

This keeps feature ownership clear and avoids giant global packages.

---

## 8) Testing strategy by layer

- **UI tests:** verify rendering + interactions from `UiState`
- **ViewModel tests:** verify event -> state transitions
- **Domain tests:** pure unit tests for use cases
- **Data tests:** integration tests for repository + local/remote behavior

Architecture is good when tests align naturally with layer boundaries.

---

## 9) Final architecture rules to keep

1. Keep dependencies one-way: `UI -> Domain -> Data`
2. Keep business rules out of composables
3. Keep data-source details out of ViewModels
4. Prefer unidirectional data flow
5. Design contracts first, implementations second

If you apply these consistently, your app becomes easier to evolve, test, and secure.

In the next post, we’ll go deep on the **UI layer**: state modeling, event handling, and UDF patterns in Compose.

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">
    Good Android architecture starts with clear boundaries, not complex patterns. Keep UI focused on rendering, Domain focused on business decisions, and Data focused on persistence/retrieval. Predictable boundaries create predictable apps.
  </p>
</div>
