---
title: "Baseline Profiles for Android: Faster Startup (Bad vs Good Patterns)"
date: "2026-02-25"
description: "A beginner-friendly Baseline Profiles guide with practical BAD vs GOOD Kotlin examples to improve startup and scrolling performance."
tags: ["Android", "Performance", "Baseline Profiles", "Jetpack", "Kotlin", "GDE"]
---

# Baseline Profiles for Android: Faster Startup (Bad vs Good Patterns)

If your app feels slow on cold start, users notice immediately.

**Baseline Profiles** help Android pre-compile important code paths, so your app opens and feels responsive faster — especially on real user devices.

In this guide, we'll use practical **BAD vs GOOD** patterns you can apply today.

---

## What is a Baseline Profile (simple version)

A Baseline Profile is a list of classes and methods that your app uses early (startup, first screen, key interactions).

When shipped in your release app, Android Runtime can compile these hot paths ahead of time.

Result: better startup and smoother first interactions.

---

## 1) Startup Journey Coverage

### BAD ❌: Profile only app launch, ignore real user path

```kotlin
// ================================================================
// BAD EXAMPLE
// Why it's bad:
// 1) Only captures launch (startActivityAndWait)
// 2) Misses actual user-critical paths (feed render, click, details)
// 3) Gains are limited because important code remains unprofiled
// ================================================================
@RunWith(AndroidJUnit4::class)
class BaselineProfileBad {

    @get:Rule
    val baselineRule = BaselineProfileRule()

    @Test
    fun generate() = baselineRule.collect(
        packageName = "com.example.newsapp"
    ) {
        // BAD: this captures only a shallow startup path
        startActivityAndWait()

        // No additional interactions.
        // Profile misses list binding, image loading, navigation, etc.
    }
}
```

### GOOD ✅: Cover startup + critical first-session interactions

```kotlin
// ================================================================
// GOOD EXAMPLE
// Improvements:
// 1) Captures realistic user journey after launch
// 2) Profiles startup + first meaningful interactions
// 3) Improves time-to-interactive and first-screen smoothness
// ================================================================
@RunWith(AndroidJUnit4::class)
class BaselineProfileGood {

    @get:Rule
    val baselineRule = BaselineProfileRule()

    @Test
    fun generate() = baselineRule.collect(
        packageName = "com.example.newsapp"
    ) {
        // Launch app and wait for first frame stabilization
        startActivityAndWait()

        // Simulate a realistic user path:
        // 1) Scroll feed
        device.findObject(By.res("feed_list")).fling(Direction.DOWN)

        // 2) Open first article
        device.findObject(By.res("article_card_0")).click()

        // 3) Wait for details screen to fully render
        device.wait(Until.hasObject(By.res("article_title")), 5_000)

        // 4) Go back to feed
        device.pressBack()
    }
}
```

---

## 2) Shipping the Profile in Release Builds

### BAD ❌: Generate profile but forget production integration

```kotlin
// ================================================================
// BAD EXAMPLE
// Why it's bad:
// 1) Team generated profile once, but it is not wired properly
// 2) Release build may ship without updated baseline profile
// 3) Performance improvements become inconsistent across versions
// ================================================================
plugins {
    id("com.android.application")
    kotlin("android")
    // Missing profile installer dependency and macrobenchmark setup
}

android {
    buildTypes {
        release {
            isMinifyEnabled = true
            // No clear process to keep baseline profiles updated per release
        }
    }
}
```

### GOOD ✅: Keep profile generation + installation explicit and repeatable

```kotlin
// ================================================================
// GOOD EXAMPLE
// Improvements:
// 1) Uses profile installer in app module
// 2) Establishes repeatable generation workflow in CI/release checklist
// 3) Makes profile delivery reliable for every production version
// ================================================================
plugins {
    id("com.android.application")
    kotlin("android")
}

dependencies {
    // Ensures baseline profiles bundled in the APK are installed at runtime
    implementation("androidx.profileinstaller:profileinstaller:1.4.1")
}

android {
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true

            // Keep release optimized while shipping baseline profile assets
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

// Team workflow tip (documented in README/CI):
// 1) Run macrobenchmark baseline profile generation when key flows change
// 2) Commit updated profile artifacts
// 3) Validate startup metrics before release cut
```

---

## Practical Tips (Beginner-Friendly)

- Start with 1–2 key journeys: cold start, home feed, first detail screen
- Regenerate profiles when navigation/UI architecture changes significantly
- Measure before/after with Macrobenchmark (startup + frame timing)
- Treat performance as a product feature, not a last-week optimization

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Baseline Profiles are one of the highest-impact, low-friction Android performance wins: profile realistic user journeys, ship the profile reliably in release, and re-generate whenever critical flows change. This is exactly the kind of practical performance discipline that supports GDE-level engineering growth.</p>
</div>
