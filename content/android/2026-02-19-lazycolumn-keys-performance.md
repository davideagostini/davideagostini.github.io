---
title: "Stop Recomposing Your List! LazyColumn Keys That Actually Work"
date: "2026-02-19"
description: "Learn how to use stable keys in LazyColumn to prevent unnecessary recompositions and boost your Compose UI performance."
tags: ["compose", "performance"]
---

# Stop Recomposing Your List! LazyColumn Keys That Actually Work

If you've ever noticed your LazyColumn recomposing every item when just one item changes, you're not alone. This is one of the most common performance pitfalls in Jetpack Compose — and it's easy to fix once you understand **stable keys**.

## The Problem

Without stable keys, Compose has no way to know which item is which. When the list updates, it assumes everything might have changed and recomposes the entire list. This kills performance, especially with complex items.

## The Solution: Use Stable Keys

The `key` parameter in LazyColumn tells Compose exactly which item is which. When the list changes, Compose can skip recomposing items that didn't actually change.

## Code Example: The BAD Way ❌

```kotlin
@Composable
fun UserListBad(users: List<User>) {
    LazyColumn {
        items(users) { user ->
            // ❌ PROBLEM: No key provided!
            // When one user updates, ALL items recompose
            UserRow(user = user)
        }
    }
}
```

**Why it's bad:** Every time `users` changes (even one item!), Compose treats this as a brand new list. It has no way to know which specific user changed, so it recomposes every single row.

## Code Example: The GOOD Way ✅

```kotlin
@Composable
fun UserListGood(users: List<User>) {
    LazyColumn {
        items(
            items = users,
            key = { user -> user.id } // ✅ Stable, unique key per item
        ) { user ->
            UserRow(user = user)
        }
    }
}
```

**Why it's good:** By providing `user.id` as a key, Compose can now track each item individually. When user #3 updates, only that specific row recomposes — the others stay untouched!

## Even Better: Use Stable Classes

Make sure your data class is stable (Compose can trust it won't change unexpectedly):

```kotlin
// ✅ Stable class - Compose can track changes reliably
data class User(
    val id: String,
    val name: String,
    val avatarUrl: String
)

// For complex types, add @Stable or @Immutable annotation:
// @Immutable
// data class User(...)
```

## Pro Tip: Keys Must Be Unique!

```kotlin
// ❌ BAD: Duplicate keys cause crashes or weird behavior
key = { user -> user.name } // Two "John" users = same key!

// ✅ GOOD: Always use unique identifiers
key = { user -> user.id } // Unique by design
```

## When to Use Keys

- Every LazyColumn/LazyVerticalGrid should use keys
- Use stable, unique identifiers (database IDs, UUIDs)
- Never use list indices — they shift when items are added/removed

<div class="key-takeaway">
  <h3>🔑 Key Takeaway</h3>
  <p><strong>Always provide stable, unique keys in LazyColumn.</strong> It’s a one-line change that can reduce recompositions by 90%+ and make your list scroll butter-smooth. Your users will thank you!</p>
</div>
