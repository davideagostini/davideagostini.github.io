---
title: "Jetpack Compose LazyColumn Performance: Stability, Keys, and Recomposition You Can Predict"
date: "2026-02-12"
description: "A beginner-friendly guide to speeding up Compose lists by fixing unstable models, adding stable keys, and avoiding accidental recompositions and side effects."
tags: ["Android", "Jetpack Compose", "Performance", "LazyColumn"]
---

If you’ve ever built a `LazyColumn` that *looks* simple (a list of users) but starts to jank, recompose “too much”, or accidentally trigger side effects… you’re not alone.

Compose performance in lists usually comes down to a few repeat offenders:

- **Unstable inputs** (Compose can’t safely skip)
- **Missing keys** (item identity breaks → more work)
- **Work inside item content** (allocations / sorting / filtering during composition)
- **Side effects tied to recomposition** (network calls, timers, subscriptions)

Below is a realistic scenario: showing a list of users with a row component (`UserRow`). We’ll intentionally write a **BAD** version first, then fix it with a **GOOD** one.

---

## The scenario

We have:

- A screen with a `LazyColumn`
- Each row shows a user’s avatar + name
- A “follow/unfollow” button per user
- A callback when the user is clicked

### Data model (start here)

We’ll use a `UserUi` model that the UI can render.

```kotlin
// UI model used by the screen.
// Tip: prefer immutable data for UI.
data class UserUi(
    val id: String,
    val name: String,
    val avatarUrl: String,
    val isFollowed: Boolean,
)
```

---

## Example 1 — BAD vs GOOD: Stability + keys + avoiding composition work

### ❌ BAD: unstable inputs + missing keys + work during composition

```kotlin
@Composable
fun UsersScreenBad(
    // BAD: passing a MutableList communicates “this can change anytime”.
    // Compose can't assume stability and may recompose more than necessary.
    users: MutableList<UserUi>,
    // BAD: passing a mutable map to read state from inside composables.
    followedOverrides: MutableMap<String, Boolean>,
    onUserClick: (String) -> Unit,
    onToggleFollow: (String) -> Unit,
) {
    // BAD: Doing work during composition.
    // This sorting runs every recomposition and allocates a new list.
    val sorted = users.sortedBy { it.name }

    LazyColumn {
        // BAD: no keys → Compose uses the *index* as identity.
        // If you insert/remove/reorder, rows can be reused incorrectly and
        // Compose may do extra work to recover.
        items(sorted) { user ->
            // BAD: reading mutable map here makes row behavior hard to predict.
            val isFollowed = followedOverrides[user.id] ?: user.isFollowed

            UserRowBad(
                userName = user.name,
                avatarUrl = user.avatarUrl,
                isFollowed = isFollowed,
                // BAD: creating new lambdas inside the list can allocate often.
                // Not always catastrophic, but can matter in big lists.
                onClick = { onUserClick(user.id) },
                onToggleFollow = { onToggleFollow(user.id) }
            )
        }
    }
}

@Composable
private fun UserRowBad(
    userName: String,
    avatarUrl: String,
    isFollowed: Boolean,
    onClick: () -> Unit,
    onToggleFollow: () -> Unit,
) {
    // Simplified UI. Imagine an image loader + text + button.
    // The important part: this row will be asked to recompose frequently
    // because its inputs are not stable/predictable upstream.
}
```

What’s wrong here?

- `MutableList` / `MutableMap` are **unstable**: Compose can’t know if something changed without re-reading.
- Sorting inside the composable means **work during recomposition**.
- `items(sorted)` without `key = { ... }` means **identity is index-based**.
- Lambdas created per row can add **allocation pressure**.

### ✅ GOOD: immutable/stable inputs + keys + precomputed list

