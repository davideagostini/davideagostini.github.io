---
title: "Offline-First Architecture: Room + Network Sync + Conflict Resolution"
date: "2026-03-04"
description: "Build resilient Android apps with an offline-first data flow using Room, background sync, and clear conflict resolution rules."
tags: ["android", "architecture", "offline-first", "room", "sync", "gde"]
---

Offline-first means your app is useful even when the internet is slow, unstable, or completely unavailable.

For most Android apps, this is the practical approach:

- **Read from local database (Room) first**
- **Sync with network in background**
- **Resolve conflicts predictably**

If you skip these rules, users see loading spinners, stale UI, and random overwrites.

---

## 1) The core mental model

Think in this order:

1. **Room is the source of truth for UI**
2. **Network is a source of updates**
3. **Repository coordinates both**

Your Compose screen should observe Room (usually via `Flow`) and recompose automatically when sync writes new data.

---

## 2) BAD vs GOOD #1 — Fetch-directly-from-network UI

### ❌ BAD: ViewModel depends on network call for screen state

```kotlin
// BAD: UI depends on live network every time.
// If device is offline, the screen fails.

class TasksViewModel(
    private val api: TasksApi
) : ViewModel() {

    private val _state = MutableStateFlow(TasksUiState())
    val state: StateFlow<TasksUiState> = _state

    fun load() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }

            // BAD: direct network dependency for rendering.
            val remoteTasks = api.getTasks()

            _state.value = TasksUiState(
                isLoading = false,
                tasks = remoteTasks,
                error = null
            )
        }
    }
}
```

Why this hurts:

- No data when offline
- Screen state disappears on process death unless manually cached
- You duplicate cache logic in multiple ViewModels

### ✅ GOOD: ViewModel observes Room, repository syncs in background

Let’s expand this as a complete beginner-friendly chain.

The goal is simple:

1. **UI reads from Room only** (stable offline behavior)
2. **Repository refreshes Room from network** (in background)
3. **ViewModel does not render network responses directly**

So even if API fails, UI can still show the last local snapshot.

### Step A — Define remote API model (`TasksApi`)

```kotlin
// Remote DTO returned by backend.
// Keep DTO in data/remote layer (do not expose directly to UI).
data class TaskDto(
    val id: String,
    val title: String,
    val completed: Boolean,
    val updatedAtEpochMs: Long,
)

interface TasksApi {
    @GET("/tasks")
    suspend fun getTasks(): List<TaskDto>

    @PUT("/tasks/{id}")
    suspend fun updateTask(
        @Path("id") id: String,
        @Body body: TaskDto,
    )
}
```

### Step B — Define Room entity + DAO (`TasksDao`)

```kotlin
@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey val id: String,
    val title: String,
    val completed: Boolean,
    val updatedAtEpochMs: Long,
)

@Dao
interface TasksDao {

    // Flow = UI gets updates automatically when table changes.
    @Query("SELECT * FROM tasks ORDER BY updatedAtEpochMs DESC")
    fun observeAll(): Flow<List<TaskEntity>>

    // For conflict/sync decisions (used later in advanced sync logic).
    @Query("SELECT * FROM tasks WHERE id = :id LIMIT 1")
    suspend fun findById(id: String): TaskEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(task: TaskEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(tasks: List<TaskEntity>)

    @Query("DELETE FROM tasks")
    suspend fun deleteAll()
}
```

### Step C — Mapping between layers

```kotlin
// Domain model consumed by UI/ViewModel.
data class Task(
    val id: String,
    val title: String,
    val completed: Boolean,
)

fun TaskEntity.toDomain(): Task = Task(
    id = id,
    title = title,
    completed = completed,
)

fun TaskDto.toEntity(): TaskEntity = TaskEntity(
    id = id,
    title = title,
    completed = completed,
    updatedAtEpochMs = updatedAtEpochMs,
)
```

### Step D — Repository: local stream + background refresh

```kotlin
class TasksRepository(
    private val dao: TasksDao,
    private val api: TasksApi,
) {

    // UI-friendly stream comes from Room, not from Retrofit.
    fun observeTasks(): Flow<List<Task>> =
        dao.observeAll().map { entities -> entities.map { it.toDomain() } }

    suspend fun refreshTasks() {
        // 1) Pull latest from server
        val remoteTasks = api.getTasks()

        // 2) Write to DB
        dao.upsertAll(remoteTasks.map { it.toEntity() })

        // 3) No direct callback to UI needed.
        //    Room flow emits automatically -> ViewModel state updates.
    }
}
```

### Step E — Use cases keep ViewModel focused

