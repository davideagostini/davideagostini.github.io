---
title: "Material 3 Theming in Jetpack Compose"
date: "2026-02-21"
description: "Learn how to properly implement Material 3 theming in your Compose apps with dynamic colors, custom color schemes, and best practices."
tags: ["Android", "Jetpack Compose", "Material 3", "Theming", "GDE"]
---

# Material 3 Theming in Jetpack Compose

Material 3 (also called "Material You") is Google's latest design system. It brings **dynamic colors**, **better dark theme support**, and **easier customization** to Jetpack Compose.

Let's learn how to use it properly!

## Why Material 3?

### What Makes M3 Different?

| Feature | Material 2 | Material 3 |
|---------|-----------|-----------|
| **Dynamic Colors** | ❌ No | ✅ Yes (Android 12+) |
| **Color Tokens** | Basic (primary, secondary) | Extended (primary, onPrimary, primaryContainer...) |
| **Dark Theme** | Simple inversion | Nuanced surface tones |
| **Custom Themes** | Manual | Automatic from seed color |

---

## Setting Up Material 3

### 1. Add Dependency

```kotlin
// build.gradle.kts (app level)
dependencies {
    // ============================================================
    // Material 3 - The main library
    // This includes all components and theming support
    // ============================================================
    implementation("androidx.compose.material3:material3")
    
    // ============================================================
    // Material Icons Extended - Optional but recommended
    // Adds more icons beyond the default set
    // ============================================================
    implementation("androidx.compose.material:material-icons-extended")
}
```

---

## The Wrong Way vs The Right Way

### ❌ BAD: Using Hardcoded Colors

```kotlin
// ============================================================
// WHY THIS IS BAD:
// 1. Doesn't work in dark mode
// 2. Hard to maintain
// 3. Doesn't follow Material Design guidelines
// 4. Accessibility issues (contrast)
// ============================================================

@Composable
fun BadButton() {
    Button(
        onClick = { /* ... */ },
        colors = ButtonDefaults.buttonColors(
            // PROBLEM: Hardcoded purple!
            // This stays purple even in dark mode
            containerColor = Color(0xFF6200EE)
        )
    ) {
        Text("Click me")
    }
}
```

### ✅ GOOD: Using Material 3 Tokens

```kotlin
// ============================================================
// WHY THIS IS GOOD:
// 1. Automatic dark/light mode support
// 2. Follows Material Design guidelines
// 3. Good accessibility by default
// 4. Easy to theme
// ============================================================

@Composable
fun GoodButton() {
    Button(
        onClick = { /* ... */ },
        // SOLUTION: Use semantic tokens!
        // MaterialTheme.colorScheme.primary adapts automatically
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary  // ← Magic!
        )
    ) {
        Text("Click me")
    }
}
```

---

## Implementing Dynamic Colors (Android 12+)

### What Are Dynamic Colors?

**Dynamic colors** (Material You) extract colors from the user's wallpaper. This makes each phone unique!

```kotlin
// ============================================================
// DYNAMIC COLORS EXPLAINED:
// On Android 12+:
// - User picks a wallpaper
// - Android extracts a color palette
// - Your app uses those colors automatically!
// 
// This is optional but recommended
// ============================================================

@Composable
fun MyAppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),  // ← Auto-detect system setting
    dynamicColor: Boolean = true,                  // ← Enable dynamic colors
    content: @Composable () -> Unit
) {
    // ============================================================
    // Step 1: Choose the right color scheme
    // ============================================================
    val colorScheme = when {
        // Case 1: Android 12+ (API 31+) AND dynamic colors enabled
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            // Get the context to extract colors
            val context = LocalContext.current
            
            // Choose dark or light based on system
            if (darkTheme) {
                // dynamicDarkColorScheme extracts colors optimized for dark mode
                dynamicDarkColorScheme(context)
            } else {
                // dynamicLightColorScheme extracts colors optimized for light mode
                dynamicLightColorScheme(context)
            }
        }
        
        // Case 2: Dark theme (fallback for older Android)
        darkTheme -> DarkColorScheme
        
        // Case 3: Light theme (fallback for older Android)
        else -> LightColorScheme
    }

    // ============================================================
    // Step 2: Apply the theme
    // ============================================================
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
```

---

## Creating Custom Color Schemes

### From Seed Color

You can generate a complete color scheme from a single color:

```kotlin
// ============================================================
// FROM SEED COLOR - Generate entire scheme from one color!
// This is super useful for brand colors
// ============================================================

@Composable
fun BrandTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    // Your brand color - this becomes the primary
    val seedColor = Color(0xFF6750A4)  // ← Change this to your brand color!
    
    // ============================================================
    // ColorScheme.from() generates all colors from the seed
    // It creates primary, secondary, tertiary, surfaces, etc.
    // ============================================================
    val colorScheme = when {
        // Dynamic colors on Android 12+
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        
        // Custom scheme from seed (fallback)
        darkTheme -> ColorScheme.from(
            color = seedColor,
            brightness = Brightness.Dark  // ← Generate dark variant
        )
        
        // Custom scheme from seed (light)
        else -> ColorScheme.from(
            color = seedColor,
            brightness = Brightness.Light  // ← Generate light variant
        )
    }
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
```

