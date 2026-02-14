---
title: "Why Your LazyColumn Recomposes Everything: Understanding Item Stability in Compose"
date: "2026-02-13"
description: "Learn why your LazyColumn items keep recomposing and how to fix stability issues for smooth scrolling performance."
tags: ["Jetpack Compose", "Performance", "LazyColumn", "Android", "Kotlin"]
---

Understanding LazyColumn performance is crucial for building smooth Android apps. One common pitfall? **Unstable data classes causing unnecessary recompositions**.

## The Problem: Unstable Items Trigger Full Recomposition

When you pass a `List<User>` to a `LazyColumn`, Compose needs to know if items change. If your `User` data class isn't **stable**, Compose can't skip unchanged items—it recomposes everything.

## What Makes a Class Stable?

A class is **stable** when:
- It's a `data class` with only `val` properties (immutable)
- All property types are themselves stable (primitives, Strings, stable classes)
- Compose can guarantee the object won't change between renders

### 🚨 BAD: Unstable Data Class

```kotlin
// ❌ This causes LazyColumn to recompose ALL items when list changes
data class User(
    val id: Int,
    val name: String,
    val email: String,
    val isActive: Boolean = true
)

// Problem: When you add/remove one user, Compose might recompose ALL rows
// because it can't guarantee stability across the list
@Composable
fun UserList(users: List<User>) {
    LazyColumn {
        items(users) { user ->
            UserRow(user)  // ⚠️ Recomposed unnecessarily!
        }
    }
}
```

### ✅ GOOD: Stable & Performant

```kotlin
// ✅ Compose can track items by stable identity
// Use Stable marker or ensure all properties are stable
@Composable
fun UserList(users: List<User>) {
    // Key function helps Compose track item identity
    LazyColumn {
        items(
            items = users,
            key = { user -> user.id  // 👈 Critical for performance!
        }) { user ->
            UserRow(user = user)
        }
    }
}

// ✅ Even better: Use stable, immutable collections
// When you need to update the list, create a NEW list
fun refreshUsers(): List<User> {
    return listOf(
        User(1, "Alice", "alice@example.com"),
        User(2, "Bob", "bob@example.com")
        // This new list reference tells Compose something changed
    )
}
```

## Common Stability Gotchas

### ⚠️ Watch Out for These Types

```kotlin
// ❌ UNSTABLE - MutableList can change anytime
@Composable
fun BadExample(users: MutableList<User>) {
    LazyColumn {
        items(users) { user -> UserRow(user) }
    }
}

// ❌ UNSTABLE - Regular Date class
data class Event(
    val name: String,
    val date: Date  // 👈 java.util.Date is NOT stable!
)

// ✅ STABLE - Use Long for timestamps instead
data class EventStable(
    val name: String,
    val timestamp: Long  // 👈 Stable primitive type
)

// ✅ STABLE - Use kotlinx.datetime.Instant
data class EventModern(
    val name: String,
    val instant: Instant
)
```

## Memory Leaks: Another Performance Killer

LazyColumn items that hold references can cause **memory leaks** if not handled properly.

```kotlin
// ❌ BAD: Capturing context in lambda
@Composable
fun UserRowBad(user: User) {
    val context = LocalContext.current  // 👈 Captured in closure

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable {
                // This lambda captures context → potential leak
                Toast.makeText(context, user.name, Toast.LENGTH_SHORT).show()
            }
    ) {
        Text(text = user.name)
    }
}

// ✅ GOOD: Use derivedStateOf or remember for context access
@Composable
fun UserRowGood(user: User) {
    val context = LocalContext.current

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable {
                // Context accessed only when clicked
                Toast.makeText(context, user.name, Toast.LENGTH_SHORT).show()
            }
    ) {
        Text(text = user.name)
    }
}

// ✅ BETTER: Extract click handler to avoid capturing in composition
@Composable
fun UserRowBetter(user: User, onUserClick: (User) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onUserClick(user) }  // 👈 No captured context
    ) {
        Text(text = user.name)
    }
}
```

## The Key Takeaway Box

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Fix LazyColumn performance by: (1) Adding <code>key</code> parameter to <code>items()</code>, (2) Using immutable/stable data classes, and (3) avoiding captured lambdas. Run <code>./gradlew assembleDebug --no-daemon && ./gradlew lint</code> to catch issues early. Profile with Layout Inspector to identify recomposition hotspots.</p>
</div>
