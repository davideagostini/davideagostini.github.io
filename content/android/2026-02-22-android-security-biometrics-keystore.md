---
title: "Android Security: Biometric Authentication & Keystore Mastery"
date: "2026-02-22"
description: "Learn how to implement biometric auth and secure key storage in Android with practical code examples"
tags: ["Android", "Security", "Biometrics", "Keystore", "Kotlin"]
---

# Android Security: Biometric Authentication & Keystore Mastery

Securing your app goes beyond simple password protection. In this guide, we'll explore how to implement biometric authentication and use Android's Keystore for secure key management.

## Why Biometrics Matter

Biometric authentication provides:
- **Convenience**: No passwords to remember
- **Security**: Hard to forge fingerprints/faces
- **UX**: Fast authentication flow

## Setting Up Biometric Authentication

First, add the dependency:

```kotlin
// build.gradle.kts
dependencies {
    implementation("androidx.biometric:biometric:1.1.0")
}
```

### ❌ BAD: No BiometricPrompt, Direct Hardware Access

```kotlin
// DON'T do this - insecure and deprecated
class InsecureLoginActivity : Activity() {
    fun authenticate() {
        // This approach is outdated and unsafe
        val fingerprintManager = getSystemService(FingerprintManager::class.java)
        // Direct hardware access without proper validation
        fingerprintManager.authenticate(null, null, 0, null, null)
    }
}
```

### ✅ GOOD: Using BiometricPrompt Properly

```kotlin
// Recommended approach with BiometricPrompt
class SecureLoginActivity : AppCompatActivity() {

    private lateinit var executor: Executor
    private lateinit var biometricPrompt: BiometricPrompt

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        executor = ContextCompat.getMainExecutor(this)

        // Create BiometricPrompt with callback handling
        biometricPrompt = BiometricPrompt(this, executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    // Handle errors gracefully
                    showMessage("Authentication error: $errString")
                }

                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    // Success! Grant access
                    navigateToHome()
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    // Don't reveal whether biometric was valid or not
                    showMessage("Authentication failed")
                }
            })
    }

    fun showBiometricPrompt() {
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Authenticate")
            .setSubtitle("Use your biometric credential")
            .setNegativeButtonText("Use password")
            .setAllowedAuthenticators(Authenticators.BIOMETRIC_STRONG)
            .build()

        biometricPrompt.authenticate(promptInfo)
    }
}
```

## Using Keystore for Secure Key Storage

The Android Keystore system allows you to store cryptographic keys in a hardware-backed secure container.

### ❌ BAD: Storing Secrets in SharedPreferences

```kotlin
// DON'T store sensitive data like this
class InsecureStorage {
    val prefs = context.getSharedPreferences("secure_data", Context.MODE_PRIVATE)

    fun saveApiKey(apiKey: String) {
        // Plain text storage - extremely dangerous!
        prefs.edit().putString("api_key", apiKey).apply()
    }

    fun getApiKey(): String? {
        // Anyone with root can read this
        return prefs.getString("api_key", null)
    }
}
```

### ✅ GOOD: Using EncryptedSharedPreferences with Keystore

```kotlin
// Recommended: Encrypted storage backed by Keystore
class SecureStorage(private val context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveApiKey(apiKey: String) {
        // Encrypted automatically using Keystore-backed key
        prefs.edit().putString("api_key", apiKey).apply()
    }

    fun getApiKey(): String? {
        return prefs.getString("api_key", null)
    }

    // Generate a cryptographic key in Keystore
    fun generateKey(alias: String): SecretKey {
        val keyGenerator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            "AndroidKeyStore"
        )

        val keyGenSpec = KeyGenParameterSpec.Builder(
            alias,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .setUserAuthenticationRequired(true) // Require biometric auth!
            .build()

        keyGenerator.init(keyGenSpec)
        return keyGenerator.generateKey()
    }
}
```

### Using the Keystore Key for Encryption

```kotlin
class EncryptionManager(private val context: Context) {

    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply {
        load(null)
    }

    fun encryptData(alias: String, plaintext: ByteArray): ByteArray {
        val key = keyStore.getKey(alias, null) as SecretKey
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key)

        val iv = cipher.iv
        val ciphertext = cipher.doFinal(plaintext)

        // Combine IV and ciphertext
        return iv + ciphertext
    }

    fun decryptData(alias: String, encrypted: ByteArray): ByteArray {
        val key = keyStore.getKey(alias, null) as SecretKey

        // Extract IV from beginning of data
        val iv = encrypted.sliceArray(0 until 12)
        val ciphertext = encrypted.sliceArray(12 until encrypted.size)

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val spec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.DECRYPT_MODE, key, spec)

        return cipher.doFinal(ciphertext)
    }
}
```

## Best Practices Summary

| Practice | Recommendation |
|----------|----------------|
| Biometric UI | Use `BiometricPrompt`, not deprecated APIs |
| Fallback | Always provide password fallback |
| Error handling | Don't reveal sensitive info in error messages |
| Key storage | Use EncryptedSharedPreferences |
| Cryptographic keys | Store in hardware-backed Keystore when possible |
| Authentication | Require biometric auth for key usage |

<div class="key-takeaway">

**Key Takeaway**: Combine biometric authentication with Keystore-backed encryption for maximum security. Use `EncryptedSharedPreferences` for sensitive data and always require user authentication for key operations. Never store secrets in plain text!

</div>
