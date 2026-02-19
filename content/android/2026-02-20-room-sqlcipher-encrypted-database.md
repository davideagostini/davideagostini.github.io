---
title: "Room + SQLCipher Deep Dive: Encrypted Database for Android"
date: "2026-02-20"
description: "Master Room database with SQLCipher encryption: entities, DAOs, migrations, encrypted storage, and production patterns for secure Android apps."
tags: ["Android", "Room", "SQLCipher", "Database", "Security", "Kotlin"]
---

Your app stores user data locally—but is it encrypted? On a rooted device, anyone can read your database files. That's a security nightmare.

**SQLCipher** encrypts your entire database. Combined with **Room**, you get type-safe queries AND military-grade encryption.

## The Problem: Unencrypted Data

Without encryption, your database is an open book:

```kotlin
// ❌ PROBLEM: Anyone with file access can read this!
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: Long,
    val email: String,         // Exposed!
    val passwordHash: String,  // Exposed!
    val creditCard: String     // Exposed!!
)
```

**Anyone can:**
- Read sensitive user data
- Modify records
- Extract passwords
- Steal credit cards

## The Solution: Room + SQLCipher

SQLCipher encrypts the entire database file. Without the key, it's just random bytes:

```kotlin
// ✅ SOLUTION: Encrypted database!
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: Long,
    val email: String,         // Now encrypted!
    val passwordHash: String,  // Now encrypted!
    val creditCard: String     // Now encrypted!!
)
```

---

## Setup: Adding SQLCipher to Room

### 1. Add Dependencies

```kotlin
// build.gradle.kts
dependencies {
    // Room core
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")
    
    // SQLCipher for encryption
    implementation("net.zetetic:android-database-sqlcipher:4.5.4")
    implementation("androidx.sqlite:sqlite-ktx:2.4.0")
}
```

### 2. Create Encrypted Database

```kotlin
@Database(
    entities = [UserEntity::class, ClipEntity::class],
    version = 1,
    exportSchema = true  // IMPORTANT: For migrations!
)
abstract class ClipVaultDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun clipDao(): ClipDao
    
    companion object {
        const val DATABASE_NAME = "clipvault_db"
    }
}
```

### 3. Provide Encrypted Database (with Hilt)

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    // ============================================================
    // THE KEY: This passphrase encrypts/decrypts the database
    // IMPORTANT: Store securely! (Android Keystore, not hardcoded!)
    // ============================================================
    @Provides
    @Singleton
    fun provideDatabasePassphrase(): ByteArray {
        // TODO: In production, load from Android Keystore!
        // For now, a static key (NOT secure!)
        return "MySecretPassphrase123".toByteArray()
    }
    
    @Provides
    @Singleton
    fun provideDatabase(
        @ApplicationContext context: Context,
        passphrase: ByteArray
    ): ClipVaultDatabase {
        // ============================================================
        // Step 1: Create SQLCipher factory with passphrase
        // ============================================================
        val factory = SupportFactory(passphrase)
        
        // ============================================================
        // Step 2: Build Room database with encryption factory
        // ============================================================
        return Room.databaseBuilder(
            context,
            ClipVaultDatabase::class.java,
            ClipVaultDatabase.DATABASE_NAME
        )
            .openHelperFactory(factory)  // ← Enable encryption!
            .fallbackToDestructiveMigration()
            .build()
    }
}
```

---

## Secure Key Storage: Android Keystore

**Never hardcode your encryption key!** Use Android Keystore:

```kotlin
// ============================================================
// SECURE: Store encryption key in Android Keystore
// ============================================================

object SecureKeyManager {
    
    private const val KEYSTORE_PROVIDER = "AndroidKeyStore"
    private const val KEY_ALIAS = "clipvault_db_key"
    
    fun getOrCreateKey(context: Context): ByteArray {
        val keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER).apply {
            load(null)
        }
        
