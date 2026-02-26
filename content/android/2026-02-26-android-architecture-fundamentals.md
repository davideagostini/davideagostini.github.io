---
title: "Android Architecture Fundamentals: Layers, Boundaries, and Data Flow"
date: "2026-02-26"
description: "A practical and detailed guide to Android app architecture: layer responsibilities, dependency boundaries, data flow, and real Kotlin examples with comments."
tags: ["Android", "Architecture", "Clean Architecture", "Compose", "Kotlin"]
---

Most Android architecture failures are not caused by developers writing "bad code."  
They happen because teams don’t agree on **boundaries**.

When boundaries are weak, technical debt grows fast:

- ViewModels become "God objects" (network + DB + mapping + analytics + validation)
- business rules leak into composables
- repositories return UI-specific models
- features become difficult to test and risky to refactor

This post builds a strong foundation from first principles, so your architecture stays maintainable as complexity grows.

## 1) What architecture is really for

Architecture is not about following trendy patterns.

Architecture exists to make three things predictable:

1. **Where logic lives**
2. **How data moves through the app**
3. **Which layer is allowed to depend on which layer**

If your team can answer these three quickly for any feature, the app is in good shape.

---

## 2) The default model: UI, Domain, Data

A practical baseline for most Android apps:

- **UI Layer** → renders state and captures user input
- **Domain Layer** → business rules and feature-level decisions
- **Data Layer** → persistence, networking, cache/sync

### Responsibility split

- **UI** should answer: *"How does this state look?"*
- **Domain** should answer: *"What should happen according to business rules?"*
- **Data** should answer: *"Where data comes from and how it is stored"*

### Dependency direction

Use one-way dependencies:

`UI -> Domain -> Data`

This means:

- UI must not know Retrofit/Room details
- Data must not know Compose/UI state classes
- Domain should be framework-light (ideally pure Kotlin)

---

## 3) Boundaries are contracts

The easiest way to keep boundaries stable is by coding against contracts.

### Domain-facing contract

```kotlin
// Domain contract used by UI/ViewModel.
// Caller knows WHAT it gets (profile stream), not HOW it's produced.
interface ObserveUserProfile {
    operator fun invoke(userId: String): Flow<UserProfile>
}
```

### Repository abstraction

```kotlin
// Domain depends on this abstraction, not concrete API/DB classes.
interface UserRepository {
    fun observeProfile(userId: String): Flow<UserProfile>
    suspend fun refreshProfile(userId: String)
}
```

### Data implementation

```kotlin
class UserRepositoryImpl(
    private val api: UserApi,
    private val dao: UserDao,
) : UserRepository {

    override fun observeProfile(userId: String): Flow<UserProfile> {
        // IMPORTANT:
        // We expose DB as source-of-truth stream.
        // UI observes stable local data, while refresh happens independently.
        return dao.observeById(userId)
            .map { entity -> entity.toDomain() }
    }

    override suspend fun refreshProfile(userId: String) {
        // Fetch from network...
        val remote = api.getUser(userId)

        // ...then persist locally.
        // Because UI observes DB, it auto-updates without direct callback wiring.
        dao.upsert(remote.toEntity())
    }
}
```

This pattern gives you replacement flexibility (fake repo in tests, different data source in future) with minimal UI changes.

---

## 4) Data flow in Compose: unidirectional by default

Use a predictable loop:

1. UI emits an `Event`
2. ViewModel handles it
3. ViewModel calls Domain/Data
4. ViewModel exposes updated `UiState`
5. UI re-renders

### UI contract

```kotlin
data class ProfileUiState(
    val isLoading: Boolean = false,
    val profile: UserProfile? = null,
    val errorMessage: String? = null,
)

sealed interface ProfileEvent {
    data object ScreenStarted : ProfileEvent
    data object RefreshClicked : ProfileEvent
    data class Retry(val userId: String) : ProfileEvent
}
```

### ViewModel orchestration (with detailed comments)

