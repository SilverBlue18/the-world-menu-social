Usa il plugin GrowKaz Stickman per rifare il video 1 "Le piment" in formato 9:16 (stile stickman). Se i comandi /new-video, /video-styles, /render-video, /video-sound non compaiono, esegui prima /reload-plugins.

Leggi prima CLAUDE.md e BRAND.md di questo repo: questo nuovo stile stickman sostituisce il look "A + B" e la vecchia regola "niente stickman".

Materiale già pronto nel repo:
- Voiceover finale approvato (David Tyserre, francese): public/piment/voice.wav (65,25 s). NON rigenerarlo e NON accelerarlo/rallentarlo.
- Testo e tempi esatti di ogni parola: projects/piment/narration.txt, projects/piment/english.txt, projects/piment/captions.json (gruppi di frasi con en, start, end, words[{t,s,e}] da allineamento forzato). Usali al posto di una nuova trascrizione se il plugin accetta un copione con i tempi.
- Fatti e fonti: projects/piment/RESEARCH.md (usa solo questi fatti).
- Vecchie idee di scene: projects/piment/BEATS.md.

Regole fisse:
- NIENTE MUSICA di nessun tipo (nel passaggio musica del plugin scegli "none"): solo voce + effetti sonori + ambiente naturale, nessun suono intonato.
- Il CIBO è il protagonista in ogni scena: peperoncini in mano ai personaggi, sulle piante di un campo in Messico, sulla nave di Colombo, sulle navi portoghesi, in una cucina/mercato in India, il pepe nero come "prima".
- Colore firma del personaggio principale: senape #F2B134 (colore del brand).
- Sottotitoli: francese sopra con la parola pronunciata in senape, traduzione inglese sotto. Se il plugin fa una sola lingua, aggiungi i nostri sottotitoli FR/EN sopra in Remotion con TwmCaptions di src/shared/twm.tsx.
- Watermark come src/shared/Watermark.tsx e schermata finale con "Abonne-toi pour le prochain plat".
- La cartella di lavoro del plugin (growkaz-stickman-studio/, circa 1 GB) va dentro questo repo e nel .gitignore, tranne i file della storia/scene del progetto. Mai niente in ~/Desktop/studio-secrets.

Passaggi con me (approvo ogni passo, spiegazioni semplici, non sono uno sviluppatore):
1) mostrami il piano delle inquadrature;
2) mostrami alcuni fotogrammi di stile / un foglio di provini;
3) anteprima a bassa risoluzione con voce + effetti;
4) render finale 1080×1920 solo dopo il mio OK, salvato in finals/piment/ con Git LFS e file SHA256.
Fai commit e push su main man mano.
