---
title: "Android App Functions in Practice: Expose App Capabilities to AI Agents"
date: "2026-05-27"
description: "A practical guide to Android App Functions: dependencies, metadata, implementation, KDoc, AI-assisted workflows, and ADB testing."
tags: ["android", "ai", "appfunctions", "gemini", "kotlin", "ksp", "adb"]
---

App Functions let an Android app expose specific capabilities to system services and AI agents.

Think of them as typed, on-device tools.

The UI is still important, but it is no longer the only entry point into the app. A user can ask an assistant to perform an action, and the assistant can discover and invoke a function exposed by the app.

The important part for Android developers is this:

**An App Function is not a screen. It is a stable capability contract.**

This guide is intentionally direct. We will cover what to expose, how to wire the API, how to write agent-readable KDoc, how Android Skills help with the workflow, and how to test the result with ADB.

---

## 1. Pick the right capability

Do not expose everything.

Good App Functions are usually one of these:

- **mutations**: create a note, send a message, add an expense, start playback
- **rich queries**: search contacts, find a note, list recent entities
- **workflow helpers**: resolve a name to an internal ID before another function runs

Bad App Functions are usually:

- pure UI navigation
- actions that duplicate existing system behavior
- broad data dumps
- destructive operations without confirmation
- access to raw credentials, financial secrets, or highly sensitive data

A good rule:

**Expose outcomes, not screens.**

For example, "createTask" is a good App Function. "openTaskScreen" is usually not.

---

## 2. Add the dependencies

The official documentation requires `compileSdk` 36 or higher. The official sample currently uses `compileSdk = 37` and `targetSdk = 37`.

App Functions also require KSP because metadata is generated at build time.

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.ksp)
}

android {
    compileSdk = 37

    defaultConfig {
        targetSdk = 37
    }
}

ksp {
    arg("appfunctions:aggregateAppFunctions", "true")
}

dependencies {
    implementation("androidx.appfunctions:appfunctions:1.0.0-alpha09")
    implementation("androidx.appfunctions:appfunctions-service:1.0.0-alpha09")
    ksp("androidx.appfunctions:appfunctions-compiler:1.0.0-alpha09")
}
```

Use the latest version available in Google's Maven repository when you integrate this in a real project.

---

## 3. Describe the app capability surface

App-level metadata helps the system understand the role of your functions and the relationships between them.

Create `res/xml/app_metadata.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<AppFunctionAppMetadata xmlns:appfn="http://schemas.android.com/apk/res-auto"
    appfn:description="Provides tools for managing personal tasks.
Operational Patterns:
  - Use 'searchTasks' before 'updateTask' when the task ID is unknown.
  - Use 'createTask' when the user wants to remember, schedule, or log a future action.
Constraints:
  - Task titles cannot be empty.
  - Destructive actions require explicit confirmation."
    appfn:displayDescription="@string/app_function_app_display_description" />
```

Then reference it from `AndroidManifest.xml` inside the `<application>` tag:

```xml
<property
    android:name="android.app.appfunctions.app_metadata"
    android:resource="@xml/app_metadata" />
```

Keep this description short and operational.

Do not write marketing copy. Write instructions that help an agent choose the correct function.

---

## 4. Implement an App Function

An App Function implementation should be boring in the best possible way:

- typed input
- typed output
- clear KDoc
- explicit errors
- no UI-thread blocking work
- no hidden dependency on a screen being open

Here is a descriptive example for creating a task.

```kotlin
package com.example.tasks.appfunctions

import androidx.appfunctions.AppFunctionContext
import androidx.appfunctions.AppFunctionElementNotFoundException
import androidx.appfunctions.AppFunctionInvalidArgumentException
import androidx.appfunctions.AppFunctionSerializable
import androidx.appfunctions.service.AppFunction
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Provides task management capabilities to system agents.
 */
