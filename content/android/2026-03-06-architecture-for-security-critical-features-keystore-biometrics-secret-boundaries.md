---
title: "Architecture for Security-Critical Features: Keystore, Biometrics, and Secret Boundaries"
date: "2026-03-06"
description: "A beginner-friendly architecture guide for security-critical Android features using Keystore, biometrics, and strict secret boundaries."
tags: ["android", "architecture", "security", "keystore", "biometrics", "gde"]
---

Security features fail less because of bad crypto and more because of bad architecture.

If encryption keys, biometric logic, and business rules are spread across random classes, one shortcut can expose sensitive data.

In this guide, we’ll build a clean mental model with clear boundaries:

- **Crypto and key operations** stay in a dedicated security module
- **Biometric prompts** stay in UI/integration layer
- **Domain layer** asks for capabilities, never raw secrets

---

## 1) Security boundaries you should enforce

For security-critical features, treat secrets like hazardous material:

1. **Minimize access** (few classes can touch secrets)
2. **Never pass raw keys around**
3. **Return secure handles/tokens, not secret bytes**
4. **Make insecure paths impossible by design**

A simple architecture:

- `:security-core` → Keystore key creation, encryption/decryption primitives
- `:security-biometric` → Biometric auth orchestration
- `:feature-payments` (or any feature) → business flow, no key internals

---

## 2) BAD vs GOOD #1 — Leaking secret material outside security layer

### ❌ BAD: feature code asks for raw AES key bytes

```kotlin
// BAD: Domain/feature should NEVER receive key material.
// This makes accidental logging, caching, or network leaks much easier.

interface InsecureCryptoRepository {
    suspend fun getOrCreateKeyBytes(alias: String): ByteArray
    suspend fun encrypt(alias: String, plaintext: ByteArray): ByteArray
}

class SaveCardUseCase(
    private val cryptoRepository: InsecureCryptoRepository,
    private val paymentsApi: PaymentsApi
) {
    suspend operator fun invoke(cardNumber: String) {
        // BAD: raw key bytes pulled into business logic.
        val keyBytes = cryptoRepository.getOrCreateKeyBytes(alias = "card_key")

        // BAD: someone might log this during debugging.
        println("DEBUG key size=${keyBytes.size}")

        val encryptedCard = cryptoRepository.encrypt(
            alias = "card_key",
            plaintext = cardNumber.toByteArray()
        )

        paymentsApi.storeEncryptedCard(encryptedCard)
    }
}
```

Problems:

- Secret bytes can leak to logs/memory dumps
- Feature/domain layer now depends on crypto internals
- Hard to audit who can touch key material

### ✅ GOOD: expose secure operations, keep key material encapsulated

```kotlin
// GOOD: Only the security module touches Android Keystore details.
// Feature/domain sees a safe API with business-friendly methods.

@JvmInline
value class CipherText(val payload: ByteArray)

interface SecureCardCipher {
    suspend fun encryptCardNumber(plainCardNumber: String): CipherText
}

class KeystoreSecureCardCipher(
    private val keystoreEngine: KeystoreEngine
) : SecureCardCipher {

    override suspend fun encryptCardNumber(plainCardNumber: String): CipherText {
        // GOOD: Alias is centralized and not spread across app layers.
        val alias = "card_key_v1"

        // GOOD: KeystoreEngine manages key creation/rotation internally.
        val encrypted = keystoreEngine.encrypt(
            alias = alias,
            plaintext = plainCardNumber.toByteArray(Charsets.UTF_8)
        )

        // GOOD: Return opaque encrypted payload, not secrets.
        return CipherText(encrypted)
    }
}

class SaveCardUseCase(
    private val secureCardCipher: SecureCardCipher,
    private val paymentsApi: PaymentsApi
) {
    suspend operator fun invoke(cardNumber: String) {
        val cipherText = secureCardCipher.encryptCardNumber(cardNumber)

        // GOOD: Business flow only handles encrypted value.
        paymentsApi.storeEncryptedCard(cipherText.payload)
    }
}
```

Why this is better:

- Secret boundaries are explicit and auditable
- Domain stays testable with fake `SecureCardCipher`
- Future key rotation changes don’t break feature code

---

## 3) BAD vs GOOD #2 — Biometric prompt mixed into ViewModel/domain

### ❌ BAD: ViewModel owns Android biometric framework details

```kotlin
// BAD: ViewModel now depends on FragmentActivity and UI framework classes.
// This breaks separation of concerns and makes testing harder.

class TransferViewModel(
    private val repository: TransferRepository
) : ViewModel() {

    fun confirmTransfer(
        activity: FragmentActivity,
        amount: Long,
        destinationIban: String
    ) {
        val promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Confirm transfer")
            .setSubtitle("Authenticate to continue")
            .setNegativeButtonText("Cancel")
            .build()

        val prompt = BiometricPrompt(
            activity,
            ContextCompat.getMainExecutor(activity),
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    viewModelScope.launch {
                        // BAD: transfer execution coupled to Android callback.
                        repository.executeTransfer(amount, destinationIban)
                    }
                }
            }
        )

        prompt.authenticate(promptInfo)
    }
}
```

Problems:

- ViewModel tied to Android UI classes
- Hard to unit test auth flow
- Reuse across screens/features becomes messy

### ✅ GOOD: biometric orchestration in adapter layer + clean domain contract

```kotlin
// GOOD: Domain depends on abstractions, not Android framework.

interface UserPresenceVerifier {
    suspend fun requireStrongAuth(reason: String): AuthResult
}

sealed interface AuthResult {
    data object Success : AuthResult
    data class Failure(val reason: String) : AuthResult
}

class ConfirmTransferUseCase(
    private val verifier: UserPresenceVerifier,
    private val repository: TransferRepository
) {
    suspend operator fun invoke(amount: Long, destinationIban: String): Result<Unit> {
        return when (val auth = verifier.requireStrongAuth("Confirm bank transfer")) {
            AuthResult.Success -> {
                repository.executeTransfer(amount, destinationIban)
                Result.success(Unit)
            }
            is AuthResult.Failure -> {
                Result.failure(IllegalStateException("Auth failed: ${auth.reason}"))
            }
        }
    }
}

// Android-specific implementation lives in UI/integration module.
class BiometricUserPresenceVerifier(
    private val promptLauncher: BiometricPromptLauncher
) : UserPresenceVerifier {
    override suspend fun requireStrongAuth(reason: String): AuthResult {
        // GOOD: Framework-specific prompt isolated here.
        return if (promptLauncher.launch(reason)) AuthResult.Success
        else AuthResult.Failure("Biometric authentication was cancelled or failed")
    }
}
```

Why this is better:

- Domain/use case stays pure and testable
- Biometric framework details are isolated
- Easy to swap auth method (biometric, device credential, passkey)

---

## 4) Practical checklist for production apps

- Keep all key aliases and crypto config centralized
- Never expose raw key material outside security module
- Gate high-risk actions with explicit `UserPresenceVerifier`
- Add telemetry for failures (without sensitive values)
- Write tests for: success, canceled auth, key invalidation, rotation

---

<div class="key-takeaway">
  <strong>Key Takeaway</strong>
  <p>
    In Android security, architecture is your first defense line. Keep secrets inside dedicated boundaries,
    expose safe capabilities to domain code, and isolate biometric framework details behind interfaces.
    If insecure usage is hard or impossible by design, your app becomes safer by default.
  </p>
</div>
