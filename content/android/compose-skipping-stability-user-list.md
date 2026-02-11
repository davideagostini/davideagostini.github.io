---
title: "Compose Performance: Skipping & Stability (User List Edition)"
date: "2026-02-11"
description: "Why your User List janks: unstable lambdas break skipping. Learn the fix with remember + method references, with beginner-friendly comments."
tags: ["Compose", "Performance"]
---

If your **User List** in Jetpack Compose feels janky, the cause is often not “drawing”.
It’s that Compose can’t **skip** work because some inputs look “changed” on every recomposition.

## 1) What is “skipping” (simple explanation)

When state changes, Compose may re-run Composables to update UI.

But if a Composable receives **the same inputs** as last time, Compose can **skip** re-running it.
This is one of the biggest performance wins in Compose.

So performance is not only *what you do inside* a Composable — it’s also *what you pass into it*.

## 2) The most common issue: unstable `onClick` lambdas in lists

In Kotlin, a lambda is an object.
If you create a lambda inline, Compose may see a **new lambda instance** after each recomposition.

### BAD: inline lambda capturing `user`

```kotlin
@Composable
fun UsersScreen(
  users: List<UserUi>,
  viewModel: UsersViewModel
) {
  LazyColumn {
    items(users) { user ->
      UserRow(
        user = user,
        // ❌ BAD (very common):
        // - This lambda is created inline
        // - It captures `user` (which changes per row)
        // - If the parent recomposes, the lambda identity can change
        // - Result: Compose may recompose UserRow more than necessary
        onClick = { viewModel.onUserClicked(user.id) }
      )
    }
  }
}
```

**Beginner tip:** The “problem” is not that lambdas are bad.
The problem is **unnecessary changes** that prevent skipping.

## 3) Fix #1: stabilize the callback with `remember`

We split the callback in two:
- a stable “action” function: `(String) -> Unit`
- a per-row lambda that just forwards `user.id`

```kotlin
@Composable
fun UsersScreen(
  users: List<UserUi>,
  viewModel: UsersViewModel
) {
  // ✅ GOOD:
  // - Create the action callback once
  // - Recreate only if `viewModel` changes (usually it doesn't per screen)
  val onUserClick: (String) -> Unit = remember(viewModel) {
    { id -> viewModel.onUserClicked(id) }
  }

  LazyColumn {
    items(users) { user ->
      UserRow(
        user = user,
        // This lambda is tiny and predictable:
        // it calls a stable callback with a simple value.
        onClick = { onUserClick(user.id) }
      )
    }
  }
}
```

## 4) Fix #2: method reference (cleanest, when signatures match)

If your ViewModel function matches the `onClick` type:

```kotlin
// ViewModel
fun onUserClicked(id: String) {
  // ... navigate, log analytics, etc.
}
```

Then:

```kotlin
UserRow(
  user = user,
  onClick = viewModel::onUserClicked // ✅ clean and usually stable
)
```

## 5) How to validate the improvement

- **Layout Inspector → Recomposition counts**
  - Scroll the list.
  - Watch if rows recompose excessively.
- If jank still happens “randomly”, also check **GC pauses** and memory leaks (LeakCanary).

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">
    In lists, unstable callbacks are amplified. Stabilize your <code>onClick</code> (via <code>remember</code> or method references) so Compose can skip work and keep scrolling smooth.
  </p>
</div>
