---
title: "Compose Performance: It's Probably a Leak"
date: "2026-02-12"
description: "Why 'Compose is slow' is often just a lifecycle mismatch. How to use LeakCanary to find long-lived remember references."
tags: ["Compose", "Performance"]
---

When developers say "Jetpack Compose is slow," 90% of the time they are experiencing jank caused by **unnecessary recompositions** or **memory leaks**. The other 10% is usually `LazyList` misuse.

In this note, I'll show you the most common leak pattern I see in production apps and how to catch it.

## The "Unstable Lambda" Trap

One of the most insidious performance killers in Compose is passing unstable lambdas to composables. If a lambda is recreated on every recomposition, it breaks skipping.

### The Problem

```kotlin
@Composable
fun UserList(users: List<User>, viewModel: UserViewModel) {
    // ❌ BAD: This lambda is recreated every time UserList recomposes.
    // Because it captures 'viewModel', the compiler treats it as unstable
    // unless the ViewModel itself is stable (which it usually isn't by default).
    LazyColumn {
        items(users) { user ->
            UserItem(
                user = user,
                onClick = { viewModel.onUserClicked(user) } 
            )
        }
    }
}
```

Even if `UserItem` is marked with `@Stable` or uses `skipping`, it will still recompose because its `onClick` parameter has changed.

### The Fix: Method References or Remembered Lambdas

```kotlin
@Composable
fun UserList(users: List<User>, viewModel: UserViewModel) {
    // ✅ OPTION 1: Remember the lambda
    val onUserClick = remember(viewModel) {
        { user: User -> viewModel.onUserClicked(user) }
    }

    LazyColumn {
        items(users) { user ->
            UserItem(
                user = user,
                onClick = { onUserClick(user) }
            )
        }
    }
}
```

Or better yet, pass a method reference if possible:

```kotlin
// ✅ OPTION 2: Method Reference (cleaner)
UserItem(
    user = user,
    onClick = viewModel::onUserClicked
)
```

## Holding Context in `remember`

Another common leak source is capturing an `Activity` or `View` context inside a `remember` block that outlives the composition.

```kotlin
// ❌ RISKY: If this composable is used in a context that outlives the Activity 
// (e.g., a retained fragment or a navigation scope not cleared properly),
// you might leak the Activity context.
val context = LocalContext.current
val heavyObject = remember { HeavyObject(context) }
```

**Fix:** Use `DisposableEffect` to clean up resources, or ensure your remembered objects don't hold strong references to `Context` if they might outlive the UI lifecycle.

## How to Detect Leaks with LeakCanary

Don't guess. Use **LeakCanary**. It now has excellent support for detecting Compose-specific leaks.

1. Add `debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'` to your `build.gradle`.
2. Run your app and navigate back and forth between screens.
3. If you see the little bird icon notification, you have a leak.

In Compose, a leak often manifests as the **Activity not being destroyed**, or a **View being kept alive** by a `CompositionLocal` that wasn't cleared.

<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p className="text-sm text-yellow-900 m-0">
    Before you optimize your <code>Draw</code> modifiers, check your memory. A garbage collection pause during an animation frame looks exactly like "jank."
  </p>
</div>