```kotlin
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.remember
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items

@Immutable
data class UsersUiState(
    // Use an immutable list (or at least read-only List) for Compose.
    val users: List<UserUi>
)

@Composable
fun UsersScreenGood(
    state: UsersUiState,
    onUserClick: (String) -> Unit,
    onToggleFollow: (String) -> Unit,
) {
    // GOOD: derivedStateOf caches the computed value and recomputes only when
    // state.users changes.
    // (Still avoid heavy work; consider moving sorting into ViewModel if needed.)
    val sortedUsers = remember(state.users) {
        // For small lists, this is fine. For huge lists, prefer sorting upstream.
        state.users.sortedBy { it.name }
    }

    LazyColumn {
        items(
            items = sortedUsers,
            // GOOD: stable key = stable identity. Compose can keep item state
            // tied to the correct user even if you reorder/insert.
            key = { user -> user.id }
        ) { user ->
            // GOOD: pass stable primitives + stable callbacks.
            // NOTE: using method references is often stable and avoids creating
            // a new lambda per row.
            UserRowGood(
                user = user,
                onClick = onUserClick,
                onToggleFollow = onToggleFollow
            )
        }
    }
}

@Composable
private fun UserRowGood(
    user: UserUi,
    // GOOD: callbacks accept id, so the row doesn't need to close over it.
    onClick: (String) -> Unit,
    onToggleFollow: (String) -> Unit,
) {
    // Example:
    // Row(modifier = Modifier.clickable { onClick(user.id) }) { ... }
    // Button(onClick = { onToggleFollow(user.id) }) { ... }

    // Why this is better:
    // - The row has a single stable input (user)
    // - Identity is stable (key)
    // - Work (sorting) is cached and not repeated every recomposition
}
```

**Rule of thumb:** In lists, always think in terms of **identity** (`key`) and **stability** (immutable/read-only data).

---

## Example 2 — BAD vs GOOD: side effects in rows (leaks + repeated work)

A common performance and correctness bug: launching side effects from a row whenever it recomposes.

Imagine: whenever a user becomes “followed”, you start a repeating sync or register a listener.

### ❌ BAD: side effect keyed to recomposition (can restart repeatedly)

```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import kotlinx.coroutines.delay

@Composable
fun UserRowWithSyncBad(
    user: UserUi,
    startSync: suspend (String) -> Unit,
) {
    // BAD: This effect is keyed with user (a data class) which changes often
    // (e.g., isFollowed toggles). That means the effect can restart frequently.
    // In a long list this can create lots of cancellations/restarts.
    LaunchedEffect(user) {
        if (user.isFollowed) {
            // Simulate a repeating task.
            while (true) {
                startSync(user.id)
                delay(5_000)
            }
        }
    }

    // UI omitted.
}
```

Problems:

- Keying with `user` means **any** field change restarts the effect.
- In lists, items re-enter composition frequently (scrolling) — you can end up
  doing far more background work than expected.

### ✅ GOOD: key side effects precisely + keep latest lambda safely

```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberUpdatedState
import kotlinx.coroutines.delay

@Composable
fun UserRowWithSyncGood(
    user: UserUi,
    // This might come from a ViewModel; it can change across recompositions.
    startSync: suspend (String) -> Unit,
) {
    // GOOD: rememberUpdatedState keeps the latest lambda without restarting the effect.
    // This avoids capturing an old startSync implementation.
    val latestStartSync = rememberUpdatedState(startSync)

    // GOOD: Key only on what *should* control the effect.
    // If the user id is stable, the effect lifecycle is stable.
    // If follow state changes, we want start/stop behavior.
    LaunchedEffect(user.id, user.isFollowed) {
        if (!user.isFollowed) return@LaunchedEffect

        while (true) {
            // Use the latest lambda safely.
            latestStartSync.value(user.id)
            delay(5_000)
        }
    }

    // UI omitted.
}
```

This version is:

- **Predictable** (effect restarts only when `id` or `isFollowed` changes)
- **Safe** (won’t call a stale `startSync` implementation)
- **Less wasteful** in scrolling lists

---

## Extra practical tips for Compose list performance

- Prefer `List<T>` + immutable models; avoid pushing `MutableList` down to composables.
- Always provide **stable keys** in `LazyColumn` (use IDs, not positions).
- Avoid allocating new lists in composition (filter/sort upstream or cache with `remember`).
- Keep row parameters small and stable (pass `UserUi`, not 8 separate fields *and* mutable maps).
- Keep side effects keyed precisely (`LaunchedEffect(user.id)` not `LaunchedEffect(user)`).
- If you see jank, use **Layout Inspector** + **Compose recomposition counts** and trace.

---

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Compose list performance is mostly about making work skippable: use immutable/stable inputs, provide stable keys for LazyColumn items, and keep side effects tightly keyed so scrolling doesn’t restart background work.</p>
</div>
