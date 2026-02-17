---
title: "Hilt Dependency Injection Deep Dive: From Basics to Custom Scopes"
date: "2026-02-18"
description: "Master Hilt in Android: custom scopes, navigation scopes, qualifiers, component dependencies, and real-world patterns for clean architecture."
tags: ["Android", "Hilt", "Dependency Injection", "Kotlin", "Clean Architecture"]
---

Dependency Injection (DI) sounds complicated, but it's really just **giving your classes what they need to work**. Instead of creating their own tools, classes just ask for them.

**Hilt** is Google's official way to do DI in Android—and it's powerful enough for simple apps but scales to complex ones.

## The Problem: Managing Dependencies

Imagine this without DI:

```kotlin
class UserRepository {
    // ❌ Creating dependencies manually = trouble
    private val database = Room.databaseBuilder(...).build()
    private val api = Retrofit.Builder().build()
    private val prefs = SharedPreferences(...)
    
    fun getUser() { ... }
}

class UserViewModel {
    // ❌ Hard to test, impossible to swap implementations
    private val repository = UserRepository()
}
```

**Problems:**
- Every class creates its own dependencies
- Hard to test (can't mock)
- Hard to change implementations
- Everything is tightly coupled

## The Solution: Dependency Injection

With DI, you **declare** what a class needs, and the system **provides** it:

```kotlin
class UserRepository @Inject constructor(
    private val database: AppDatabase,
    private val api: UserApi,
    private val prefs: SharedPreferences
) { ... }

class UserViewModel @Inject constructor(
    private val repository: UserRepository
) : ViewModel() { ... }
```

Now:
- Dependencies are provided automatically
- Easy to test with fake implementations
- Easy to change implementations
- Clean separation of concerns

---

## Hilt Basics

### 1. Add Dependencies

```kotlin
// build.gradle.kts
plugins {
    id("com.google.dagger.hilt.android")
    id("com.google.devtools.ksp")
}

dependencies {
    implementation("com.google.dagger:hilt-android:2.50")
    ksp("com.google.dagger:hilt-compiler:2.50")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
}
```

### 2. Application Class

```kotlin
@HiltAndroidApp
class ClipVaultApplication : Application()
```

**What this does:** Tells Hilt to start managing dependencies in this app.

### 3. Inject into Activity/Fragment

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    // Hilt provides this automatically!
    @Inject lateinit var userRepository: UserRepository
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Use userRepository here
    }
}
```

---

## Module: Providing Dependencies

Sometimes you can't just `@Inject` a class—like for Android system services or third-party libraries. That's where **Modules** come in.

### Creating a Module

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context
    ): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "clipvault_db"
        ).build()
    }
    
    @Provides
    @Singleton
    fun provideSharedPreferences(
        @ApplicationContext context: Context
    ): SharedPreferences {
        return context.getSharedPreferences("prefs", Context.MODE_PRIVATE)
    }
}
```

**What this does:** Tells Hilt how to create these objects.

---

## Scopes: Controlling Lifetime

### Default Scopes (For Beginners)

**What scope should I use?**

**🌍 App-wide (entire app):**
- `@Singleton` → Database, API, Repository
- One instance for the whole app

**📱 Activity:**
- `@ActivityRetainedScoped` → ViewModels
- Survives configuration changes within an Activity

**🧩 Fragment:**
- `@FragmentScoped` → Dependencies needed in one screen
- One instance per Fragment

**⚡ ViewModel:**
- `@ViewModelScoped` → Short-lived data
- Survives only during ViewModel lifetime

**🚪 Entry Point:**
- `@EntryPointScoped` → Specific use cases
- For non-Android classes like Workers

### Using Scopes

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton  // Only one instance for entire app
    fun provideDatabase(...): AppDatabase { ... }
}

@ActivityScoped  // One per Activity
class ActivityManager @Inject constructor(
    private val prefs: SharedPreferences
) { ... }
```

---

## Custom Scopes (For Advanced Use)

Sometimes you need your own scope—like for user sessions:

### Define Custom Scope

```kotlin
@Scope
@Retention(AnnotationRetention.RUNTIME)
annotation class UserScope
```

### Create Custom Component

```kotlin
@Component(
    modules = [UserModule::class],
    scope = UserScope::class
)
interface UserComponent {
    fun inject(activity: UserActivity)
}
```

### Use It

```kotlin
@UserScope
class UserSessionManager @Inject constructor(
    private val prefs: SharedPreferences
) {
    var currentUser: User? = null
    
    fun login(credentials: Credentials): User {
        // Login logic
        return user
    }
    
    fun logout() {
        currentUser = null
    }
}
```

---

## Qualifiers: Multiple Implementations

What if you need **two** of the same type? Use qualifiers:

### Example: Local vs Remote Data Source

```kotlin
// Define qualifiers
@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class LocalDataSource