@Singleton
class TaskFunctions @Inject constructor(
    private val taskRepository: TaskRepository
) {
    /** Parameters required to create a task. */
    @AppFunctionSerializable(isDescribedByKDoc = true)
    data class CreateTaskParams(
        /** The short actionable title of the task. */
        val title: String,
        /** Optional extra details for the task. */
        val content: String? = null
    )

    /** A task created in the app. */
    @AppFunctionSerializable(isDescribedByKDoc = true)
    data class TaskResult(
        /** The generated task identifier. */
        val id: String,
        /** The visible task title. */
        val title: String,
        /** Whether the task is currently open. */
        val isOpen: Boolean
    )

    /**
     * Create a task in the user's task list.
     *
     * Use this when the user wants to remember, schedule, or log a future action.
     *
     * @param appFunctionContext The execution context for this App Function call.
     * @param params The task fields provided by the agent.
     * @return The created task.
     * @throws AppFunctionInvalidArgumentException If the task title is blank.
     * @throws AppFunctionElementNotFoundException If the created task cannot be loaded.
     */
    @AppFunction(isDescribedByKDoc = true)
    suspend fun createTask(
        appFunctionContext: AppFunctionContext,
        params: CreateTaskParams
    ): TaskResult = withContext(Dispatchers.IO) {
        if (params.title.isBlank()) {
            throw AppFunctionInvalidArgumentException("Task title cannot be blank.")
        }

        val taskId = taskRepository.createTask(
            title = params.title,
            content = params.content
        )

        val task = taskRepository.getTask(taskId)
            ?: throw AppFunctionElementNotFoundException("Task not found for ID = $taskId")

        TaskResult(
            id = task.id,
            title = task.title,
            isOpen = !task.isCompleted
        )
    }
}
```

The shape matters more than the example domain.

The first parameter is `AppFunctionContext`.
The function is `suspend`.
Blocking work moves to `Dispatchers.IO`.
Failures use App Function exceptions so the caller gets a meaningful error.

---

## 5. KDoc is part of the interface

When `isDescribedByKDoc = true`, KDoc becomes metadata. The agent uses it to understand what the function does, when it should be used, and how parameters should be filled.

Write KDoc like a contract.

Bad:

```kotlin
/** Creates something. */
```

Better:

```kotlin
/**
 * Create a task in the user's task list.
 *
 * Use this when the user wants to remember, schedule, or log a future action.
 *
 * @param params The task fields provided by the agent.
 * @return The created task.
 */
```

For serializable data classes, document properties inline:

```kotlin
@AppFunctionSerializable(isDescribedByKDoc = true)
data class ContactSearchResult(
    /** The stable internal identifier used by follow-up functions. */
    val endpointValue: String,
    /** The display name shown to the user for confirmation. */
    val displayName: String
)
```

Do not rely on class-level `@param` tags for serializable properties. KSP extracts inline property KDoc.

---

## 6. Wire dependencies with Hilt when needed

If the class containing `@AppFunction` methods has constructor dependencies, the system needs a way to create it.

With Hilt, implement `AppFunctionConfiguration.Provider` in your `Application` class:

```kotlin
@HiltAndroidApp
class TasksApplication : Application(), AppFunctionConfiguration.Provider {
    @Inject lateinit var taskFunctions: TaskFunctions

    override val appFunctionConfiguration: AppFunctionConfiguration
        get() = AppFunctionConfiguration.Builder()
            .addEnclosingClassFactory(TaskFunctions::class.java) { taskFunctions }
            .build()
}
```

`@Inject constructor` is not enough by itself for the AppFunctions runtime.

KSP generates the App Function metadata and invocation plumbing, but the runtime still needs the actual enclosing class instance. `addEnclosingClassFactory(TaskFunctions::class.java) { taskFunctions }` is the bridge between that generated AppFunctions code and the object created by Hilt.

Make sure `TaskFunctions` can be resolved by Hilt at application startup:

- use constructor injection when all constructor dependencies are also in the graph
- add `@Singleton` when you want one stable app-level instance
- use a Hilt `@Module` with `@Provides` when construction needs custom setup

Without this, your function class may compile, but the system will not know how to instantiate it with your repository, use case, or service dependencies.

---

## 7. Gate risky or unavailable functions

Some functions should not always be available.

Examples:

- user is logged out
- premium feature is disabled
- account is not verified
- user has not accepted required permissions
- action is sensitive and needs confirmation

You can mark a function disabled by default:

```kotlin
@AppFunction(isEnabled = false, isDescribedByKDoc = true)
suspend fun exportPrivateData(
    appFunctionContext: AppFunctionContext
): PendingIntent {
    // Return a confirmation flow instead of exporting immediately.
}
```

Then enable it at runtime when the app state allows it, using the generated function IDs and `AppFunctionManagerCompat`.

The important principle:

**The agent can request an action. The app owns the safety boundary.**

For destructive, private, or financial actions, prefer a confirmation `PendingIntent` or a user-visible flow over immediate execution.

---

## 8. Test with ADB

Once the app is installed on a supported device or emulator, start with:

```bash
adb shell cmd app_function help
```

List registered functions:

```bash
adb shell cmd app_function list-app-functions
```

Filter by package:

```bash
adb shell cmd app_function list-app-functions | grep --after-context 10 com.example.tasks
```

Execute a function with JSON parameters:

```bash
adb shell cmd app_function execute-app-function \
  --package com.example.tasks \
  --function 'com.example.tasks.appfunctions.TaskFunctions#createTask' \
  --parameters '{"params":{"title":"Call Marco","content":"Ask about dinner"}}'
