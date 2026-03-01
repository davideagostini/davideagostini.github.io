---
title: "Data Layer Foundations: Repository Pattern (Single Source of Truth)"
date: "2026-03-01"
description: "Learn how to structure your Android data layer with the Repository pattern, avoid common anti-patterns, and build a reliable Single Source of Truth with Room + network."
tags: ["android", "architecture", "repository-pattern", "clean-architecture", "kotlin", "room", "networking"]
---

If your app reads from API, cache, and local DB without a clear strategy, bugs show up fast:

- duplicated logic in multiple classes
- inconsistent UI state
- hard-to-test code

The **Repository pattern** fixes this by giving your app a single entry point for data and a clear **Single Source of Truth (SSOT)**.

In this post, we’ll keep it practical and beginner-friendly.

## What is a Repository in Android?

A repository is a class that:

1. Hides where data comes from (network, database, memory cache)
2. Exposes clean APIs to the domain/UI layers
3. Enforces consistency rules (when to fetch, when to cache, when to update)

Think of it as a **data coordinator**.

---

## BAD vs GOOD #1: Letting ViewModel Talk to API + DB Directly

### ❌ BAD: ViewModel owns data orchestration

```kotlin
class UserViewModel(
    private val api: UserApi,
    private val dao: UserDao
) : ViewModel() {

    // BAD: ViewModel is deciding data sources and sync behavior.
    // This mixes UI concerns with data concerns.
    private val _uiState = MutableStateFlow<UserUiState>(UserUiState.Loading)
    val uiState: StateFlow<UserUiState> = _uiState

    fun loadUser(userId: String) {
        viewModelScope.launch {
            try {
                // BAD: Fetch from API directly in UI layer.
                val remoteUser = api.getUser(userId)

                // BAD: Write to DB from UI layer.
                dao.upsert(remoteUser.toEntity())

                // BAD: Read again from DB from UI layer.
                val localUser = dao.getById(userId)

                _uiState.value = UserUiState.Success(localUser.toUiModel())
            } catch (e: Exception) {
                _uiState.value = UserUiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}
```

Problems:

- ViewModel becomes too big
- Data logic gets duplicated across screens
- Testing is painful (need API + DB setup in UI tests)

### ✅ GOOD: ViewModel depends on Repository contract

```kotlin
interface UserRepository {
    // GOOD: Expose a reactive stream from the source of truth (DB).
    fun observeUser(userId: String): Flow<User>

    // GOOD: Explicit sync API for refresh behavior.
    suspend fun refreshUser(userId: String)
}

class UserViewModel(
    private val repository: UserRepository
) : ViewModel() {

    // GOOD: UI layer only consumes repository output.
    fun uiState(userId: String): StateFlow<UserUiState> {
        return repository.observeUser(userId)
            .map { user -> UserUiState.Success(user.toUiModel()) as UserUiState }
            .onStart { emit(UserUiState.Loading) }
            .catch { emit(UserUiState.Error(it.message ?: "Unknown error")) }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = UserUiState.Loading
            )
    }

    fun refresh(userId: String) {
        viewModelScope.launch {
            repository.refreshUser(userId)
        }
    }
}
```

Why this is better:

- UI layer stays focused on UI state
- Data strategy lives in one place
- Easy to fake `UserRepository` in tests

---

## BAD vs GOOD #2: Multiple Sources of Truth

### ❌ BAD: Returning network model directly while also caching to DB

```kotlin
class UserRepositoryBad(
    private val api: UserApi,
    private val dao: UserDao
) {
    suspend fun getUser(userId: String): UserDto {
        // BAD: Returning network DTO means UI depends on API shape.
        val dto = api.getUser(userId)

        // BAD: DB is updated, but returned data does not come from DB.
        // You now have two different "truths": API response and local DB state.
        dao.upsert(dto.toEntity())

        return dto
    }
}
```

Problems:

- UI may show data that differs from cached data
- DTO leaks into upper layers
- Offline behavior is unclear

### ✅ GOOD: DB is SSOT, network only updates DB

```kotlin
class UserRepositoryImpl(
    private val api: UserApi,
    private val dao: UserDao,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) : UserRepository {

    override fun observeUser(userId: String): Flow<User> {
        return dao.observeById(userId)
            // GOOD: Map DB entity -> domain model.
            // Domain/UI layers are protected from DB and API schemas.
            .map { entity -> entity.toDomain() }
    }

    override suspend fun refreshUser(userId: String) = withContext(ioDispatcher) {
        // GOOD: Network fetch is a side-effect that updates local source of truth.
        val remote = api.getUser(userId)

        // GOOD: Persist normalized data in DB.
        dao.upsert(remote.toEntity())

        // GOOD: No direct return needed.
        // Observers get updates automatically from observeUser().
    }
}
```

Why this is better:

- One consistent source for reads
- Great offline-first foundation
- Predictable UI updates with `Flow`

---

## Practical Rules You Can Apply Today

1. **Read from DB, not directly from network, in UI flows**
2. **Use network to refresh DB**
3. **Expose domain models, not DTO/entity models**
4. **Keep repository interfaces in a stable layer (domain or data contract layer)**
5. **Make sync operations explicit** (`refreshX()`, `syncX()`) instead of hidden magic

---

<div class="key-takeaway">
  <strong>Key Takeaway:</strong>
  A Repository is not just a wrapper around Retrofit or Room. Its real job is to enforce a <em>Single Source of Truth</em>. If your app reads from one place (DB) and writes updates through a clear strategy (network → DB), your architecture becomes more reliable, testable, and scalable.
</div>
