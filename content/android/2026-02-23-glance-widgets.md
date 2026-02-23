---
title: "Glance Widgets: Building Your First Android App Widget with Jetpack Compose"
date: "2026-02-23"
description: "Learn how to create modern Android widgets using Jetpack Glance — the declarative way to build app widgets with Compose."
tags: ["Android", "Jetpack Glance", "Widgets", "Jetpack Compose", "Tutorial"]
---

# Glance Widgets: Building Your First Android App Widget with Jetpack Compose

App widgets are a powerful way to keep your app's information visible on the home screen. But building them the traditional way (with RemoteViews and XML) is painful.

Enter **Jetpack Glance** — Google's modern solution for building widgets using the same declarative syntax as Jetpack Compose.

## Why Glance?

### The Old Way: RemoteViews

If you've built widgets before, you know the pain:

- **XML layouts** that are hard to preview
- **Manual state updates** everywhere
- **Limited styling** options
- **No Compose** support

### The New Way: Glance

With Glance, you get:

- **Declarative UI** using Composable functions
- **Material 3** support out of the box
- **State management** with `remember`
- **Easy testing** with Compose testing tools
- **Same syntax** as your regular Compose UI

---

## Setting Up Glance

### 1. Add Dependencies

```kotlin
// build.gradle.kts (app level)
dependencies {
    // ============================================================
    // Glance Core - REQUIRED for all Glance widgets
    // This provides the base GlanceAppWidget, modifiers, etc.
    // ============================================================
    implementation("androidx.glance:glance-appwidget:1.1.1")
    
    // ============================================================
    // Material 3 Support - OPTIONAL but RECOMMENDED
    // This gives you Material 3 components (MaterialTheme, buttons, etc.)
    // ============================================================
    implementation("androidx.glance:glance-material3:1.1.1")
}
```

---

## Creating Your First Widget

### Step 1: Create the Widget Receiver

The receiver is the entry point that Android calls when the widget needs to update.

```kotlin
// ============================================================
// WIDGET RECEIVER - The entry point
// This class extends GlanceAppWidgetReceiver, not AppWidgetProvider!
// ============================================================
class ClipVaultWidgetReceiver : GlanceAppWidgetReceiver() {
    
    // ============================================================
    // This tells Android which GlanceAppWidget to use
    // Think of it like: "When updating, use ClipVaultWidget"
    // ============================================================
    override val glanceAppWidget: GlanceAppWidget = ClipVaultWidget()
}
```

### Step 2: Create the Widget Class

The widget class defines the UI and state.

```kotlin
// ============================================================
// WIDGET CLASS - Defines the UI
// GlanceAppWidget is to widgets what @Composable is to screens
// ============================================================
class ClipVaultWidget : GlanceAppWidget() {
    
    // ============================================================
    // provideGlance - The main function that builds the widget UI
    // Think of it like: "This is what the widget looks like"
    // This runs every time the widget needs to update
    // ============================================================
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            // This is where the UI is defined - just like Compose!
            ClipVaultWidgetContent()
        }
    }
}
```

### Step 3: Create the Widget Content

Now we define the actual UI using Composable functions!

```kotlin
// ============================================================
// WIDGET CONTENT - The actual UI
// This is like a @Composable function!
// You can use Column, Row, Text, Button, etc.
// ============================================================
@Composable
private fun ClipVaultWidgetContent() {
    // ============================================================
    // Column - Like Compose Column, arranges children vertically
    // GlanceModifier - Like Modifier in Compose, adds styling/behavior
    // ============================================================
    Column(
        modifier = GlanceModifier
            .fillMaxSize()                          // ← Fill the widget area
            .background(GlanceTheme.colors.surface)  // ← Background color
            .padding(16.dp)                         // ← Padding
    ) {
        // ============================================================
        // Text - Displays text in the widget
        // TextStyle - Like TextStyle in Compose
        // ============================================================
        Text(
            text = "ClipVault 📋",
            style = TextStyle(
                color = GlanceTheme.colors.onSurface,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        )
        
        Spacer(modifier = GlanceModifier.height(8.dp))
        
        // ============================================================
        // Text - Shows the latest clip
        // In a real app, this would come from Room database
        // ============================================================
        Text(
            text = "Tap to view clips",
            style = TextStyle(
                color = GlanceTheme.colors.onSurfaceVariant,
                fontSize = 14.sp
            )
        )
    }
}
```

