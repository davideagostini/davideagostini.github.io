---
title: "Navigation Compose 3: Type-Safe Routing Done Right"
date: "2026-02-21"
description: "Master Navigation Compose 3 with type-safe arguments, Serializable support, NavigationSuite for tablets, and the new routing patterns that make navigation effortless."
tags: ["Android", "Jetpack Compose", "Navigation", "Navigation Compose 3", "Type-Safe"]
---

Navigation Compose 3 is a game-changer. No more `arguments?.getString()`, no more runtime crashes from typos. The new type-safe system makes navigation bulletproof.

Let me show you what's new and how to migrate.

## What's New in Navigation Compose 3

### The Old Way (Navigation 2)

```kotlin
// ❌ Navigation 2: Error-prone, no compile-time checking
@Composable
fun NavHost(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") { HomeScreen() }
        
        // BAD: String-based route - typos = crash!
        composable("user/{userId}") { backStackEntry ->
            val userId = backStackEntry.arguments?.getString("userId")  // ← Runtime error possible!
            UserDetailScreen(userId = userId!!)
        }
    }
}

// Calling navigation:
navController.navigate("user/123")  // ← Magic string, no autocomplete
```

### The New Way (Navigation 3)

```kotlin
// ============================================================
// NAVIGATION 3 IMPORTS - Different from Navigation 2!
// ============================================================
import androidx.navigation3.NavHost
import androidx.navigation3.composable
import androidx.navigation3.toRoute
import androidx.navigation3.rememberNavController
import androidx.lifecycle.viewmodel.compose.navigation3 as viewModelNavigation3

// ✅ Navigation 3: Type-safe, compile-time checking!
@Composable
fun NavHost(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Routes.HOME  // ← Use the sealed class!
    ) {
        // ============================================================
        // composable<T> - Type-safe route registration
        // The <Routes.Home> tells the compiler exactly what to expect
        // ============================================================
        composable<Routes.Home> { HomeScreen() }
        
        // GOOD: Type-safe route - compiler catches errors!
        // If you make a typo, your app won't compile!
        composable<Routes.UserDetail> { backStackEntry ->
            // ============================================================
            // toRoute<T>() - Convert back stack entry to typed object
            // This is the magic of Navigation 3!
            // ============================================================
            val userId = backStackEntry.toRoute<Routes.UserDetail>().userId
            UserDetailScreen(userId = userId)
        }
    }
}

// Calling navigation - NO MORE STRINGS!
navController.navigate(Routes.UserDetail(userId = 123))
// ↑ Autocomplete works! Compiler knows exactly what to pass!
```

---

## Setting Up Navigation 3

### 1. Add Dependencies (Official Guide)

**NOTE:** Navigation 3 is now **stable (v1.0.0)**! Use the version catalog approach for best results.

---

#### Option A: Using Version Catalog (Recommended)

```kotlin
// gradle/libs.versions.toml
[versions]
nav3 = "1.0.0"
lifecycleNav3 = "2.10.0-rc01"
serialization = "1.7.3"

[libraries]
# Core Navigation 3 - REQUIRED
androidx-navigation3-runtime = { module = "androidx.navigation3:navigation3-runtime", version.ref = "nav3" }
androidx-navigation3-ui = { module = "androidx.navigation3:navigation3-ui", version.ref = "nav3" }

# ViewModel integration - Only if you need ViewModels scoped to screens
androidx-lifecycle-viewmodel-navigation3 = { module = "androidx.lifecycle:lifecycle-viewmodel-navigation3", version.ref = "lifecycleNav3" }

# Material 3 Adaptive - For NavigationSuite (tablets)
androidx-material3-adaptive-navigation3 = { module = "androidx.compose.material3:material3-adaptive-navigation-suite" }

# Serialization - REQUIRED for type-safe routes!
kotlinx-serialization-core = { module = "org.jetbrains.kotlinx:kotlinx-serialization-core", version.ref = "serialization" }

[plugins]
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "serialization" }
```

