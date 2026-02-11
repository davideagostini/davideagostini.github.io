---
title: "Compose Performance: It's Probably a Leak"
date: "2026-02-12"
description: "Why 'Compose is slow' is often just a lifecycle mismatch. How to use LeakCanary to find long-lived remember references."
tags: ["Compose", "Performance"]
---

When developers say "Jetpack Compose is slow," 90% of the time they are experiencing jank caused by unnecessary recompositions or memory leaks. The other 10% is `LazyList` misuse.

## The "Remember" Trap

The most common leak I see in code reviews is holding onto heavy objects inside a `remember` block that outlives the view it's attached to, or passing lambdas that capture stable references that shouldn't be stable.

```kotlin
// ❌ BAD: This lambda captures 'viewModel' and creates a new instance on every recomposition if not careful
val onClick = { viewModel.doSomething() }

// ✅ GOOD: Method references or remembered lambdas
val onClick = remember(viewModel) { { viewModel.doSomething() } }
```

## How to Detect Leaks with LeakCanary

Don't guess. Use **LeakCanary**. It now has excellent support for detecting Compose-specific leaks.

1. Add `debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.12'` to your `build.gradle`.
2. Run your app and navigate back and forth between screens.
3. If you see the little bird icon notification, you have a leak.

In Compose, a leak often manifests as the Activity not being destroyed, or a View being kept alive by a `CompositionLocal` that wasn't cleared.

<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p className="text-sm text-yellow-900 m-0">
    Before you optimize your <code>Draw</code> modifiers, check your memory. A garbage collection pause during an animation frame looks exactly like "jank."
  </p>
</div>
