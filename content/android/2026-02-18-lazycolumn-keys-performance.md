---
title: "Jetpack Compose: The One Mistake That's Killing Your LazyColumn Performance"
date: "2026-02-18"
description: "Stop unnecessarily recomposing your LazyColumn items! Learn how to use keys properly and avoid the most common performance pitfall in Compose lists."
tags: ["Jetpack Compose", "Android", "Performance", "LazyColumn", "Kotlin"]
---

# Jetpack Compose: The One Mistake That's Killing Your LazyColumn Performance

If your LazyColumn is lagging or you're seeing unexpected recompositions, you're probably missing one critical piece: **stable keys**.

## The Problem

When you don't provide stable keys to items in your LazyColumn, Compose can't properly track which items correspond to which data. This means every scroll triggers unnecessary recompositions of all visible items.

## The Solution

Always provide a unique, stable key for each item using the `key` parameter:

```kotlin
// ❌ BAD: No keys provided
LazyColumn {
    items(users) { user ->
        UserRow(user = user)
    }
}

// ✅ GOOD: Using stable, unique keys
LazyColumn {
    items(
        items = users,
        key = { user -> user.id }  // Stable ID!
    ) { user ->
        UserRow(user = user)
    }
}
```

## Why This Matters

When Compose knows the stable identity of each item:
- It can **skip** recomposition for unchanged items
- It can **reuse** existing UI state during scroll
- It efficiently handles **insertions/deletions** without full list refreshes

## Realistic Example: User List with Stable Keys

```kotlin
data class User(
    val id: String,      // Stable unique identifier
    val name: String,
    val avatarUrl: String
)

@Composable
fun UserListScreen(users: List<User>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // ✅ Key parameter is CRITICAL for performance!
        items(
            items = users,
            key = { user -> user.id }  // Tell Compose how to track items
        ) { user ->
            UserRow(
                user = user,
                modifier = Modifier.animateItem()  // Smooth animations
            )
        }
    }
}

@Composable
fun UserRow(
    user: User,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        AsyncImage(
            model = user.avatarUrl,
            contentDescription = "Avatar for ${user.name}",
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
        )
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Text(
            text = user.name,
            style = MaterialTheme.typography.bodyLarge
        )
    }
}
```

## Key Takeaway

> **Always provide stable, unique keys to `items{}` in LazyColumn.** Use database IDs, UUIDs, or any stable identifier—never use list positions! This single change can reduce recompositions by 90%+ in list-heavy screens.

The `key` parameter is your most powerful tool for LazyColumn performance. Use it! 🚀

---

*Want more Compose performance tips? Follow for weekly insights!*