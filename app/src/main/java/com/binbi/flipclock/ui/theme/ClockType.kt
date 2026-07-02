package com.binbi.flipclock.ui.theme

import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight

/**
 * The digit font, as a single design token.
 *
 * It defaults to the system's heaviest weight (Roboto Black on most devices) so the app
 * builds and runs fully offline with **zero bundled assets**. This already reads as a bold
 * flip-clock face.
 *
 * To match the reference's rounded-heavy look exactly:
 *   1. Drop a heavy rounded .ttf — e.g. Poppins-Black or Montserrat-Black from Google Fonts —
 *      into `app/src/main/res/font/clock_digit.ttf` (lowercase, no hyphens in the filename).
 *   2. Replace the body of [ClockDigitFontFamily] below with:
 *         `FontFamily(Font(R.font.clock_digit))`
 *      (add `import androidx.compose.ui.text.font.Font` and `import com.binbi.flipclock.R`).
 * Nothing else in the app needs to change — every digit reads this token.
 */
val ClockDigitFontFamily: FontFamily = FontFamily.Default

val ClockDigitFontWeight: FontWeight = FontWeight.Black
