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
// ✅ Navigation 3: Type-safe, compile-time checking!
@Composable
fun NavHost(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Routes.HOME
    ) {
        composable<Routes.Home> { HomeScreen() }
        
        // GOOD: Type-safe route - compiler catches errors!
        composable<Routes.UserDetail> { backStackEntry ->
            val userId = backStackEntry.toRoute<Routes.UserDetail>().userId
            UserDetailScreen(userId = userId)
        }
    }
}

// Calling navigation:
navController.navigate(Routes.UserDetail(userId = 123))  // ← Type-safe, autocomplete works!
```

---

## Setting Up Navigation 3

### 1. Add Dependencies

```kotlin
// build.gradle.kts (project level)
plugins {
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.22"
}

// build.gradle.kts (app level)
dependencies {
    implementation("androidx.navigation:navigation-compose:2.8.0")
}
```

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
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = Routes.Home
    ) {
        // ============================================================
        // composable<T> - Type-safe route definition
        // ============================================================
        
        composable<Routes.Home> {
            HomeScreen(
                onUserClick = { userId ->
                    // ============================================================
                    // Type-safe navigation - compiler knows what to pass!
                    // ============================================================
                    navController.navigate(Routes.UserDetail(userId = userId))
                }
            )
        }
        
        composable<Routes.UserDetail> { backStackEntry ->
            // ============================================================
            // Get arguments as typed objects!
            // ============================================================
            val route = backStackEntry.toRoute<Routes.UserDetail>()
            val userId = route.userId  // ← Already typed as Long!
            
            UserDetailScreen(
                userId = userId,
                onBack = { navController.popBackStack() }
            )
        }
        
        composable<Routes.ProductDetail> { backStackEntry ->
            val route = backStackEntry.toRoute<Routes.ProductDetail>()
            ProductDetailScreen(
                productId = route.productId,
                category = route.category
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
