"""Generate candidate takes for lines with foreign words (same voice, with previous/next text for prosody)."""
import json, subprocess, sys, urllib.request, os
LINES = [l.strip() for l in open("/home/user/studio/projects/imam/narration.txt") if l.strip()]
VOICE = "pqHfZKP75CvOlQylNhV4"
OUT = "/home/user/studio/projects/imam/takes"
def tts(text, prev, nxt, out, seed):
    body = {"text": text, "model_id": "eleven_multilingual_v2", "previous_text": prev, "next_text": nxt, "seed": seed,
            "voice_settings": {"stability": 0.55, "similarity_boost": 0.75, "style": 0.15, "use_speaker_boost": True, "speed": 1.1}}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"xi-api-key": "proxy-injected", "Content-Type": "application/json"})
    open(out, "wb").write(urllib.request.urlopen(req, timeout=120).read())
VARIANTS = {
    2: ["On board is the navy's imam: Abdurrahman al-Baghdadi.",
        "On board is the navy's imam: Abd-ur-Rahmaan al-Baghdaadi.",
        "On board is the navy's imam: Abdurrahmaan al-Baghdaadi."],
    3: ["A storm near Mallorca. Another off Cape Verde. For weeks, they're lost at sea.",
        "A storm near Ma-yorka. Another off Cape Verde. For weeks, they're lost at sea.",
        "A storm near Mayorka. Another off Cape Verde. For weeks, they're lost at sea."],
    6: ['Then a Black man walks up to the imam and says: "Eu Muslim." I am Muslim.',
        'Then a Black man walks up to the imam and says: "Eh-oo Muslim." I am Muslim.',
        'Then a Black man walks up to the imam and says: "Ê-u Muslim." I am Muslim.'],
    9: ["They're Malês: West African Muslims, enslaved in Brazil. After their revolt in 1835, their faith had to stay hidden.",
        "They're Mah-lehs: West African Muslims, enslaved in Brazil. After their revolt in 1835, their faith had to stay hidden.",
        "They're Malés: West African Muslims, enslaved in Brazil. After their revolt in 1835, their faith had to stay hidden."],
}
for li, vs in VARIANTS.items():
    prev = " ".join(LINES[max(0, li - 2):li]); nxt = LINES[li + 1] if li + 1 < len(LINES) else ""
    for vi, text in enumerate(vs):
        for seed in (11, 29):
            out = f"{OUT}/L{li}_v{vi}_s{seed}.mp3"
            if not os.path.exists(out): tts(text, prev, nxt, out, seed)
            print(out, flush=True)