```kotlin
// build.gradle.kts (app level)
plugins {
    id("kotlin-serialization")
}

dependencies {
    // Core - REQUIRED
    implementation(libs.androidx.navigation3.ui)
    implementation(libs.androidx.navigation3.runtime)
    
    // ViewModel integration - Optional
    implementation(libs.androidx.lifecycle.viewmodel.navigation3)
    
    // Material 3 Adaptive - Optional (for tablets)
    implementation(libs.androidx.material3.adaptive.navigation3)
    
    // Serialization - REQUIRED for type-safe routes!
    implementation(libs.kotlinx.serialization.core)
}
```

---

#### Option B: Direct Dependencies (Simpler)

```kotlin
// build.gradle.kts (app level)
plugins {
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.22"
}

dependencies {
    // ============================================================
    // Navigation 3 - Stable version (1.0.0)!
    // ============================================================
    
    // Core - REQUIRED for all Navigation 3 apps
    implementation("androidx.navigation3:navigation3-ui:1.0.0")
    implementation("androidx.navigation3:navigation3-runtime:1.0.0")
    
    // ViewModel Integration - OPTIONAL
    // Use this if you want ViewModels scoped to individual screens
    implementation("androidx.lifecycle:lifecycle-viewmodel-navigation3:2.10.0-rc01")
    
    // Material 3 Adaptive - OPTIONAL
    // Use this for NavigationSuite (tablets/foldables)
    implementation("androidx.compose.material3:material3-adaptive-navigation-suite:1.0.0")
    
    // ============================================================
    // Serialization - REQUIRED for type-safe routes!
    // ============================================================
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:1.7.3")
}
```

---

### 2. Define Routes with Serializable

```kotlin
// ============================================================
// ROUTES: Define all possible screens as sealed class
// ============================================================
@Serializable
sealed class Routes {
    // Screen without arguments
    @Serializable
    data object Home : Routes()
    
    // Screen with arguments - pass data directly!
    @Serializable
    data class UserDetail(val userId: Long) : Routes()
    
    @Serializable
    data class ProductDetail(
        val productId: Long,
        val category: String = "default"
    ) : Routes()
    
    // Dialog/Modal screens
    @Serializable
    data object Settings : Routes()
}
```

---

## Type-Safe Navigation

### Creating the NavHost

```kotlin
// ============================================================
// NAVIGATION 3 - Type-Safe Navigation
// ============================================================

@Composable
fun AppNavigation() {
    // ============================================================
    // Step 1: Create NavController
    // rememberNavController() - Remembers navigation state across recompositions
    // Think of it as: "the brain that knows where we are"
    // ============================================================
    val navController = rememberNavController()
    
    // ============================================================
    // Step 2: Define NavHost with start destination
    // startDestination = The first screen to show
    // ============================================================
    NavHost(
        navController = navController,
        startDestination = Routes.Home  // ← First screen!
    ) {
        // ============================================================
        // Step 3: Register screens with composable<T>
        // <Routes.Home> tells the system: "This is what this screen needs"
        // ============================================================
        
        composable<Routes.Home> {
            // This block runs when we're at the Home screen
            HomeScreen(
                onUserClick = { userId ->
                    // ============================================================
                    // Step 4: Navigate with TYPE SAFETY!
                    // Routes.UserDetail(userId = userId) - Compiler checks this!
                    // No more "user/123" strings!
                    // ============================================================
                    navController.navigate(Routes.UserDetail(userId = userId))
                }
            )
        }
        
        // ============================================================
        // Step 5: Receiving typed arguments
        // toRoute<T>() converts back stack to your sealed class
        // ============================================================
        composable<Routes.UserDetail> { backStackEntry ->
            // ============================================================
            // MAGIC: toRoute<T>() extracts typed arguments!
            // Before: val userId = arguments?.getString("userId")  ← String, could be null!
            // After:  val userId = toRoute<Routes.UserDetail>().userId  ← Long, guaranteed!
            // ============================================================
            val route = backStackEntry.toRoute<Routes.UserDetail>()
            val userId = route.userId  // ← Already typed as Long! No null checks!
            
            UserDetailScreen(
                userId = userId,
                onBack = { navController.popBackStack() }
            )
        }
        
        // ============================================================
        // Multiple arguments work the same way!
        // ============================================================
        composable<Routes.ProductDetail> { backStackEntry ->
            val route = backStackEntry.toRoute<Routes.ProductDetail>()
            ProductDetailScreen(
                productId = route.productId,    // ← Long
                category = route.category       // ← String with default!
            )
        }
    }
}
```

