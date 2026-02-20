---
title: "Navigation Compose: Stop Fighting Your Router"
date: "2026-02-20"
description: "A practical guide to Navigation Compose that will make your app flow feel natural. No more argument passing nightmares or navigation graph spaghetti."
tags: ["Android", "Jetpack Compose", "Navigation", "Best Practices"]
---

# Navigation Compose: Stop Fighting Your Router

Navigation in Android has always been... let's say *challenging*. Fragment transactions, argument bundles, deep linking headaches. Navigation Compose simplifies all of that — but only if you use it right.

Let me show you the common mistakes and how to fix them.

## The Problem: Navigation Graph Spaghetti

When teams first adopt Navigation Compose, they often end up with:

- Hardcoded routes scattered everywhere
- Passing complex objects through arguments (serialization issues!)
- Deep links that don't match the in-app navigation

Sound familiar? Let's fix it.

## ❌ BAD: Hardcoded Routes Everywhere

```kotlin
// ❌ BAD: Hardcoded strings lead to typos and bugs
// If you change a route, you must find ALL references manually

@Composable
fun HomeScreen(navController: NavController) {
    Column {
        Button(
            onClick = {
                // Magic string - easy to typo, hard to maintain
                navController.navigate("detail/42")
            }
        ) {
            Text("Go to Detail")
        }
        
        Button(
            onClick = {
                // Another magic string
                navController.navigate("profile/john")
            }
        ) {
            Text("View Profile")
        }
    }
}
```

### Problems with this approach:
1. **No type safety** — "detail/42" can be typo'd
2. **No compile-time checking** — routes won't compile if they don't exist
3. **Refactoring nightmare** — change a route, hunt down every usage

## ✅ GOOD: Type-Safe Routes with Sealed Classes

```kotlin
// ✅ GOOD: Single source of truth for all routes
// Navigation graph knows every possible destination

sealed class Screen(val route: String) {
    data object Home : Screen("home")
    data object Detail : Screen("detail/{itemId}") {
        // Helper function creates the route with parameter
        fun createRoute(itemId: Int) = "detail/$itemId"
    }
    data class Profile(val userId: String) : Screen("profile/$userId") {
        // For complex objects, use JSON serialization
        // We'll see this in the next section
    }
}

// Clean, type-safe navigation
@Composable
fun HomeScreen(navController: NavController) {
    Column {
        Button(
            onClick = { navController.navigate(Screen.Detail.createRoute(42)) }
        ) {
            Text("Go to Detail")
        }
        
        Button(
            onClick = { navController.navigate(Screen.Profile("john").route) }
        ) {
            Text("View Profile")
        }
    }
}
```

**Why this works:**
- ✅ **Type safety** — compiler catches missing routes
- ✅ **Single source of truth** — one sealed class for entire app
- ✅ **IDE autocomplete** — your IDE helps you find routes
- ✅ **Refactoring safe** — change route in one place

## ❌ BAD: Passing Complex Objects as Arguments

```kotlin
// ❌ BAD: Trying to pass a complex object via navigation
// This will crash or lose data!

data class User(val id: String, val name: String, val email: String)

sealed class Screen(val route: String) {
    data object UserDetail : Screen("user/{user}")
}

// In practice, this fails because User isn't a primitive
navController.navigate("user/${User("1", "John", "john@email.com")}")
```

### Why this fails:
1. Routes are strings — complex objects don't serialize automatically
2. You'll get runtime crashes or empty data
3. Deep links won't work (they're URL-based)

## ✅ GOOD: Pass IDs, Fetch Data in Destination

```kotlin
// ✅ GOOD: Pass only IDs, let the destination fetch data
// This works with deep links AND in-app navigation

sealed class Screen(val route: String) {
    // Simple, serializable parameter
    data object UserDetail : Screen("user/{userId}") {
        fun createRoute(userId: String) = "user/$userId"
    }
}

@Composable
fun UserDetailScreen(
    navController: NavController,
    viewModel: UserDetailViewModel = hiltViewModel()
) {
    // Get the ID from navigation - backstack saves state!
    val userId: String = navController.currentBackStackEntry
        ?.arguments
        ?.getString("userId") ?: return
    
    // Fetch data using the ID - proper separation of concerns
    val user by viewModel.user.collectAsState()
    
    UserDetailContent(user = user)
}

// Deep link works automatically!
// user/42 opens the same screen with userId="42"
```

**Benefits:**
- ✅ Deep links work out of the box
- ✅ State survives process death (saved state handle)
- ✅ Clean separation: navigation just passes IDs
- ✅ ViewModel fetches data — proper architecture

## The Navigation Graph: Keep It Organized

```kotlin
@Composable
fun AppNavHost() {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(navController)
        }
        
        composable(
            route = Screen.Detail.route,
            arguments = listOf(
                navArgument("itemId") { type = NavType.IntType }
            )
        ) {
            DetailScreen()
        }
        
        // Deep link support - automatic!
        composable(
            route = Screen.UserDetail.route,
            arguments = listOf(
                navArgument("userId") { type = NavType.StringType }
            ),
            deepLinks = listOf(
                deepLink("https://davideagostini.com/user/{userId}")
            )
        ) {
            UserDetailScreen()
        }
    }
}
```

## Key Takeaway

> **Navigation Compose isn't just a replacement for Fragments — it's a chance to build type-safe, refactorable navigation.** 

> Stop passing objects. Stop magic strings. Use sealed classes for routes, pass only IDs, and let deep linking work for you automatically.

The difference between fighting your router and embracing it is these few patterns. Your app — and your team — will thank you.

---

*Want more Android Compose tips? Follow for weekly deep dives into modern Android development.*