        return if (keyStore.containsAlias(KEY_ALIAS)) {
            // Key exists, load it
            (keyStore.getKey(KEY_ALIAS, null) as SecretKey).encoded
                ?: generateNewKey()  // Fallback
        } else {
            // Generate new key
            generateNewKey()
        }
    }
    
    private fun generateNewKey(): ByteArray {
        val keyGenerator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            KEYSTORE_PROVIDER
        )
        
        // Generate 256-bit key
        val keyGenSpec = KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .build()
        
        keyGenerator.init(keyGenSpec)
        val key = keyGenerator.generateKey()
        
        return key.encoded ?: ByteArray(0)
    }
}
```

---

## Room Basics: Entities, DAOs, Queries

### Entity: Define Your Table

```kotlin
// ============================================================
// ENTITY = "What a row looks like"
// ============================================================
@Entity(tableName = "clips")
data class ClipEntity(
    // @PrimaryKey = this column is unique
    @PrimaryKey(autoGenerate = true)  // ← Auto-increment ID
    val id: Long = 0,
    
    // @ColumnInfo = customize column name
    @ColumnInfo(name = "content")
    val content: String,
    
    // Default values
    val type: String = "TEXT",
    val category: String = "Personal",
    val isPinned: Boolean = false,
    val isFavorite: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
```

### DAO: Define Your Queries

```kotlin
// ============================================================
// DAO = "What operations you can do on the table"
// ============================================================
@Dao
interface ClipDao {
    
    // ============================================================
    // Query = Read operations
    // ============================================================
    
    // Get all clips, ordered by pinned first, then by date
    @Query("SELECT * FROM clips ORDER BY isPinned DESC, createdAt DESC")
    fun getAllClips(): Flow<List<ClipEntity>>
    
    // Get clips filtered by category
    @Query("SELECT * FROM clips WHERE category = :category ORDER BY createdAt DESC")
    fun getClipsByCategory(category: String): Flow<List<ClipEntity>>
    
    // Search clips by content
    @Query("SELECT * FROM clips WHERE content LIKE '%' || :query || '%'")
    fun searchClips(query: String): Flow<List<ClipEntity>>
    
    // Get single clip by ID
    @Query("SELECT * FROM clips WHERE id = :id")
    suspend fun getClipById(id: Long): ClipEntity?
    
    // ============================================================
    // Insert = Create operations
    // ============================================================
    
    // Insert one clip, return the new ID
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClip(clip: ClipEntity): Long
    
    // Insert multiple clips
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertClips(clips: List<ClipEntity>)
    
    // ============================================================
    // Update = Modify operations
    // ============================================================
    
    @Update
    suspend fun updateClip(clip: ClipEntity)
    
    // ============================================================
    // Delete = Remove operations
    // ============================================================
    
    @Delete
    suspend fun deleteClip(clip: ClipEntity)
    
    @Query("DELETE FROM clips WHERE id = :id")
    suspend fun deleteClipById(id: Long)
    
    @Query("DELETE FROM clips")
    suspend fun deleteAllClips()
    
    // ============================================================
    // Count = Aggregate operations
    // ============================================================
    
    @Query("SELECT COUNT(*) FROM clips")
    suspend fun getClipCount(): Int
}
```

### Using the DAO in Repository

```kotlin
// ============================================================
// REPOSITORY = "Bridge between data and domain"
// ============================================================
class ClipRepositoryImpl(
    private val clipDao: ClipDao  // ← Injected by Hilt
) : ClipRepository {
    
    // Get all clips as reactive Flow
    override fun getAllClips(): Flow<List<Clip>> {
        return clipDao.getAllClips().map { entities ->
            entities.map { it.toDomain() }  // Convert Entity → Domain
        }
    }
    
    // Insert new clip
    override suspend fun insertClip(clip: Clip): Long {
        return clipDao.insertClip(ClipEntity.fromDomain(clip))
    }
    
    // Search with Flow
    override fun searchClips(query: String): Flow<List<Clip>> {
        return clipDao.searchClips(query).map { entities ->
            entities.map { it.toDomain() }
        }
    }
}
```

---

## Migrations: Updating Your Database

When you change your entity, you need a migration:

```kotlin
// ============================================================
// MIGRATION = "How to move from version 1 to version 2"
// ============================================================

// In your Database class:
@Database(
    entities = [ClipEntity::class],
    version = 2,  // ← INCREMENT THIS!
    exportSchema = true
)
abstract class ClipVaultDatabase : RoomDatabase() {
    abstract fun clipDao(): ClipDao
    
    companion object {
        const val DATABASE_NAME = "clipvault_db"
        
        // ============================================================
        // Migration from version 1 to 2
        // ============================================================
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                // Add new column for encrypted flag
                database.execSQL(
                    "ALTER TABLE clips ADD COLUMN isEncrypted INTEGER NOT NULL DEFAULT 0"
                )
            }
        }
        
        // Migration from 2 to 3 (example)
        val MIGRATION_2_3 = object : Migration(2, 3) {
            override fun migrate(database: SupportSQLiteDatabase) {
                // Add category column with default
                database.execSQL(
                    "ALTER TABLE clips ADD COLUMN category TEXT NOT NULL DEFAULT 'Personal'"
                )
            }
        }
    }
}