```

Always inspect the registered function metadata before invoking it. The description may contain required workflows, constraints, or disambiguation rules.

---

## 9. Use AI-assisted workflows to build App Functions faster

If you use Gemini in Android Studio, or another context-aware coding assistant, treat App Functions as a workflow instead of a single code-generation prompt.

Google also publishes an AppFunctions workflow in the `android/skills` repository:

`device-ai/appfunctions`

I would not treat this as a runtime dependency or stable platform API. It is better understood as a guided prompt-and-checklist workflow that helps you move through discovery, implementation, KDoc refinement, and ADB testing.

### Step 1: Discovery

Analyze the app and identify high-value functions.

Prioritize:

- frequent actions
- multi-step flows
- actions users can express naturally
- workflows that do not need full UI navigation

Avoid:

- pure navigation
- broad data access
- raw secrets
- destructive actions without confirmation

Example prompt:

```text
Analyze this Android app and recommend App Functions.
Focus on user outcomes that are useful for AI agents, voice commands,
shortcuts, or multi-step automation.
```

### Step 2: Implementation and configuration

Generate the Gradle setup, `app_metadata.xml`, manifest property, function class, serializable models, and optional Hilt factory.

Example prompt:

```text
Implement App Functions for the recommended workflows.
Use androidx.appfunctions, KSP, AppFunctionContext, AppFunctionSerializable,
and suspend functions. Keep sensitive actions gated behind confirmation.
```

### Step 3: KDoc refinement

Refine KDoc so the metadata is useful to agents.

This workflow specifically focuses on:

- clear function outcomes
- required workflows
- parameter constraints
- inline KDoc for serializable properties
- actionable error descriptions

Example prompt:

```text
Refine the App Function KDoc for agent usage.
Make each function description concise, specific, and useful for semantic routing.
Document required workflows and parameter constraints.
```

### Step 4: ADB testing and debugging

Use ADB to verify registration and execution.

Example prompt:

```text
Use adb shell cmd app_function to list registered functions for this package.
Then invoke the createTask function with valid JSON parameters and inspect the result.
```

The key idea:

**Do not use AI tooling only to generate code. Use it to discover, implement, document, and test the capability contract end to end.**

---

## Final checklist

Before shipping an App Function, check this:

- The function represents a real user outcome.
- The first parameter is `AppFunctionContext`.
- The function is `suspend`.
- Blocking work runs off the UI thread.
- Inputs and outputs are type-safe.
- Custom data classes use `@AppFunctionSerializable`.
- Serializable properties have inline KDoc.
- Function KDoc explains when and how the function should be used.
- App metadata explains cross-function workflows and constraints.
- Sensitive or destructive actions require confirmation.
- ADB can list and execute the function.

App Functions are not just another integration point.

They are the beginning of a new interface layer for Android apps: one where agents do not tap through screens, but call safe, documented, deterministic capabilities.

## References

- [Overview of AppFunctions](https://developer.android.com/ai/appfunctions)
- [Add the AppFunctions API to your app](https://developer.android.com/ai/appfunctions/add-appfunctions)
- [android/appfunctions sample repository](https://github.com/android/appfunctions)
- [android/skills: device-ai/appfunctions workflow](https://github.com/android/skills/tree/main/device-ai/appfunctions)
