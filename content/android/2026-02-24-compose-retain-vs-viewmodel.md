---
title: "Compose retain vs ViewModel: Practical Guide, Trade-offs, and Real Examples"
date: "2026-02-24"
description: "A detailed guide to Compose retain: what it solves, what it does NOT replace, and concrete scenarios where retain is better than creating a ViewModel."
tags: ["Compose", "Android", "Architecture", "State Management", "ViewModel"]
---

`retain` is one of the most interesting additions in Compose state management because it fills a gap between:

- short-lived UI memory (`remember`)
- process/configuration-resilient state (`rememberSaveable` / `ViewModel`)

But the most important thing to understand is this:

**`retain` is not a universal replacement for `ViewModel`.**

If you force it to replace architecture-level state holders, you’ll likely create harder-to-maintain screens.

## 1) The mental model: state lifespans in Compose

Before deciding between `retain` and `ViewModel`, align on lifespan:

- **`remember`**: survives recomposition only.
- **`rememberSaveable`**: survives recomposition + configuration changes (and sometimes process recreation through saved state), but only for Bundle-friendly data.
- **`retain`**: keeps values alive longer than plain composition memory for retained UI scope use-cases.
- **`ViewModel`**: lifecycle-aware screen/domain state holder with architectural boundaries.

Think of `retain` as **UI-lifecycle memory**, while `ViewModel` is **architecture-lifecycle memory**.

---

## 2) What `retain` is good at

Use `retain` when all of these are true:

1. State/object is primarily **UI-facing**.
2. You want to avoid recreating a costly object every time the composable subtree is rebuilt.
3. You **don’t need** full ViewModel responsibilities (repository orchestration, screen business logic, SavedStateHandle workflows, cross-screen sharing).

Typical candidates:

- expensive UI helpers
- per-screen temporary editors/wizards
- lightweight presenter/state-holder classes with no Android lifecycle dependencies

---

## 3) What `retain` should NOT replace

Do **not** replace `ViewModel` with `retain` when you need:

- business logic orchestration across repositories/use-cases
- state exposed as app architecture contract (`StateFlow` consumed by multiple layers)
- robust process-death restoration strategy
- navigation-level shared state
- lifecycle-aware cancellation and structured side effects tied to screen lifecycle owner

In these cases, `ViewModel` is still the correct default.

---

## 4) Decision matrix: `retain` vs `ViewModel`

### Prefer `retain` when:
- the problem is local to one screen/composable tree
- state is mostly presentation/UI behavior
- creating a ViewModel would be boilerplate without architectural value

### Prefer `ViewModel` when:
- state is part of business workflow
- you need testable screen logic that survives configuration changes predictably
- state interacts deeply with use cases/repositories
- you need a stable architecture boundary in a modular app

---

## 5) Concrete examples where `retain` is better than creating a ViewModel

> The following examples intentionally show cases where many teams create a ViewModel by habit, but `retain` is often cleaner.

### Example A — Search UI controller (screen-local, no domain ownership)

**Scenario:** You have a searchable list and a small query controller with debounce state and UI-only filters.

```kotlin
class SearchUiController {
    var query by mutableStateOf("")
        private set

    var selectedChips by mutableStateOf(setOf<String>())
        private set

    fun onQueryChange(value: String) {
        // UI behavior only: trim and normalize spaces for better UX
        query = value.replace("\\s+".toRegex(), " ").trimStart()
    }

    fun toggleChip(chip: String) {
        selectedChips =
            if (chip in selectedChips) selectedChips - chip
            else selectedChips + chip
    }
}

@Composable
fun ProductSearchScreen(
    products: List<Product>
) {
    // ✅ retain keeps this controller alive for retained UI scope use cases
    // without introducing a full ViewModel layer for pure UI behavior.
    val controller = retain { SearchUiController() }

    val filtered = remember(products, controller.query, controller.selectedChips) {
        products.filter { product ->
            val queryMatch = controller.query.isBlank() ||
                product.name.contains(controller.query, ignoreCase = true)

            val chipMatch = controller.selectedChips.isEmpty() ||
                product.tags.any { it in controller.selectedChips }

            queryMatch && chipMatch
        }
    }

    SearchScreenContent(
        query = controller.query,
        selectedChips = controller.selectedChips,
        items = filtered,
        onQueryChange = controller::onQueryChange,
        onChipToggle = controller::toggleChip
    )
}
```

**Why `retain` works better here:**
- This is UI transformation logic, not app/domain state.
- A ViewModel would add DI/factory overhead for little architectural payoff.

---

### Example B — Multi-step form draft used only inside one route

**Scenario:** A 3-step onboarding draft that doesn’t need repository access until final submit.

