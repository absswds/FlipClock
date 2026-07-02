package com.binbi.flipclock.productivity

import androidx.compose.runtime.compositionLocalOf

/** Interface for playing completion chimes. Decoupled from Android AudioTrack for testability. */
interface ChimePlayer {
    fun play()
}

/** Default no-op implementation used in tests and previews. */
object NoOpChimePlayer : ChimePlayer {
    override fun play() {}
}

/** CompositionLocal for providing a [ChimePlayer] through the Compose tree. */
val LocalChimePlayer = compositionLocalOf<ChimePlayer> { NoOpChimePlayer }