---

## Adding Interactivity

Widgets aren't just for display — you can make them interactive!

### Click Action

```kotlin
// ============================================================
// BUTTON WITH CLICK ACTION
// ============================================================
Button(
    text = "Refresh",
    onClick = {
        // ============================================================
        // actionStartActivity - Opens an Activity when clicked
        // This is the most common interaction
        // ============================================================
        actionStartActivity<MainActivity>()
    },
    modifier = GlanceModifier.fillMaxWidth()
)
```

### Toggle/Checkbox

```kotlin
// ============================================================
// STATE - Using remember (like Compose!)
// This persists across widget updates
// ============================================================
var isEnabled by remember { mutableStateOf(false) }

Row(
    verticalAlignment = Alignment.CenterVertically,
    modifier = GlanceModifier
        .fillMaxWidth()
        .clickable { isEnabled = !isEnabled }  // ← Toggle on click
) {
    // ============================================================
    // CheckBox - Material 3 checkbox
    // ============================================================
    CheckBox(
        checked = isEnabled,
        onCheckedChange = null  // ← We handle it in the clickable modifier
    )
    
    Spacer(modifier = GlanceModifier.width(8.dp))
    
    Text(
        text = if (isEnabled) "Enabled" else "Disabled",
        style = TextStyle(color = GlanceTheme.colors.onSurface)
    )
}
```

---

## Widget Configuration (XML)

Widgets need configuration to define their size and behavior.

### Register the Receiver

```xml
<!-- AndroidManifest.xml -->
<receiver 
    android:name=".ClipVaultWidgetReceiver"
    android:exported="true">
    
    <!-- This tells Android to update the widget when needed -->
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    
    <!-- Point to the widget info XML -->
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/clipvault_widget_info" />
</receiver>
```

### Define Widget Info

```xml
<!-- res/xml/clipvault_widget_info.xml -->

<!-- ============================================================ -->
<!-- APPWIDGET-PROVIDER - Defines widget behavior -->
<!-- ============================================================ -->

<!-- Minimum size (in dp) -->
<!-- These are the minimum cells the widget will take -->
android:minWidth="180dp"
android:minHeight="110dp"

<!-- Target cells (Android 12+ way to specify size) -->
<!-- 3 cells wide, 2 cells tall -->
android:targetCellWidth="3"
android:targetCellHeight="2"

<!-- How often to update (in milliseconds) -->
<!-- 86400000 = 24 hours -->
<!-- WARNING: Updates use battery, don't overdo it! -->
android:updatePeriodMillis="86400000"

<!-- Initial layout (required but we override with Glance) -->
android:initialLayout="@layout/widget_initial_layout"

<!-- Allow resizing -->
android:resizeMode="horizontal|vertical"

<!-- Show on home screen (not lock screen) -->
android:widgetCategory="home_screen"

<!-- Description shown in widget picker -->
android:description="@string/widget_description"
```

---

## Updating the Widget

Widgets need to update when data changes. Here's how:

### Manual Update

```kotlin
// ============================================================
// UPDATE FROM ACTIVITY/FRAGMENT
// Call this when your data changes
// ============================================================

class MainActivity : ComponentActivity() {
    fun onClipAdded() {
        // This forces the widget to recompute its UI
        ClipVaultWidget().update(context)
    }
}
```

### Scheduled Updates

```kotlin
// ============================================================
// WORKMANAGER - For periodic updates
// ============================================================
val workRequest = PeriodicWorkRequestBuilder<WidgetUpdateWorker>(
    1, TimeUnit.HOURS
).build()

WorkManager.getInstance(context).enqueue(workRequest)
```

