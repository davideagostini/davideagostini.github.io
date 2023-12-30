---
author: Davide Agostini
pubDatetime: 2021-12-27T10:25:54.547Z
title: Ransom note challenge in Kotlin
slug: ransom-note-challenge-in-kotlin
featured: true
ogImage: /assets/ransom-note-challenge-in-kotlin.png
tags:
  - programming
  - algorithms
  - code interview
description: "Microsoft's most commonly asked interview questions according to LeetCode."
---

Given an arbitrary ransom note string and another string containing letters from all the magazines, write a function that will return **true** if the ransom note can be constructed from the magazines; otherwise, return **false**.

**Each letter in the magazine can only be used once in your ransom note.**

Consider this example:

```
    "a", "b" -> false
    "aa", "ab" -> false
    "aa", "aab" -> true
```

## A quick review of Hashing

In the below solution, we use the hashmap to save the data. For this reason, before presenting the solution it’s important to do a quick review of **hashing**.

**Hashing** is used to map data of arbitrary size to data of a fixed size.

A **Hash map** is a structure that can map keys to values. They use a hash function to intelligently figure out where to store elements. All operations reading, insertion and deletion take a constant amount of time **`O(1)`**.

If two keys map to the same value, a **collision occurs**.

A common way to handle collisions is to use **chaining**. With **chaining** `keys` and their `values` are not stored directly in the array. Each array element is a list of zero or more key/values pairs. In this case, the time for hash map operations is the time to find the bucket (constant time), plus the time to iterate through the list.

## The solution

A possible solution is to count the occurrences in the magazine string and save there in an `hashmap`. After that, cycle on ransom note and decrement the value for each character encountered. If the corresponding value inside the hash is less than zero return **false**, otherwise return **true**.

```kotlin
    fun canConstruct(ransomNote: String, magazine: String): Boolean {
        val counts = mutableMapOf<Char, Int>()
        for (c in magazine.toCharArray()) {
            counts[c] = counts.getOrDefault(c, 0) + 1
        }

        for (r in ransomNote.toCharArray()) {
            if (!counts.containsKey(r) || counts[r]!! <= 0) {
                return false
            }
            counts[r] = counts.getOrDefault(r, 0) - 1
        }

        return true
    }
```

## Time and space complexity

- The **time** complexity is equal to `O(m)` for magazine string and `O(n)` for the ransom string. The final result is `O(m) + O(n)`.
- The **space** complexity is equal to `O(n)` the space to save the hash in memory.

Before concluding I recommend you to like and share this post and leave a comment. It costs you nothing while it encourages me to continue producing other similar content. Thanks for your support.

See you in the next algorithms. 😉
