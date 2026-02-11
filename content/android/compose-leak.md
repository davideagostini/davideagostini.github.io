---
title: "Compose Performance: It's Probably a Leak"
date: "2026-02-12"
description: "When 'Compose is slow' is actually GC jank: how to find and fix memory leaks with LeakCanary (and correct side-effect cleanup)."
tags: ["Compose", "Performance", "Memory"]
---

If someone tells you **“Compose is slow”**, don’t immediately start micro-optimizing modifiers.

In many real apps, the jank is caused by **memory pressure**:
- a leak keeps objects alive → heap grows
- the app triggers more frequent / longer **GC pauses**
- GC pauses show up as “random” frame drops → it *feels* like UI performance

This note is a practical checklist to **prove** the leak and fix the most common Compose-related causes.

> If your problem is *constant recomposition / skipping blockers* (especially in lists), read this sister note:
> **Compose Performance: Skipping & Stability (User List Edition)** → `/android/compose-skipping-stability-user-list`

---

## 1) What a Compose-related leak looks like

Symptoms you’ll typically see:
- Scrolling is fine… then becomes janky after a few navigations
- Navigating back doesn’t free the screen’s memory
- The app “gets slower” over time

In logs/traces you might notice:
- increasing heap usage
- frequent GC events (sometimes coinciding with dropped frames)

## 2) Detecting leaks with LeakCanary (do this first)

Don’t guess. Use **LeakCanary**.

```gradle
// app/build.gradle

debugImplementation "com.squareup.leakcanary:leakcanary-android:2.14"
```

How to reproduce:
1. Run a **debug** build
2. Open the screen, interact a bit
3. Navigate away (back)
4. Repeat 2–3 times

If LeakCanary reports that your `Activity`, `Fragment`, `View`, or a `Composition` is retained, you have proof.

## 3) The classic leak: registering listeners without unregistering (Context capture)

This happens when you `remember` an object that **registers something** (listener, callback, broadcast receiver, sensor, location, etc.)

```kotlin
@Composable
fun SensorScreen() {
  val context = LocalContext.current

  // ❌ BAD:
  // - remember() keeps this instance for the lifetime of this composition
  // - if SensorHelper registers listeners and you never unregister
  //   your Activity can leak after you navigate away
  val helper = remember { SensorHelper(context) }

  Text("Value: ${helper.latestValue}")
}
```

### Fix: manage the lifecycle with DisposableEffect

If something needs cleanup, use `DisposableEffect`.

```kotlin
@Composable
fun SensorScreen() {
  val context = LocalContext.current

  // ✅ GOOD:
  // - setup happens when entering the composition
  // - cleanup happens automatically when leaving the composition
  DisposableEffect(context) {
    val helper = SensorHelper(context)
    helper.startListening()

    onDispose {
      helper.stopListening() // crucial: prevents Activity leaks
    }
  }

  Text("Listening…")
}
```

Beginner rule of thumb:
- `remember { ... }` **does not** mean “Compose will clean it up for me”.
- `DisposableEffect` is your “onEnter/onExit” for resources.

## 4) Another common leak: collecting flows without tying them to lifecycle

Example of a risky pattern:
- you start a collection in `LaunchedEffect`
- but you accidentally create multiple collectors or keep references alive longer than expected

Safer options:
- Use `collectAsStateWithLifecycle()` (from lifecycle-runtime-compose)
- Or ensure your `LaunchedEffect` key is correct (not always `Unit`)

(We can write a dedicated note on this next — it’s a big source of subtle bugs.)

## 5) Verification checklist (make it measurable)

After your fix:
- Repeat the reproduction steps
- Confirm LeakCanary no longer reports the retained instance
- Watch memory in Android Studio profiler: heap should stabilize
- Scroll/navigate: jank should reduce because GC pressure is lower

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">
    Many “Compose performance” problems are really <strong>memory problems</strong>. Use LeakCanary to prove a leak, fix missing cleanups with <code>DisposableEffect</code>, then verify: fewer GC pauses → smoother frames.
  </p>
</div>