---

## Creating a Custom Theme (Complete Example)

Here's a production-ready custom theme:

```kotlin
// ============================================================
// CUSTOM THEME - Your own branding!
// ============================================================

// Define your brand colors
object BrandColors {
    // Primary brand color - used for main actions
    val Purple40 = Color(0xFF6750A4)
    val PurpleGrey40 = Color(0xFF625B71)
    val Pink40 = Color(0xFF7D5260)
    
    // Dark variants
    val Purple80 = Color(0xFFD0BCFF)
    val PurpleGrey80 = Color(0xFFCCC2DC)
    val Pink80 = Color(0xFFEFB8C8)
}

@Composable
fun ClipVaultTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    // ============================================================
    // Step 1: Define color schemes for light and dark
    // ============================================================
    val lightColorScheme = ColorScheme(
        // Primary - Main brand color
        primary = BrandColors.Purple40,
        onPrimary = Color.White,
        primaryContainer = BrandColors.Purple80,
        onPrimaryContainer = Color(0xFF21005D),
        
        // Secondary
        secondary = BrandColors.PurpleGrey40,
        onSecondary = Color.White,
        secondaryContainer = BrandColors.PurpleGrey80,
        onSecondaryContainer = Color(0xFF1D192B),
        
        // Tertiary
        tertiary = BrandColors.Pink40,
        onTertiary = Color.White,
        tertiaryContainer = BrandColors.Pink80,
        onTertiaryContainer = Color(0xFF31111D),
        
        // Background & Surface
        background = Color(0xFFFFFBFE),
        onBackground = Color(0xFF1C1B1F),
        surface = Color(0xFFFFFBFE),
        onSurface = Color(0xFF1C1B1F),
        
        // Error
        error = Color(0xFFB3261E),
        onError = Color.White
    )
    
    val darkColorScheme = ColorScheme(
        // Primary - Dark variant
        primary = BrandColors.Purple80,
        onPrimary = Color(0xFF381E72),
        primaryContainer = BrandColors.Purple40,
        onPrimaryContainer = BrandColors.Purple80,
        
        // Secondary
        secondary = BrandColors.PurpleGrey80,
        onSecondary = Color(0xFF332D41),
        secondaryContainer = BrandColors.PurpleGrey40,
        onSecondaryContainer = BrandColors.PurpleGrey80,
        
        // Tertiary
        tertiary = BrandColors.Pink80,
        onTertiary = Color(0xFF492532),
        tertiaryContainer = BrandColors.Pink40,
        onTertiaryContainer = BrandColors.Pink80,
        
        // Background & Surface
        background = Color(0xFF1C1B1F),
        onBackground = Color(0xFFE6E1E5),
        surface = Color(0xFF1C1B1F),
        onSurface = Color(0xFFE6E1E5),
        
        // Error
        error = Color(0xFFF2B8B5),
        onError = Color(0xFF601410)
    )
    
    // ============================================================
    // Step 2: Choose which scheme to use
    // ============================================================
    val colorScheme = when {
        // Android 12+ with dynamic colors
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        
        // Custom dark/light schemes
        darkTheme -> darkColorScheme
        else -> lightColorScheme
    }
    
    // ============================================================
    // Step 3: Apply Typography
    // ============================================================
    val typography = Typography(
        // Display styles - for large text
        displayLarge = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Normal,
            fontSize = 57.sp,
            lineHeight = 64.sp,
            letterSpacing = (-0.25).sp
        ),
        
        // Headline styles - for section headers
        headlineLarge = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Normal,
            fontSize = 32.sp,
            lineHeight = 40.sp,
            letterSpacing = 0.sp
        ),
        
        // Title styles - for card titles
        titleLarge = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Normal,
            fontSize = 22.sp,
            lineHeight = 28.sp,
            letterSpacing = 0.sp
        ),
        
        // Body styles - for regular text
        bodyLarge = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Normal,
            fontSize = 16.sp,
            lineHeight = 24.sp,
            letterSpacing = 0.5.sp
        ),
        
        // Label styles - for buttons, captions
        labelLarge = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Medium,
            fontSize = 14.sp,
            lineHeight = 20.sp,
            letterSpacing = 0.1.sp
        )
    )
    
    // ============================================================
    // Step 4: Apply the theme to your app
    // ============================================================
    MaterialTheme(
        colorScheme = colorScheme,
        typography = typography,
        content = content
    )
}
```

---

