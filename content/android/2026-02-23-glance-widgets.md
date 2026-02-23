---
title: "Glance Widgets: Building Your First Android App Widget with Jetpack Compose"
date: "2026-02-23"
description: "Learn how to create modern Android widgets using Jetpack Glance — the declarative way to build app widgets with Compose."
tags: ["Android", "Jetpack Glance", "Widgets", "Jetpack Compose", "Tutorial"]
---

# Glance Widgets: Building Your First Android App Widget with Jetpack Compose

App widgets are a powerful way to keep your app's information visible on the home screen. With **Jetpack Glance**, you can build modern widgets using the same declarative syntax as Jetpack Compose.

## What is Jetpack Glance?

Glance is Google's recommended way to create app widgets. Unlike traditional widget development (RemoteViews), Glance lets you use **Composable functions** to define widget UI.

## Setting Up Glance

Add the dependency in your `build.gradle`:

```kotlin
// build.gradle (app)
dependencies {
    implementation("androidx.glance:glance-appwidget:1.1.1")
    implementation("androidx.glance:glance-material3:1.1.1")
}
```

## Creating Your First Widget

### ❌ BAD: Traditional RemoteViews Approach

```kotlin
// Old way - verbose and error-prone
class OldWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_layout)
            views.setTextViewText(R.id.title, "Hello")
            views.setOnClickPendingIntent(R.id.button, pendingIntent)
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
```

### ✅ GOOD: Modern Glance Approach

```kotlin
// New way - declarative and Compose-like
class MyWidget : GlanceAppWidget() {
    
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            MyWidgetContent()
        }
    }
}

@Composable
private fun MyWidgetContent() {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(ColorProvider(Color.DarkGray))
            .padding(16.dp)
    ) {
        Text(
            text = "Hello, Glance! 👋",
            style = TextStyle(
                color = ColorProvider(Color.White),
                fontSize = 16.sp
            )
        )
        
        Button(
            text = "Tap Me",
            onClick = { /* Handle click */ },
            modifier = GlanceModifier.padding(top = 8.dp)
        )
    }
}
```

## Widget Configuration

Register your widget in `AndroidManifest.xml`:

```kotlin
<receiver
    android:name=".MyWidgetReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_info" />
</receiver>
```

Create `res/xml/widget_info.xml`:

```xml
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="180dp"
    android:minHeight="110dp"
    android:targetCellWidth="3"
    android:targetCellHeight="2"
    android:updatePeriodMillis="86400000"
    android:initialLayout="@layout/widget_initial_layout"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen" />
```

## Adding Interactivity

Glance supports clicks, checks, and switches:

```kotlin
// Checkbox example
var checked by remember { mutableStateOf(false) }

Row(
    verticalAlignment = Alignment.CenterVertically,
    modifier = GlanceModifier.clickable { checked = !checked }
) {
    CheckBox(checked = checked, onCheckedChange = null)
    Text("Enable notifications", modifier = GlanceModifier.padding(start = 8.dp))
}
```

## Key Differences: RemoteViews vs Glance

| Feature | RemoteViews | Glance |
|---------|-------------|--------|
| UI Framework | XML only | Composable functions |
| State Management | Manual | `remember` + State |
| Theming | Limited | Full Material 3 support |
| Testing | Difficult | Unit testable |

---

<div class="key-takeaway">

**Key Takeaway:** Jetpack Glance is the modern standard for Android widgets. It brings the power of Compose to your home screen with declarative UI, easier state management, and better testability. Start using Glance for your next widget project!

</div>
