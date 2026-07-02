# Android Productivity Web-Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Android timer, stopwatch, countdown, and focus screens visually align with the web version while adding the web-style timer editing gestures and a mobile-friendly countdown create panel.

**Architecture:** Keep the existing ViewModel and repository layer, but introduce a small interaction/state helper for editable timer digits and a shared layout strategy for larger center-stage flip displays. Rework the Compose productivity surfaces so the Android screens follow the web information hierarchy while preserving phone-friendly vertical layouts.

**Tech Stack:** Kotlin, Jetpack Compose, StateFlow/ViewModel, JUnit4, existing Gradle 8.7 local distribution

---

### Task 1: Lock down timer editing and sizing behavior with tests

**Files:**
- Create: `D:\binbi\Documents\Code\project\app\clock\app\src\test\java\com\binbi\flipclock\productivity\TimerEditorBehaviorTest.kt`
- Modify: `D:\binbi\Documents\Code\project\app\clock\app\src\test\java\com\binbi\flipclock\productivity\FlipDisplayPartsTest.kt`
- Modify: `D:\binbi\Documents\Code\project\app\clock\app\src\main\java\com\binbi\flipclock\productivity\FlipDurationDisplay.kt`

- [ ] **Step 1: Write the failing timer editor tests**

```kotlin
@Test
fun incrementsHourByOneWithinBounds() {
    val editor = TimerEditState(hours = 1, minutes = 5, seconds = 9)

    val next = editor.adjust(segment = TimerSegment.HOURS, delta = 1)

    assertEquals(TimerEditState(hours = 2, minutes = 5, seconds = 9), next)
}

@Test
fun wrapsMinutesWhenSwipingBelowZero() {
    val editor = TimerEditState(hours = 0, minutes = 0, seconds = 0)

    val next = editor.adjust(segment = TimerSegment.MINUTES, delta = -1)

    assertEquals(TimerEditState(hours = 0, minutes = 59, seconds = 0), next)
}
```

- [ ] **Step 2: Run the targeted tests to verify RED**

Run: `C:\Users\binbi\.gradle\wrapper\dists\gradle-8.7-bin\bhs2wmbdwecv87pi65oeuq5iu\gradle-8.7\bin\gradle.bat :app:testDebugUnitTest --tests "com.binbi.flipclock.productivity.TimerEditorBehaviorTest" --tests "com.binbi.flipclock.productivity.FlipDisplayPartsTest"`

Expected: FAIL because `TimerEditState` / `TimerSegment` do not exist yet, plus any new layout expectations fail.

- [ ] **Step 3: Add the minimal timer editor model and shared large-display sizing helpers**

```kotlin
enum class TimerSegment { HOURS, MINUTES, SECONDS }

data class TimerEditState(
    val hours: Int,
    val minutes: Int,
    val seconds: Int,
) {
    fun adjust(segment: TimerSegment, delta: Int): TimerEditState = when (segment) {
        TimerSegment.HOURS -> copy(hours = (hours + delta).floorMod(100))
        TimerSegment.MINUTES -> copy(minutes = (minutes + delta).floorMod(60))
        TimerSegment.SECONDS -> copy(seconds = (seconds + delta).floorMod(60))
    }
}
```

- [ ] **Step 4: Re-run the targeted tests to verify GREEN**

Run: `C:\Users\binbi\.gradle\wrapper\dists\gradle-8.7-bin\bhs2wmbdwecv87pi65oeuq5iu\gradle-8.7\bin\gradle.bat :app:testDebugUnitTest --tests "com.binbi.flipclock.productivity.TimerEditorBehaviorTest" --tests "com.binbi.flipclock.productivity.FlipDisplayPartsTest"`

Expected: PASS

- [ ] **Step 5: Commit the test-first foundation**

```bash
git add app/src/test/java/com/binbi/flipclock/productivity/TimerEditorBehaviorTest.kt app/src/test/java/com/binbi/flipclock/productivity/FlipDisplayPartsTest.kt app/src/main/java/com/binbi/flipclock/productivity/FlipDurationDisplay.kt
git commit -m "test: add timer editor and display layout coverage"
```

### Task 2: Rebuild the timer screen around editable flip cards

**Files:**
- Modify: `D:\binbi\Documents\Code\project\app\clock\app\src\main\java\com\binbi\flipclock\productivity\ProductivityViewModels.kt`
- Modify: `D:\binbi\Documents\Code\project\app\clock\app\src\main\java\com\binbi\flipclock\productivity\ProductivityScreens.kt`
- Test: `D:\binbi\Documents\Code\project\app\clock\app\src\test\java\com\binbi\flipclock\productivity\TimerEditorBehaviorTest.kt`

- [ ] **Step 1: Extend tests for duration syncing**

```kotlin
@Test
fun editorConvertsToMillisForStartAction() {
    val editor = TimerEditState(hours = 1, minutes = 2, seconds = 3)

    assertEquals(3_723_000L, editor.toMillis())
}
```

- [ ] **Step 2: Run the timer editor tests and verify RED**

Run: `C:\Users\binbi\.gradle\wrapper\dists\gradle-8.7-bin\bhs2wmbdwecv87pi65oeuq5iu\gradle-8.7\bin\gradle.bat :app:testDebugUnitTest --tests "com.binbi.flipclock.productivity.TimerEditorBehaviorTest"`