## Using Your Custom Theme

```kotlin
// ============================================================
// USING THE THEME IN YOUR APP
// ============================================================

@Composable
fun MainApp() {
    // Wrap everything in your theme
    ClipVaultTheme {
        // Now all Material 3 components use your colors!
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("ClipVault") },
                    colors = TopAppBarDefaults.topAppBarColors(
                        // These colors come from your theme!
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                )
            }
        ) { padding ->
            Column(
                modifier = Modifier.padding(padding)
            ) {
                // Primary button - uses your brand color!
                Button(
                    onClick = { }
                ) {
                    Text("Primary")
                }
                
                // Secondary button
                OutlinedButton(
                    onClick = { }
                ) {
                    Text("Secondary")
                }
                
                // Text button
                TextButton(
                    onClick = { }
                ) {
                    Text("Text Button")
                }
                
                // Card with your surface colors
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Text(
                        "Card with variant surface color",
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }
    }
}
```

---

## Typography in Material 3

### Understanding Typography Tokens

```kotlin
// ============================================================
// MATERIAL 3 TYPOGRAPHY SYSTEM
// ============================================================

val Typography = Typography(
    // DISPLAY - Largest text, for very prominent headings
    displayLarge = TextStyle(fontSize = 57.sp),
    displayMedium = TextStyle(fontSize = 45.sp),
    displaySmall = TextStyle(fontSize = 36.sp),
    
    // HEADLINE - Section headers
    headlineLarge = TextStyle(fontSize = 32.sp),
    headlineMedium = TextStyle(fontSize = 28.sp),
    headlineSmall = TextStyle(fontSize = 24.sp),
    
    // TITLE - Card titles, list headers
    titleLarge = TextStyle(fontSize = 22.sp),
    titleMedium = TextStyle(fontSize = 16.sp, letterSpacing = 0.15.sp),
    titleSmall = TextStyle(fontSize = 14.sp, letterSpacing = 0.1.sp),
    
    // BODY - Regular text content
    bodyLarge = TextStyle(fontSize = 16.sp, letterSpacing = 0.5.sp),
    bodyMedium = TextStyle(fontSize = 14.sp, letterSpacing = 0.25.sp),
    bodySmall = TextStyle(fontSize = 12.sp, letterSpacing = 0.4.sp),
    
    // LABEL - Buttons, captions
    labelLarge = TextStyle(fontSize = 14.sp, letterSpacing = 0.1.sp),
    labelMedium = TextStyle(fontSize = 12.sp, letterSpacing = 0.5.sp),
    labelSmall = TextStyle(fontSize = 11.sp, letterSpacing = 0.5.sp)
)
```

---

## Color Tokens Reference

### Primary Colors

| Token | Use For | Light | Dark |
|-------|---------|-------|------|
| `primary` | Main actions | Purple 40 | Purple 80 |
| `onPrimary` | Text on primary | White | Dark Purple |
| `primaryContainer` | Cards, surfaces | Purple 80 | Purple 40 |
| `onPrimaryContainer` | Text on primary container | Dark Purple | Purple 80 |

### Surface Colors

| Token | Use For | Light | Dark |
|-------|---------|-------|------|
| `surface` | Background | White | Dark |
| `onSurface` | Text on surface | Dark | White |
| `surfaceVariant` | Secondary surfaces | Light Gray | Dark Gray |
| `onSurfaceVariant` | Text on surface variant | Gray | Light Gray |

---

## Quick Decision Guide

**🎯 Which colors to use?**

- **Primary** → Main actions, buttons, links
- **Secondary** → Secondary actions, filters
- **Tertiary** → Accents, highlights
- **Surface** → Backgrounds, cards
- **Error** → Error states, destructive actions

**🎯 Dynamic colors?**

- **Enable by default** → Better user experience on Android 12+
- **Provide fallback** → Always have light/dark schemes ready
- **Brand consistency** → Use seed color for custom themes

---

## Common Mistakes

### ❌ Don't Hardcode Colors

```kotlin
// BAD
Text(color = Color(0xFF6200EE))

// GOOD
Text(color = MaterialTheme.colorScheme.primary)
```

### ❌ Don't Forget Dark Mode

```kotlin
// BAD
Background(color = Color.White)

// GOOD
Background(color = MaterialTheme.colorScheme.surface)
```

### ❌ Don't Skip Typography

```kotlin
// BAD
Text(fontSize = 20.sp)

// GOOD
Text(style = MaterialTheme.typography.titleLarge)
```

---

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Always use Material 3 color tokens (MaterialTheme.colorScheme.primary, etc.) instead of hardcoded colors. Enable dynamic colors on Android 12+ for a personalized experience, but always provide fallback color schemes. Create a custom theme by defining your brand colors in ColorScheme - this ensures consistency across light/dark modes and makes future changes easy!</p>
</div>
