# Continuous-flow documentary style (from the user's PDF)

Cinematic motion video built entirely from code. No AI video generators, no stock footage. Every frame drawn with code, rendered to MP4.

INPUTS: voiceover audio (word timings from scripts/transcribe.sh), photos of real people/places/objects (public/images), style references (public/refs), format (default 1080x1920, 30fps) — length matches the voiceover exactly.

STYLE
- ONE continuous camera move over one big world (map, desk, board). No cuts, no slide changes. Glide, push in on details, pull back to travel, dive in again.
- Smooth, filmed motion. Every start/stop eases. Camera never stops dead: during holds it drifts toward where it goes next. Subtle handheld, motion blur on fast moves, film grain, soft glow, vignette.
- Real photos/documents drop onto the world as physical objects (prints, papers, clippings) where the story happens.

READABILITY RULES (most important)
1. One idea per narration line; ONE hero on screen, everything else dims.
2. Every phrase appears on screen once, never repeated (document OR typed, never both).
3. No filler text: document body copy = soft grey lines.
4. Big type: readable on a phone in one second.
5. Less is more: no decorative clutter.
6. Visual moments land exactly on the spoken word.

PROCESS
- Beat table first: time → narration → the one hero → on-screen text. Show it to the user, ask what's unclear.
- Quality over speed. Check stills of every beat and frame sequences of camera moves before final render; fix clutter, overlaps, jerks, abrupt stops.
- Deliver final MP4 with voiceover synced in the exact format.
