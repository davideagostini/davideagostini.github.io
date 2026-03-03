---
title: "Modularization 101: Feature Modules, Core Modules, and Gradle Strategy"
date: "2026-03-03"
description: "Learn how to split an Android app into feature and core modules, avoid common modularization mistakes, and set up a Gradle strategy that scales."
tags: ["android", "architecture", "modularization", "gradle", "gde"]
---

Modularization is one of the highest-leverage architecture decisions you can make in Android.

If your app starts as a single `:app` module, everything feels fast at first. But as the codebase grows, builds slow down, ownership gets blurry, and changes become risky.

In this guide, we’ll cover a beginner-friendly setup using:

- **Feature modules** (screen/domain slices like `:feature:profile`)
- **Core modules** (shared building blocks like `:core:ui`, `:core:data`)
- **A Gradle dependency strategy** that prevents “everything depends on everything”

---

## 1) Why modularize?

A good module boundary gives you:

- **Faster builds** (incremental compilation affects less code)
- **Better ownership** (teams can move independently)
- **Safer architecture** (dependencies become explicit)
- **Easier testing** (smaller surfaces, less setup)

A bad module split gives you the opposite: many modules with no rules.

---

## 2) Start with a simple module map

A practical first structure:

- `:app` → application entry point + nav wiring
- `:feature:home`, `:feature:profile`, ... → user-facing features
- `:core:ui` → reusable design system components
- `:core:model` → shared pure data models
- `:core:common` → tiny utilities (keep this strict)
- `:core:data` → shared data primitives only when truly common

> Rule of thumb: **features should not depend on other features directly**.

---

## 3) BAD vs GOOD #1 — Feature-to-feature coupling

### ❌ BAD: one feature imports another feature internals

```kotlin
// In :feature:home
// BAD: Home directly depends on Profile implementation details.
// This creates tight coupling between features and makes refactors risky.

package com.example.feature.home

import com.example.feature.profile.ProfileRepository // <- from another feature (bad)

class HomeViewModel(
    private val profileRepository: ProfileRepository
) {
    fun loadWelcomeName(): String {
        // Home now knows where Profile data comes from.
        // If Profile changes data source or package structure, Home breaks.
        return profileRepository.currentUserName()
    }
}
```

Why this hurts:

- Circular dependency risk grows over time
- Feature boundaries become fake
- Teams can’t release features independently

### ✅ GOOD: share contracts through core module

```kotlin
// In :core:model
// GOOD: shared model is stable and framework-independent.

package com.example.core.model

data class UserSummary(
    val id: String,
    val displayName: String
)
```

```kotlin
// In :core:data
// GOOD: contract lives in a neutral shared module.
// Features depend on this interface, not each other.

package com.example.core.data

import com.example.core.model.UserSummary

interface UserReader {
    suspend fun currentUser(): UserSummary?
}
```

```kotlin
// In :feature:home
// GOOD: Home only relies on a contract.

package com.example.feature.home

import com.example.core.data.UserReader

class HomeViewModel(
    private val userReader: UserReader
) {
    suspend fun loadWelcomeName(): String {
        // Home asks for a stable contract, without knowing implementation details.
        val user = userReader.currentUser()
        return user?.displayName ?: "Guest"
    }
}
```

```kotlin
// In :feature:profile
// GOOD: Profile can provide an implementation using DI.

package com.example.feature.profile

import com.example.core.data.UserReader
import com.example.core.model.UserSummary

class ProfileUserReader : UserReader {
    override suspend fun currentUser(): UserSummary? {
        // Could come from Room, network, cache, etc.
        return UserSummary(id = "42", displayName = "Davide")
    }
}
```

---

## 4) BAD vs GOOD #2 — Gradle dependency explosion

### ❌ BAD: giant dependency graph from every feature

```kotlin
// build.gradle.kts of :feature:payments
// BAD: this module depends on too many unrelated modules.
// Compile classpath becomes huge -> slower builds.

plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.feature.payments"
}

dependencies {
    implementation(project(":feature:home"))
    implementation(project(":feature:profile"))
    implementation(project(":feature:search"))
    implementation(project(":core:ui"))
    implementation(project(":core:data"))
    implementation(project(":core:model"))
    implementation(project(":core:common"))
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("androidx.room:room-ktx:2.7.0")
}
```

Problems:

- Payment feature can accidentally use everything
- Refactors trigger broad recompilation
- Architectural drift becomes hard to stop

### ✅ GOOD: minimal API surface + explicit ownership

```kotlin
// build.gradle.kts of :feature:payments
// GOOD: keep dependencies minimal and intentional.

plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.feature.payments"
}

dependencies {
    // UI primitives used by this feature's screens
    implementation(project(":core:ui"))

    // Shared models/contracts only
    implementation(project(":core:model"))

    // Feature-specific data code should stay inside this feature,
    // unless truly reusable across many features.

    // Use 'api' only when this module must expose types to consumers.
    // Otherwise prefer 'implementation' to keep compile classpath smaller.
}
```

```kotlin
// build.gradle.kts of :app
// GOOD: app module composes feature modules at the top level.

dependencies {
    implementation(project(":feature:home"))
    implementation(project(":feature:profile"))
    implementation(project(":feature:payments"))
}
```

---

## 5) A practical Gradle strategy for beginners

1. **Create modules only for clear boundaries**
   - New feature owned by a team? Good candidate.
   - Reusable design components? Good candidate.

2. **Prefer `implementation` over `api`**
   - `api` leaks internals and increases compile impact.

3. **Put navigation composition in `:app`**
   - Keep features independent from each other.

4. **Create “core” modules with discipline**
   - If `:core:common` becomes a dumping ground, split or delete.

5. **Measure build impact**
   - Modularization is not religion; validate with build scans and CI timing.

---

<div class="key-takeaway">
  <strong>Key Takeaway:</strong> Modularization works when boundaries are intentional. Keep features isolated, share only stable contracts through core modules, and maintain a lean Gradle dependency graph. Small, explicit dependencies today prevent big architecture pain tomorrow.
</div>
