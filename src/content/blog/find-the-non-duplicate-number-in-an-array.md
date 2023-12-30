---
author: Davide Agostini
pubDatetime: 2022-12-22T10:25:54.547Z
title: Find the non-duplicate number in an array
slug: find-the-non-duplicate-number-in-an-array
featured: true
ogImage: /assets/find-the-non-duplicate-number-in-an-array.png
tags:
  - programming
  - algorithms
  - code interview
description: "Given a non-empty array of integers, every element appears twice except for one. Find that single one."
---

For example, the peculiarity of this array [4, 3, 2, 4, 1, 3, 2] is that all numbers contained within it are duplicates except one. In this particular case, the non-duplicate number is `1`.

## First solution

A possible solution is to use a hashmap and keep the occurrences of each number present in our array.
In the end the `hashmap` contains:

```
  4 => 2
  3 => 2
  2 => 2
  1 => 1
```

The `key` represents the number in my array and the `value` represents the occurrences numbers. Just scroll through our hashmap and return the value with a single occurrence.

```kotlin
  fun singleNumber(nums: List<Int>): Int {

      val occurrence = HashMap<Int, Int>()
      var value = 0

      for (n in nums) {
          occurrence[n] = occurrence.getOrDefault(n, 0) + 1
      }

      for (v in occurrence) {
          if (v.value == 1) {
              value = v.value
          }
      }

      return value
  }
```

## Time and space complexity

- The **time** complexity is `O(n)` for the first cycle and `O(n)` for the second cycle.
- The **space** complexity is equal to `O(n)` that corresponding to the size of the array in memory.

## Second solution

A second and more elegant solution is that of using the `XOR` operator.
Brief recap of `XOR` operator:

```
  1 xor 1 = 0
  0 xor 0 = 0
  1 xor 0 = 1
  0 xor 1 = 1
```

Let’s consider the following array [5, 4, 5] and exec the `xor` operator:

`101 xor 100 => 001 xor 101 => 100`

The final result is **`100`** that corresponds to **`4`** which is actually only present once within our array.
Now let’s consider this array [5, 4, 4, 5] and exec the `xor` operator:

`101 xor 100 => 001 xor 100 => 101 xor 101 => 000`

The final result is `000` and in this second array, all elements are duplicated.

```kotlin
  fun singleNumber2(nums: List<Int>): Int {
      var unique = 0

      for (n in nums) {
          unique = unique xor n
      }

      return unique
  }
```

## Time and space complexity

- The **time** complexity is for the second solution is `O(n)` for the for loop.
- The **space** complexity is equal `O(1)` because at each iteration we will have only one number in memory.

Before concluding I recommend you to like and share this post and leave a comment. It costs you nothing while it encourages me to continue producing other similar content. Thanks for your support.

See you in the next code algorithm. 😉
