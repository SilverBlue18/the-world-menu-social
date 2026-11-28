"""Short caption GROUPS (shorts-autopilot rule: 3-6 words, top of frame, spoken word lit) for an EN-narrated Short with a FR line.
Reads projects/<slug>/captions_src.json ([[en_group, fr_group], ...], whose EN words concatenate to narration.txt exactly) and the
word timings produced by tools/twm_words.py (projects/<slug>/captions.json, one entry per narration line).
Writes projects/<slug>/groups.json: [{start, end, en (= FR line shown under), words:[{t,s,e}]}] (TwmCap shape).
usage: python3 tools/twm_groups.py <slug>"""
import json, sys
slug = sys.argv[1]; R = f"projects/{slug}"
src = json.load(open(f"{R}/captions_src.json")); lines = json.load(open(f"{R}/captions.json"))
words = [w for l in lines for w in l["words"]]; out = []; i = 0
for en, fr in src:
    n = len(en.split()); ws = words[i:i + n]; i += n
    assert [w["t"] for w in ws] == en.split(), (en, [w["t"] for w in ws])
    out.append({"start": ws[0]["s"], "end": ws[-1]["e"], "en": fr, "words": ws})
assert i == len(words), "caption groups must cover every narration word"
json.dump(out, open(f"{R}/groups.json", "w"), ensure_ascii=False, indent=1); print(len(out), "groups")