Expected: FAIL because `toMillis()` is missing.

- [ ] **Step 3: Implement timer editing state in the ViewModel and Compose screen**

```kotlin
fun setCustomDuration(hours: Int, minutes: Int, seconds: Int) {
    val duration = TimerEditState(hours, minutes, seconds).toMillis().coerceAtLeast(1_000L)
    _uiState.value = _uiState.value.copy(
        timer = TimerCalculator.reset(duration),
        defaultMillis = duration,
        showCompletionAlert = false,
    )
}
```

- [ ] **Step 4: Re-run the timer editor tests**

Run: `C:\Users\binbi\.gradle\wrapper\dists\gradle-8.7-bin\bhs2wmbdwecv87pi65oeuq5iu\gradle-8.7\bin\gradle.bat :app:testDebugUnitTest --tests "com.binbi.flipclock.productivity.TimerEditorBehaviorTest"`

Expected: PASS

- [ ] **Step 5: Commit the timer screen parity work**

```bash
git add app/src/main/java/com/binbi/flipclock/productivity/ProductivityViewModels.kt app/src/main/java/com/binbi/flipclock/productivity/ProductivityScreens.kt app/src/test/java/com/binbi/flipclock/productivity/TimerEditorBehaviorTest.kt
git commit -m "feat: add web-style editable timer screen"
```

### Task 3: Align stopwatch, countdown, and focus layouts with the web hierarchy

**Files:**
- Modify: `D:\binbi\Documents\Code\project\app\clock\app\src\main\java\com\binbi\flipclock\productivity\ProductivityScreens.kt`
- Modify: `D:\binbi\Documents\Code\project\app\clock\app\src\main\java\com\binbi\flipclock\productivity\ProductivityViewModels.kt`
- Test: `D:\binbi\Documents\Code\project\app\clock\app\src\test\java\com\binbi\flipclock\productivity\FlipDisplayPartsTest.kt`

- [ ] **Step 1: Add failing layout expectations for larger mobile displays**

```kotlin
@Test
fun largeStageDisplayUsesTallerCardsThanCompactSecondaryDisplay() {
    assertTrue(StageFlipHeights.primary > StageFlipHeights.secondary)
    assertTrue(StageFlipHeights.primary >= 260f)
}
```

- [ ] **Step 2: Run the productivity display tests to verify RED**

Run: `C:\Users\binbi\.gradle\wrapper\dists\gradle-8.7-bin\bhs2wmbdwecv87pi65oeuq5iu\gradle-8.7\bin\gradle.bat :app:testDebugUnitTest --tests "com.binbi.flipclock.productivity.FlipDisplayPartsTest"`

Expected: FAIL because the new stage height contract is not implemented yet.

- [ ] **Step 3: Update the remaining screens to use the new hierarchy**

```kotlin
val primaryHeight = if (compact) StageFlipHeights.primaryCompact.dp else StageFlipHeights.primary.dp
val secondaryHeight = if (compact) StageFlipHeights.secondaryCompact.dp else StageFlipHeights.secondary.dp
```

- [ ] **Step 4: Re-run the display tests**

Run: `C:\Users\binbi\.gradle\wrapper\dists\gradle-8.7-bin\bhs2wmbdwecv87pi65oeuq5iu\gradle-8.7\bin\gradle.bat :app:testDebugUnitTest --tests "com.binbi.flipclock.productivity.FlipDisplayPartsTest"`

Expected: PASS

- [ ] **Step 5: Commit the remaining productivity screens**

```bash
git add app/src/main/java/com/binbi/flipclock/productivity/ProductivityScreens.kt app/src/main/java/com/binbi/flipclock/productivity/ProductivityViewModels.kt app/src/test/java/com/binbi/flipclock/productivity/FlipDisplayPartsTest.kt
git commit -m "feat: align Android productivity screens with web layout"
```

### Task 4: Full verification, APK install, and cleanup

**Files:**
- Verify only

- [ ] **Step 1: Run Android unit tests**

Run: `C:\Users\binbi\.gradle\wrapper\dists\gradle-8.7-bin\bhs2wmbdwecv87pi65oeuq5iu\gradle-8.7\bin\gradle.bat :app:testDebugUnitTest`

Expected: PASS

- [ ] **Step 2: Build the debug APK**

Run: `C:\Users\binbi\.gradle\wrapper\dists\gradle-8.7-bin\bhs2wmbdwecv87pi65oeuq5iu\gradle-8.7\bin\gradle.bat :app:assembleDebug`

Expected: PASS and output at `app/build/outputs/apk/debug/app-debug.apk`

- [ ] **Step 3: Re-run the web regression suite**

Run: `npm run test`

Expected: PASS

- [ ] **Step 4: Install the APK on the connected device**

Run: `adb install -r D:\binbi\Documents\Code\project\app\clock\app\build\outputs\apk\debug\app-debug.apk`

Expected: `Success`

- [ ] **Step 5: Commit any final polish after verification**

```bash
git status --short
git add <verified files>
git commit -m "chore: polish Android productivity parity"
```
