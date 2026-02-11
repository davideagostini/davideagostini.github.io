---
title: "Compose Performance: It's Probably a Leak"
date: "2026-02-12"
description: "Why 'Compose is slow' is often just a lifecycle mismatch. How to use LeakCanary to find long-lived remember references."
tags: ["Compose", "Performance"]
---

When developers say "Jetpack Compose is slow," 90% of the time they are experiencing jank caused by **unnecessary recompositions** or **memory leaks**. The other 10% is usually `LazyList` misuse.

In this note, I'll show you the most common leak pattern I see in production apps and how to catch it.

## The "Unstable Lambda" Trap

One of the most insidious performance killers in Compose is passing unstable lambdas to composables. If a lambda is recreated on every recomposition, it breaks **skipping** (Compose's ability to skip redrawing UI parts that haven't changed).

### The Problem: Recreating Lambdas

In Kotlin, a lambda like `{ viewModel.doSomething() }` is an object. If it captures a variable that isn't considered "@Stable" by the compiler (like most ViewModels), Compose creates a **new instance** of that lambda every time the parent function recomposes.

```kotlin
@Composable
fun UserList(users: List<User>, viewModel: UserViewModel) {
    LazyColumn {
        items(users) { user ->
            // ❌ BAD: Performance Killer
            // This lambda object is recreated every time 'UserList' recomposes.
            // As a result, 'UserItem' sees a "new" onClick parameter every time.
            // This forces 'UserItem' to recompose, even if the 'user' data hasn't changed!
            UserItem(
                user = user,
                onClick = { viewModel.onUserClicked(user) } 
            )
        }
    }
}
```

Even if `UserItem` is marked with `@Stable` or uses `skipping`, it **will still recompose** because its `onClick` parameter has changed. In a list of 100 items, this causes massive jank during scrolling.

### The Fix: Method References or Remembered Lambdas

We need to tell Compose: "This function doesn't change."

**Option 1: Remember the Lambda**
Wrap the lambda in `remember`. This tells Compose to reuse the same lambda instance across recompositions unless `viewModel` changes (which it implies it won't).

```kotlin
@Composable
fun UserList(users: List<User>, viewModel: UserViewModel) {
    // ✅ GOOD: We create the lambda ONCE and reuse it.
    // Compose knows this object hasn't changed, so it can skip recomposing the children.
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

**Option 2: Method Reference (Cleaner)**
If your function signature matches exactly, you can use a method reference. These are often treated as stable by the compiler.

```kotlin
// ✅ BEST: Clean and performant
UserItem(
    user = user,
    onClick = viewModel::onUserClicked
)
```

## The Context Leak: Ignoring Lifecycle

Another common leak source is capturing an `Activity` or `View` context inside a `remember` block that outlives the composition. This happens frequently when integrating legacy SDKs or Sensor listeners.

```kotlin
@Composable
fun SensorDisplay() {
    val context = LocalContext.current
    
    // ❌ DANGEROUS: 
    // If 'SensorHelper' registers a listener on the Context (Activity) 
    // and never unregisters it, the Activity will leak when you navigate away.
    // 'remember' does NOT automatically clean up resources!
    val sensorHelper = remember { SensorHelper(context) }
    
    Text("Sensor data: ${sensorHelper.data}")
}
```

### The Fix: DisposableEffect

If an object needs to be cleaned up (like removing a listener), you **must** use `DisposableEffect`. This block runs when the composable leaves the screen.

```kotlin
@Composable
fun SensorDisplay() {
    val context = LocalContext.current
    
    // ✅ GOOD: manage the lifecycle explicitly
    DisposableEffect(context) {
        val helper = SensorHelper(context)
        helper.startListening()
        
        // This block runs when the composable is removed from the UI tree
        onDispose {
            helper.stopListening() // Cleanup prevents the leak!
        }
    }
}
```

## How to Detect Leaks with LeakCanary

Don't guess. Use **LeakCanary**. It now has excellent support for detecting Compose-specific leaks.

1. Add `debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'` to your `build.gradle`.
2. Run your app and navigate back and forth between screens.
3. If you see the little bird icon notification, you have a leak.

In Compose, a leak often manifests as the **Activity not being destroyed**, or a **View being kept alive** by a `CompositionLocal` that wasn't cleared.

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">
    Before you optimize your <code>Draw</code> modifiers, check your memory. A garbage collection pause during an animation frame looks exactly like "jank."
  </p>
</div>