```kotlin
class OnboardingDraft {
    var name by mutableStateOf("")
    var role by mutableStateOf("")
    var notificationsEnabled by mutableStateOf(true)

    fun isStep1Valid(): Boolean = name.isNotBlank()
    fun isStep2Valid(): Boolean = role.isNotBlank()
}

@Composable
fun OnboardingRoute(
    onSubmit: suspend (OnboardingDraft) -> Unit
) {
    // ✅ Keep draft object without forcing a dedicated ViewModel.
    val draft = retain { OnboardingDraft() }

    var currentStep by rememberSaveable { mutableIntStateOf(1) }

    when (currentStep) {
        1 -> Step1(
            name = draft.name,
            onNameChange = { draft.name = it },
            onNext = { if (draft.isStep1Valid()) currentStep = 2 }
        )
        2 -> Step2(
            role = draft.role,
            onRoleChange = { draft.role = it },
            onBack = { currentStep = 1 },
            onNext = { if (draft.isStep2Valid()) currentStep = 3 }
        )
        3 -> Step3(
            notificationsEnabled = draft.notificationsEnabled,
            onNotificationsChange = { draft.notificationsEnabled = it },
            onBack = { currentStep = 2 },
            onSubmit = {
                // Submission side effect can still be delegated upward.
                // If workflow becomes complex, this is where ViewModel is promoted.
            }
        )
    }
}
```

**Why `retain` works better here:**
- Data is temporary and strictly route-local.
- It avoids creating a ViewModel just to hold three fields and validation helpers.

---

### Example C — Expensive UI helper object

**Scenario:** You build a syntax-highlighting editor and parser setup is expensive.

```kotlin
class SyntaxHighlighter(language: String) {
    // Heavy initialization (token rules, regex precompilation, etc.)
    private val engine = buildHighlightEngine(language)

    fun highlight(source: String): AnnotatedString = engine.toAnnotatedString(source)
}

@Composable
fun CodeEditorScreen(language: String, text: String) {
    // ✅ retain avoids rebuilding expensive helper repeatedly for UI lifecycle changes.
    val highlighter = retain(language) { SyntaxHighlighter(language) }

    val highlighted by remember(text) {
        mutableStateOf(highlighter.highlight(text))
    }

    CodeEditorContent(highlighted)
}
```

**Why `retain` works better here:**
- This object is a rendering helper, not screen business state.
- ViewModel would be a structural mismatch for a pure UI infrastructure object.

---

## 6) Same problem, when `ViewModel` is still the right answer

Take Example A (search). If requirements change to:

- fetch paginated results from network + cache
- expose loading/error/retry
- preserve query through process recreation strategy
- coordinate analytics and deep links

Then this is no longer “just UI behavior.” Promote to `ViewModel`.

```kotlin
class ProductSearchViewModel(
    private val repository: ProductRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val query = MutableStateFlow(savedStateHandle["query"] ?: "")

    val uiState: StateFlow<SearchUiState> = query
        .debounce(300)
        .flatMapLatest { repository.search(it) }
        .map { result -> result.toUiState() }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SearchUiState.Loading)

    fun onQueryChange(value: String) {
        query.value = value
        savedStateHandle["query"] = value
    }
}
```

This is architecture-level state: **`ViewModel` wins.**

---

## 7) Migration strategy (safe and incremental)

If your codebase currently overuses ViewModel for tiny UI state:

1. Identify screens where ViewModel only stores local toggles/filters/drafts.
2. Extract a small plain Kotlin state holder.
3. Host it with `retain` in the route composable.
4. Keep side effects and repository orchestration outside until needed.
5. Re-promote to ViewModel only when complexity crosses architecture boundaries.

This keeps code simple without losing long-term maintainability.

---

## 8) Practical rules you can adopt today

- Default to **`remember`** for trivial, ephemeral UI state.
- Use **`rememberSaveable`** when users would be annoyed by losing a simple value.
- Use **`retain`** for medium-lived UI state/objects where ViewModel would be overkill.
- Use **`ViewModel`** for business workflows, repository coordination, and architecture contracts.

If unsure, ask:

> “If I remove Android lifecycle concerns, does this class still make architectural sense?”

- If **yes** → likely ViewModel/use-case territory.
- If **no** → likely UI state holder territory (`remember`/`retain`).

---

## 9) Final take

`retain` is excellent for reducing unnecessary ViewModel boilerplate in Compose-heavy UIs.

But treating it as a full ViewModel replacement is a trap.

Use `retain` to keep UI-focused objects alive longer and keep screen code lean. Use ViewModel when state becomes part of your app architecture.

That boundary is where maintainability is won or lost.

<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
  <h3 class="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
  <p class="text-sm text-yellow-900 m-0">
    <code>retain</code> is a powerful UI-state tool, not an architectural state container. Use it for screen-local, UI-focused objects; keep <code>ViewModel</code> for business logic, repository orchestration, and long-lived app state contracts.
  </p>
</div>