```kotlin
class ProfileViewModel(
    private val observeUserProfile: ObserveUserProfile,
    private val refreshUserProfile: RefreshUserProfile,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState(isLoading = true))
    val uiState: StateFlow<ProfileUiState> = _uiState

    private var currentUserId: String? = null

    fun bind(userId: String) {
        // Keep route argument in VM state to avoid passing it around repeatedly.
        currentUserId = userId

        // Start observing profile stream once.
        // In real projects, guard against multiple bind() calls.
        viewModelScope.launch {
            observeUserProfile(userId)
                .onEach { profile ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            profile = profile,
                            errorMessage = null,
                        )
                    }
                }
                .catch { throwable ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = throwable.message ?: "Unknown error",
                        )
                    }
                }
                .collect()
        }

        // Trigger first refresh to ensure latest data.
        onEvent(ProfileEvent.ScreenStarted)
    }

    fun onEvent(event: ProfileEvent) {
        when (event) {
            ProfileEvent.ScreenStarted,
            ProfileEvent.RefreshClicked -> refreshCurrentUser()

            is ProfileEvent.Retry -> refresh(event.userId)
        }
    }

    private fun refreshCurrentUser() {
        val userId = currentUserId ?: return
        refresh(userId)
    }

    private fun refresh(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            runCatching { refreshUserProfile(userId) }
                .onFailure { throwable ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = throwable.message ?: "Refresh failed",
                        )
                    }
                }
        }
    }
}
```

Why this scales well:

- side effects stay in ViewModel/use case
- composables remain mostly stateless renderers
- every state transition is traceable from events

---

## 5) What belongs in each layer (practical checklist)

### UI Layer (Compose + ViewModel)

✅ belongs here:
- `UiState`, user events, and rendering logic
- navigation actions
- UI-only formatting/mapping (e.g., money/date string formatting for display)

❌ avoid here:
- SQL queries
- Retrofit calls
- business policy decisions

### Domain Layer (Use Cases)

✅ belongs here:
- business decisions (eligibility rules, validation rules)
- orchestration across repositories
- feature invariants

❌ avoid here:
- Android UI framework classes
- DTO/entity persistence details

### Data Layer (Repository + sources)

✅ belongs here:
- API clients, DAOs, DataStore, cache
- mapping between DTO ↔ Entity ↔ Domain
- sync/retry policies and persistence strategies

❌ avoid here:
- Compose or screen-specific models

---

## 6) Common anti-patterns (with concrete fixes)

### Anti-pattern 1: God ViewModel

**Smell:** ViewModel contains networking, DB writes, domain decisions, and analytics triggers.

**Fix:**
- move business logic to use cases
- move source-specific logic to repositories
- keep VM focused on event -> state orchestration

### Anti-pattern 2: Repository returns UI models

**Smell:** repository returns `FeedCardUiModel`, `ProfileScreenState`, etc.

**Fix:** repository returns domain model (`FeedItem`, `UserProfile`) and UI maps locally.

### Anti-pattern 3: Side effects directly in composables

**Smell:** `LaunchedEffect` starts business operations with unstable keys.

**Fix:** composable emits intent; ViewModel executes operation.

---

## 7) Scalable package/module shape

Feature-first structure works better than giant technical folders:

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

For larger apps, this can evolve into multi-module:

- `:feature:profile`
- `:core:domain`
- `:core:data`
- `:core:ui`

---

## 8) Test strategy aligned with architecture

If architecture is clean, tests become straightforward.

- **UI tests**: verify rendering from given `UiState`
- **ViewModel tests**: verify `Event -> UiState` transitions
- **Domain tests**: pure unit tests for business rules
- **Data tests**: integration tests for DAO/API/repository behavior

Example ViewModel expectation:

- given refresh failure
- when `RefreshClicked`
- then state contains `errorMessage` and `isLoading = false`

---

## 9) A practical migration path (legacy app)

If your current codebase is mixed, do this incrementally:

1. pick one feature (small but non-trivial)
2. extract UI state/events contract
3. introduce one use case for one business action
4. move DB/API details behind repository interface
5. write 2–3 focused tests per layer

Repeat by feature. Don’t rewrite everything at once.

---

## 10) Rules worth keeping on your team wiki

1. One-way dependencies: `UI -> Domain -> Data`
2. Business rules never inside composables
3. Repositories never return UI-specific models
4. Events in, state out (UDF)
5. Contracts first, implementation second
6. Prefer boring consistency over clever architecture

When these rules are applied consistently, refactors get safer, onboarding gets faster, and app behavior becomes more predictable.

In the next post, we’ll go deep on **UI architecture in Compose**: state modeling, event contracts, and practical UDF patterns.

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">
    Good Android architecture is a boundary discipline. Keep UI focused on rendering, Domain focused on decisions, and Data focused on persistence/retrieval. Clear boundaries reduce bugs, simplify tests, and make growth sustainable.
  </p>
</div>
