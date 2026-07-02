package com.binbi.flipclock.core.settings

import org.junit.Assert.assertEquals
import org.junit.Test
import java.util.Locale

class AppLanguageTest {

    @Test
    fun resolveAppLanguage_usesSystemLocaleForAuto() {
        val resolved = resolveAppLanguage("auto", Locale.JAPAN)

        assertEquals(AppLanguage.JA, resolved)
    }

    @Test
    fun defaultSignature_matchesSelectedLanguage() {
        assertEquals("Flip-Uhr", defaultSignatureFor(AppLanguage.DE))
        assertEquals("ساعة فليب", defaultSignatureFor(AppLanguage.AR))
    }
}