---

## Complete Example: ClipVault Widget

Here's a production-ready example:

```kotlin
// ============================================================
// COMPLETE WIDGET EXAMPLE
// ============================================================

class ClipVaultWidget : GlanceAppWidget() {
    
    // ============================================================
    // State - Holds the data to display
    // Unlike Compose, we use GlanceStateDefinition for persistence
    // ============================================================
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        // Get data from repository (simplified)
        val latestClip = getLatestClipFromDatabase()
        
        provideContent {
            // The UI
            Column(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .background(GlanceTheme.colors.surface)
                    .padding(16.dp)
            ) {
                // Header
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.Horizontal.CenterHorizontally
                ) {
                    Text(
                        text = "📋 ClipVault",
                        style = TextStyle(
                            color = GlanceTheme.colors.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    )
                }
                
                Spacer(modifier = GlanceModifier.height(12.dp))
                
                // Latest clip preview
                if (latestClip != null) {
                    Box(
                        modifier = GlanceModifier
                            .fillMaxWidth()
                            .background(GlanceTheme.colors.surfaceVariant)
                            .padding(12.dp)
                            .clickable { actionStartActivity<MainActivity>() }
                    ) {
                        Text(
                            text = latestClip.content.take(50) + "...",
                            style = TextStyle(
                                color = GlanceTheme.colors.onSurface,
                                fontSize = 14.sp
                            ),
                            maxLines = 2
                        )
                    }
                } else {
                    Text(
                        text = "No clips yet",
                        style = TextStyle(
                            color = GlanceTheme.colors.onSurfaceVariant,
                            fontSize = 14.sp
                        )
                    )
                }
                
                Spacer(modifier = GlanceModifier.defaultWeight())
                
                // Action button
                Button(
                    text = "View All",
                    onClick = { actionStartActivity<MainActivity>() },
                    modifier = GlanceModifier.fillMaxWidth()
                )
            }
        }
    }
    
    // Helper to get latest clip (simplified)
    private suspend fun getLatestClipFromDatabase(): Clip? {
        // In real app: inject repository and query database
        return null
    }
}
```

---

## Key Differences: RemoteViews vs Glance

### Why Glance is Better

| Feature | RemoteViews | Glance |
|---------|-------------|--------|
| **UI Framework** | XML only | Composable functions |
| **State Management** | Manual (SharedPreferences) | `remember` + State |
| **Theming** | Limited | Full Material 3 |
| **Testing** | Difficult | Unit testable |
| **Code Style** | Boilerplate | Declarative |
| **Previews** | Hard to visualize | Easy with Compose Preview |

---

## When to Use Glance

### ✅ Use Glance When:

- Building new widgets
- Want Material 3 styling
- Need interactive widgets
- Want to share code between app and widget
- Need easy state management

### ❌ Don't Use Glance When:

- Maintaining old RemoteViews widget (migration cost)
- Need very custom remote UI (sticky wallpaper)
- Widget is very simple (might be overkill)

---

## Quick Reference

### Common Modifiers

```kotlin
// Sizing
GlanceModifier.fillMaxSize()
GlanceModifier.fillMaxWidth()
GlanceModifier.height(100.dp)

// Styling
GlanceModifier.background(color)
GlanceModifier.padding(16.dp)
GlanceModifier.cornerRadius(12.dp)

// Interaction
GlanceModifier.clickable { /* action */ }
GlanceModifier.longClickable { /* action */ }
```

### Common Components

```kotlin
// Layout
Column { }
Row { }
Box { }
Spacer { }

// Text
Text("Hello", style = TextStyle(...))

// Inputs
Button("Click", onClick = { })
CheckBox(checked = state, onCheckedChange = { })
Switch(checked = state, onCheckedChange = { })
```

---

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Jetpack Glance is the modern standard for Android widgets. It brings the power of Compose to your home screen with declarative UI, easier state management, and better testability. The learning curve is minimal if you already know Compose — just remember that Glance uses its own modifiers and components, not the standard Compose ones!</p>
</div>