```kotlin
class ObserveTasksUseCase(
    private val repository: TasksRepository
) {
    operator fun invoke(): Flow<List<Task>> = repository.observeTasks()
}

class RefreshTasksUseCase(
    private val repository: TasksRepository
) {
    suspend operator fun invoke() = repository.refreshTasks()
}
```

### Step F — ViewModel orchestrates state + refresh intent

```kotlin
data class TasksUiState(
    val isLoading: Boolean = false,
    val tasks: List<Task> = emptyList(),
    val error: String? = null,
)

class TasksViewModel(
    private val observeTasks: ObserveTasksUseCase,
    private val refreshTasks: RefreshTasksUseCase,
) : ViewModel() {

    private val refreshState = MutableStateFlow(false)
    private val refreshError = MutableStateFlow<String?>(null)

    // Combine local tasks with transient refresh info.
    val uiState: StateFlow<TasksUiState> = combine(
        observeTasks(),
        refreshState,
        refreshError,
    ) { tasks, isRefreshing, error ->
        TasksUiState(
            isLoading = isRefreshing && tasks.isEmpty(),
            tasks = tasks,
            error = error,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = TasksUiState(isLoading = true),
    )

    init {
        // Initial sync attempt; UI still renders local data if present.
        onPullToRefresh()
    }

    fun onPullToRefresh() {
        viewModelScope.launch {
            refreshState.value = true
            refreshError.value = null

            runCatching { refreshTasks() }
                .onFailure { throwable ->
                    // Important: keep UI alive with local data; only surface sync error.
                    refreshError.value = throwable.message ?: "Sync failed"
                }

            refreshState.value = false
        }
    }
}
```

### Why this architecture helps beginners

- You always know where to look:
  - API issues -> `TasksApi` / network layer
  - DB stream issues -> `TasksDao`
  - sync rules -> repository/use case
  - rendering issues -> composable/UI state
- UI does not break offline because it does not depend on immediate network response.
- Room + Flow gives predictable recomposition behavior.

---

## 3) BAD vs GOOD #2 — Last-write-wins with no conflict policy

When users can edit data offline, conflicts are guaranteed.

### ❌ BAD: blindly overwrite local with server payload

```kotlin
// BAD: server data fully replaces local rows.
// Local unsynced edits may be lost.

suspend fun naiveSyncTask(taskId: String) {
    val remote = api.getTask(taskId)

    // BAD: no check for local pending changes.
    // BAD: no versioning or timestamp comparison.
    dao.insert(remote.toEntity())
}
```

This creates “Where did my change go?” moments.

### ✅ GOOD: explicit conflict metadata + deterministic resolver

```kotlin
// GOOD: Store metadata needed for conflict resolution.
// pendingSync=true means local edit has not been accepted by server yet.

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey val id: String,
    val title: String,
    val completed: Boolean,
    val updatedAtEpochMs: Long,
    val pendingSync: Boolean,
    val version: Long
)
```

```kotlin
// GOOD: Resolve conflict with clear business rule.
// Example policy:
// 1) If local has pending sync, keep local and queue upload.
// 2) Otherwise prefer the newest update timestamp.

fun resolveTask(local: TaskEntity?, remote: TaskDto): TaskEntity {
    val remoteEntity = remote.toEntity()

    if (local == null) return remoteEntity.copy(pendingSync = false)

    if (local.pendingSync) {
        // Keep local unsynced edit; avoid accidental overwrite.
        return local
    }

    return if (remoteEntity.updatedAtEpochMs >= local.updatedAtEpochMs) {
        remoteEntity.copy(pendingSync = false)
    } else {
        local
    }
}
```

```kotlin
// GOOD: Sync loop applies resolver row-by-row.

suspend fun syncTasks() {
    val remoteTasks = api.getTasks()

    remoteTasks.forEach { remote ->
        val local = dao.findById(remote.id)
        val resolved = resolveTask(local, remote)
        dao.upsert(resolved)
    }

    // Then upload local pending edits in a second phase.
    val pending = dao.pendingSyncTasks()
    pending.forEach { localTask ->
        api.updateTask(localTask.toDto())
        dao.markSynced(localTask.id)
    }
}
```

---

## 4) Practical implementation checklist

- Add `pendingSync`, `updatedAt`, and optionally `version` columns
- Use WorkManager for retryable background sync
- Keep API errors out of rendering path (UI reads local DB)
- Define one conflict policy per entity and document it
- Add tests for sync + conflict rules (most bugs live here)

---

<div class="key-takeaway">
  <strong>Key Takeaway:</strong> Offline-first is not “cache plus hope.” Make Room your UI source of truth, sync in background, and define deterministic conflict rules. Predictability beats cleverness when users edit data offline.
</div>
