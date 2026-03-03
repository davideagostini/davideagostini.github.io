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

This is one of the most common issues in modularized apps.

You create many modules (good), but then each feature depends on almost every other module (bad).  
At that point, you have “modularization on paper,” not real isolation.

### Why dependency explosion is dangerous

When one feature depends on too many modules:

- compile classpath grows -> slower incremental builds
- any change in shared modules triggers broad recompilation
- teams accidentally use internals they should not touch
- architecture rules become unenforceable

In short: your module graph becomes a monolith with folders.

### ❌ BAD example A: feature depends on many unrelated features

```kotlin
// build.gradle.kts of :feature:payments
// BAD: this feature depends on multiple other features + heavy infra libs.
// Payments now has broad visibility and weak boundaries.

dependencies {
    implementation(project(":feature:home"))
    implementation(project(":feature:profile"))
    implementation(project(":feature:search"))
    implementation(project(":feature:settings"))

    implementation(project(":core:ui"))
    implementation(project(":core:data"))
    implementation(project(":core:model"))
    implementation(project(":core:common"))

    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("androidx.room:room-ktx:2.7.0")
}
```

**What goes wrong in practice:**

- `:feature:payments` can call code from `:feature:search` “just because it can”
- a small change in `:feature:profile` can recompile `:feature:payments`
- new engineers can’t quickly understand ownership boundaries

### ❌ BAD example B: overusing `api` leaks transitive dependencies

```kotlin
// build.gradle.kts of :core:data
// BAD: api leaks these dependencies to every consumer module.

dependencies {
    api(project(":core:model"))
    api("com.squareup.retrofit2:retrofit:2.11.0")
    api("androidx.room:room-ktx:2.7.0")
}
```

If many modules depend on `:core:data`, they all "see" Retrofit/Room types even when they shouldn’t.

Result:

- larger compile graph
- tighter coupling to implementation details
- harder migrations (e.g., Retrofit -> Ktor)

### ✅ GOOD example A: keep feature dependencies minimal

```kotlin
// build.gradle.kts of :feature:payments
// GOOD: depend only on what this feature actually needs.

dependencies {
    // Reusable UI building blocks only
    implementation(project(":core:ui"))

    // Shared domain models/contracts used by this feature
    implementation(project(":core:model"))

    // If payments has local data/network code, keep it inside this feature module
    // unless it is truly shared across many features.
}
```

### ✅ GOOD example B: prefer `implementation` to hide internals

```kotlin
// build.gradle.kts of :core:data
// GOOD: implementation keeps internals private to this module.

dependencies {
    implementation(project(":core:model"))
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("androidx.room:room-ktx:2.7.0")
}
```

Now consumers of `:core:data` don’t automatically compile against Retrofit/Room APIs.

### ✅ GOOD example C: compose features only in :app

```kotlin
// build.gradle.kts of :app
// GOOD: app is the composition root.

dependencies {
    implementation(project(":feature:home"))
    implementation(project(":feature:profile"))
    implementation(project(":feature:payments"))
}
```

This keeps feature-to-feature coupling low.

### Practical dependency rules you can adopt today

1. **Feature modules should not depend on other feature modules** (default rule).
2. Put shared contracts/models in `:core:model` or a small contract module.
3. Use `implementation` by default; use `api` only with explicit reason.
4. Keep heavy infra libs (Retrofit/Room) out of modules that don’t need them.
5. Add architecture checks in code review (or with dependency graph tooling).

### Quick “dependency smell” checklist

If a feature module has any of these, investigate:

- > 5–7 internal module dependencies
- both `retrofit` and `room` in a pure UI feature
- direct dependency on another feature module
- many `api(...)` entries without clear justification

These are early signals of dependency explosion.

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