### Navigation with Type Safety

```kotlin
// ============================================================
// HOME SCREEN: Navigate with type safety
// ============================================================
@Composable
fun HomeScreen(
    onUserClick: (Long) -> Unit
) {
    Column {
        Text("Home Screen")
        
        Button(onClick = { onUserClick(123) }) {
            // ============================================================
            // Pass typed data - no strings, no conversion!
            // ============================================================
            Text("View User 123")
        }
        
        Button(onClick = {
            // ============================================================
            // Complex arguments - still type-safe!
            // ============================================================
            navController.navigate(
                Routes.ProductDetail(productId = 456, category = "electronics")
            )
        }) {
            Text("View Product")
        }
    }
}
```

---

## NavigationSuite: Adaptive Navigation

Navigation 3 introduces **NavigationSuite** for tablets/phones:

```kotlin
@Composable
fun AdaptiveNavigation() {
    // ============================================================
    // NavigationSuite - Works on phones AND tablets!
    // ============================================================
    val navController = rememberNavController()
    
    NavigationSuite(
        navController = navController,
        // ============================================================
        // Decide layout based on screen size
        // ============================================================
        layoutType = NavigationSuiteScaffoldLayoutType.NavigationDrawer  // Tablets
        // or: NavigationSuiteScaffoldLayoutType.NavigationRail  // Medium screens
        // or: NavigationSuiteScaffoldLayoutType.BottomNavigation // Phones
    ) {
        // Your NavHost here
        composable<Routes.Home> { HomeScreen() }
        composable<Routes.Settings> { SettingsScreen() }
    }
}
```

---

## Deep Links Made Easy

```kotlin
@Serializable
data class UserDetail(
    val userId: Long,
    val from: String = "home"  // Default parameter works!
) : Routes()

// ============================================================
// Deep links are automatically generated from Serializable!
// ============================================================
composable<Routes.UserDetail>(
    deepLinks = listOf(
        // These URLs now work automatically:
        // https://yourapp.com/user/123
        // https://yourapp.com/user/123?from=push
        navDeepLink<Routes.UserDetail>(
            uriPattern = "https://yourapp.com/user/{userId}?from={from}"
        )
    )
) { backStackEntry ->
    val route = backStackEntry.toRoute<Routes.UserDetail>()
    UserDetailScreen(userId = route.userId)
}
```

---

## Migration Guide: From Navigation 2 to 3

### Step 1: Add Plugin

```kotlin
// build.gradle.kts
plugins {
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.22"
}
```

### Step 2: Convert Routes to Serializable

```kotlin
// BEFORE: String constants
object Routes {
    const val HOME = "home"
    const val USER_DETAIL = "user/{userId}"
}

// AFTER: Serializable sealed class
@Serializable
sealed class Routes {
    data object Home : Routes()
    data class UserDetail(val userId: Long) : Routes()
}
```

### Step 3: Update NavHost

```kotlin
// BEFORE
composable("user/{userId}") { backStackEntry ->
    val userId = backStackEntry.arguments?.getString("userId")!!
}

// AFTER
composable<Routes.UserDetail> { backStackEntry ->
    val userId = backStackEntry.toRoute<Routes.UserDetail>().userId
}
```

### Step 4: Update Navigation Calls

```kotlin
// BEFORE
navController.navigate("user/123")

// AFTER
navController.navigate(Routes.UserDetail(userId = 123))
```

---

## Quick Decision Guide

**🎯 Navigation 3 Essentials:**

- **@Serializable sealed class** → Define all routes
- **composable<T>** → Register screens type-safely
- **toRoute<T>()** → Get arguments as typed objects
- **navController.navigate(Routes.Detail(id))** → Navigate with type safety

**🎯 When to Use What:**

- **Phone** → BottomNavigation
- **Tablet** → NavigationDrawer or NavigationRail
- **Deep links** → Just add @Serializable, they work auto!

---

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Migrate to Navigation 3 ASAP. The type-safe routing catches bugs at compile time, not runtime. Serializable sealed classes replace magic strings, and deep links work automatically. It's a small migration for a huge improvement in code quality.</p>
</div>