@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class RemoteDataSource

// In module, provide both
@Module
@InstallIn(SingletonComponent::class)
object DataModule {
    
    @Provides
    @Singleton
    @LocalDataSource
    fun provideLocalDataSource(database: AppDatabase): ClipDataSource {
        return LocalClipDataSource(database.clipDao())
    }
    
    @Provides
    @Singleton
    @RemoteDataSource
    fun provideRemoteDataSource(api: ClipApi): ClipDataSource {
        return RemoteClipDataSource(api)
    }
}
```

### Use Qualifiers

```kotlin
class ClipRepository @Inject constructor(
    @LocalDataSource private val local: ClipDataSource,
    @RemoteDataSource private val remote: ClipDataSource
) {
    suspend fun sync() {
        remote.fetchAll().forEach { local.save(it) }
    }
}
```

---

## Navigation Scope (Compose Navigation)

Hilt works great with Navigation Compose:

### Setup

```kotlin
// build.gradle.kts
implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
```

### Use with Navigation

```kotlin
@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String = "home"
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable("home") {
            // ViewModel is scoped to navigation graph
            val viewModel: HomeViewModel = hiltViewModel()
            HomeScreen(viewModel = viewModel)
        }
        
        composable("detail/{id}") { backStackEntry ->
            val detailId = backStackEntry.arguments?.getString("id")
            val viewModel: DetailViewModel = hiltViewModel(detailId)
            DetailScreen(viewModel = viewModel)
        }
    }
}
```

---

## Component Dependencies

When you need a scope that's larger than Activity but smaller than Singleton:

```kotlin
@Component(
    modules = [AppModule::class],
    dependencies = [NavigationComponent::class]
)
interface AppComponent {
    fun inject(activity: MainActivity)
}

@Component
@FragmentScope
interface NavigationComponent {
    fun navController(): NavController
}
```

---

## Entry Points: Access Outside Android

Need Hilt in non-Android classes (like workers)?

### For WorkManager

```kotlin
@EntryPoint
@InstallIn(ApplicationComponent::class)
interface WorkerEntryPoint {
    fun clipRepository(): ClipRepository
}

class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        val entryPoint = EntryPointAccessors.fromApplication(
            applicationContext,
            WorkerEntryPoint::class.java
        )
        val repository = entryPoint.clipRepository()
        
        // Use repository
        return Result.success()
    }
}
```

---

## Hilt with ViewModel

### ViewModel Injection

```kotlin
@HiltViewModel
class ClipListViewModel @Inject constructor(
    private val getClips: GetAllClipsUseCase,
    private val searchClips: SearchClipsUseCase,
    private val deleteClip: DeleteClipUseCase
) : ViewModel() {
    // ViewModel automatically survives config changes
    // and is scoped to the Activity/Fragment
}
```

### Using in Compose

```kotlin
@Composable
fun ClipListScreen(
    viewModel: ClipListViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    // Render UI
}
```

---

## When to Use Hilt (And When NOT To)

### ✅ Use Hilt When:

- **Medium to large apps** - Clean Architecture benefits
- **Multiple modules** - Complex dependency graphs
- **Testing** - Need to mock dependencies
- **Team projects** - Standard DI pattern

### ❌ Don't Use Hilt When:

- **Very small apps** - Koin is simpler
- **Learning DI** - Understand basics first
- **Simple utilities** - Manual DI might be enough

---

## Quick Decision Guide

**🎯 Which scope to use?**

- **App-wide data** (database, API) → `@Singleton`
- **Screen-specific** → `@ViewModelScoped` or no scope
- **Activity-specific** → `@ActivityRetainedScoped`
- **User session** → Custom `@UserScope`

**🔧 Which annotation?**

- **Class creates objects** → `@Module`
- **Function provides object** → `@Provides`
- **Class needs injection** → `@Inject constructor`
- **Android class needs Hilt** → `@AndroidEntryPoint`
- **App needs Hilt** → `@HiltAndroidApp`

---

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Start with @Singleton for app-wide dependencies and @Inject constructor for your classes. Only add custom scopes or qualifiers when you have a real need (like user sessions). Hilt's defaults work for 90% of apps—don't overengineer!</p>
</div>