// Building with migrations:
val database = Room.databaseBuilder(
    context,
    ClipVaultDatabase::class.java,
    ClipVaultDatabase.DATABASE_NAME
)
    .addMigrations(
        ClipVaultDatabase.MIGRATION_1_2,
        ClipVaultDatabase.MIGRATION_2_3
    )
    .build()
```

---

## Real-World Pattern: ClipVault Repository

Here's a production-ready implementation:

```kotlin
// ============================================================
// DOMAIN MODEL = "What the rest of the app sees"
// ============================================================
data class Clip(
    val id: Long = 0,
    val content: String,
    val type: ClipType = ClipType.TEXT,
    val category: String = "Personal",
    val isPinned: Boolean = false,
    val isFavorite: Boolean = false,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

enum class ClipType {
    TEXT, URL, EMAIL, IMAGE
}

// ============================================================
// REPOSITORY INTERFACE = "Contract"
// ============================================================
interface ClipRepository {
    fun getAllClips(): Flow<List<Clip>>
    fun searchClips(query: String): Flow<List<Clip>>
    suspend fun insertClip(clip: Clip): Long
    suspend fun deleteClip(clip: Clip)
    suspend fun togglePin(id: Long)
    suspend fun getClipCount(): Int
}

// ============================================================
// REPOSITORY IMPLEMENTATION = "The actual code"
// ============================================================
class ClipRepositoryImpl(
    private val clipDao: ClipDao
) : ClipRepository {
    
    override fun getAllClips(): Flow<List<Clip>> {
        return clipDao.getAllClips().map { entities ->
            entities.map { it.toDomain() }
        }
    }
    
    override fun searchClips(query: String): Flow<List<Clip>> {
        return clipDao.searchClips(query).map { entities ->
            entities.map { it.toDomain() }
        }
    }
    
    override suspend fun insertClip(clip: Clip): Long {
        return clipDao.insertClip(ClipEntity.fromDomain(clip))
    }
    
    override suspend fun deleteClip(clip: Clip) {
        clipDao.deleteClip(ClipEntity.fromDomain(clip))
    }
    
    override suspend fun togglePin(id: Long) {
        clipDao.togglePin(id)
    }
    
    override suspend fun getClipCount(): Int {
        return clipDao.getClipCount()
    }
}

// ============================================================
// EXTENSION FUNCTIONS = "Convert between layers"
// ============================================================
fun ClipEntity.toDomain(): Clip = Clip(
    id = id,
    content = content,
    type = ClipType.valueOf(type),
    category = category,
    isPinned = isPinned,
    isFavorite = isFavorite,
    createdAt = createdAt,
    updatedAt = updatedAt
)

fun Clip.toEntity(): ClipEntity = ClipEntity(
    id = id,
    content = content,
    type = type.name,
    category = category,
    isPinned = isPinned,
    isFavorite = isFavorite,
    createdAt = createdAt,
    updatedAt = updatedAt
)
```

---

## When to Use SQLCipher

### ✅ Use When:

- **Storing sensitive data** - Passwords, tokens, personal info
- **Compliance requirements** - GDPR, HIPAA, PCI-DSS
- **Banking/finance apps** - Extra security layer
- **Health apps** - Medical data protection
- **Enterprise apps** - Corporate data security

### ❌ Don't Overuse When:

- **Simple key-value data** - Use EncryptedSharedPreferences
- **No sensitive data** - Regular Room is fine
- **Performance critical** - Slight overhead (~5-10%)

---

## Quick Decision Guide

**🎯 Room Basics:**

- **@Entity** → Define a table
- **@Dao** → Define queries (SELECT, INSERT, UPDATE, DELETE)
- **@Database** → The database itself
- **@PrimaryKey** → Unique identifier
- **Flow** → Reactive updates

**🔐 SQLCipher:**

- **Add dependency** → `android-database-sqlcipher`
- **SupportFactory** → Enable encryption
- **Android Keystore** → Store key securely

**🔄 Migrations:**

- **Increment version** → `version = 2`
- **Create Migration** → `object : Migration(1, 2)`
- **Add migration** → `.addMigrations(...)`

---

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">Start with unencrypted Room for prototyping, then add SQLCipher when you handle sensitive data. Always store the encryption key in Android Keystore—never hardcode it! Migrations are critical: always increment version and export schema.</p>
</div>
