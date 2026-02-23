---
title: "Material 3 Theming in Jetpack Compose"
date: "2026-02-21"
description: "Learn how to properly implement Material 3 theming in your Compose apps with dynamic colors, custom color schemes, and best practices."
tags: ["Android", "Jetpack Compose", "Material 3", "Theming", "GDE"]
---

# Material 3 Theming in Jetpack Compose

Material 3 (Material You) brings dynamic colors and a more flexible theming system to Jetpack Compose. Let's dive into how to implement it properly.

## Why Material 3?

- **Dynamic Colors**: Extracts colors from the user's wallpaper (Android 12+)
- **Better dark theme support**: More nuanced color tokens
- **Flexible color schemes**: Easily create custom schemes from seeds

## Setting Up Material 3

First, add the dependency:

```kotlin
// build.gradle.kts
dependencies {
    implementation("androidx.compose.material3:material3")
}
```

## The Wrong Way vs The Right Way

### ❌ BAD: Using static colors everywhere

```kotlin
@Composable
fun BadButton() {
    Button(
        onClick = { /* ... */ },
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF6200EE) // Hardcoded color!
        )
    ) {
        Text("Click me")
    }
}
```

### ✅ GOOD: Using Material 3 color tokens

```kotlin
@Composable
fun GoodButton() {
    Button(
        onClick = { /* ... */ },
        // Uses M3 semantic tokens automatically
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary
        )
    ) {
        Text("Click me")
    }
}
```

## Implementing Dynamic Colors (Android 12+)

### ❌ BAD: Ignoring dynamic theming

```kotlin
@Composable
fun MyTheme(content: @Composable () -> Unit) {
    MaterialTheme {
        content() // Always uses default seed color
    }
}
```

### ✅ GOOD: Dynamic color support

```kotlin
@Composable
fun MyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true, // Enable by default
    content: @Composable () -> Unit
) {
    // Dynamic color available on Android 12+
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme  // Fallback
        else -> LightColorScheme      // Fallback
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
```

## Custom Color Schemes from Seed

```kotlin
// Generate a custom scheme from a brand color
private fun customColorScheme(seedColor: Color): ColorScheme {
    return run {
        val scheme = ColorScheme.from(
            color = seedColor,
            brightness = Brightness.Light
        )
        scheme
    }
}

// Usage in theme
val brandColor = Color(0xFF6750A4) // Your brand purple
val colorScheme = ColorScheme.from(color = brandColor)
```

## Typography in Material 3

```kotlin
val Typography = Typography(
    // M3 uses new token names
    displayLarge = TextStyle(...),
    headlineMedium = TextStyle(...),
    bodyLarge = TextStyle(...),
    labelSmall = TextStyle(...)
)
```

## Key Takeaways

- ✅ Use `MaterialTheme.colorScheme.*` instead of hardcoded colors
- ✅ Enable dynamic colors for Android 12+ devices
- ✅ Provide fallback color schemes for older Android versions
- ✅ Use semantic tokens (primary, secondary, surface) for consistency
- ✅ Test both light and dark themes during development

---

> **Pro tip**: Material 3 tokens automatically adapt to both light and dark themes. Always use the semantic tokens like `MaterialTheme.colorScheme.primary` instead of hardcoding colors!
