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

```kotlin
// GOOD: ViewModel only cares about local data stream.
// Room keeps the UI alive offline and across restarts.

class ObserveTasksUseCase(
    private val repository: TasksRepository
) {
    operator fun invoke(): Flow<List<Task>> = repository.observeTasks()
}

class TasksViewModel(
    private val observeTasks: ObserveTasksUseCase,
    private val refreshTasks: RefreshTasksUseCase
) : ViewModel() {

    // GOOD: UI state comes from local DB stream.
    val tasksUiState: StateFlow<TasksUiState> = observeTasks()
        .map { tasks ->
            TasksUiState(
                isLoading = false,
                tasks = tasks,
                error = null
            )
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = TasksUiState(isLoading = true)
        )

    fun onPullToRefresh() {
        viewModelScope.launch {
            // GOOD: refresh updates DB; UI updates automatically from Room flow.
            refreshTasks()
        }
    }
}
```

```kotlin
// GOOD: Repository coordinates local + remote, but exposes local stream.

class TasksRepository(
    private val dao: TasksDao,
    private val api: TasksApi
) {
    fun observeTasks(): Flow<List<Task>> = dao.observeAll()

    suspend fun refresh() {
        val remote = api.getTasks()
        // Replace/merge strategy depends on your business rules.
        dao.upsertAll(remote.map { it.toEntity() })
    }
}
```

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
