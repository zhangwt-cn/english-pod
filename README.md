# EnglishPod

A modern, interactive web app for learning English through 365 EnglishPod episodes — with **time-synced live subtitles** and the original dialogue + vocabulary notes side by side.

## Features

- 365 episodes across Elementary / Intermediate / Advanced levels
- **Live Subtitles** synced to audio playback — current line auto-highlights and scrolls into view; click any line to seek
- Dialogue & Vocabulary tab with the original curated transcript
- Audio player: play/pause, ±10s skip, prev/next episode, loop, autoplay-next, 0.5x–2x playback speed, volume
- Searchable episode list
- Light / Dark / System theme, persisted in localStorage
- Responsive (mobile drawer, desktop split view)

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS 4
- Lucide React icons

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview  # http://localhost:4173
```

## Data

- **Episodes & dialogue transcripts**: pre-fetched into `public/transcripts/` (see `scripts/fetch_transcripts.js`)
- **Subtitles** (SRT, time-stamped): pre-fetched into `public/subtitles/` (see `scripts/fetch_subtitles.js`)
- **Audio**: streamed from `archive.org/download/englishpod_all/`

To re-fetch:

```bash
node scripts/fetch_transcripts.js
node scripts/fetch_subtitles.js
```

## Credits

- Modified from [huynhthientung/english-pod](https://github.com/huynhthientung/english-pod)
- Time-stamped SRT subtitles from [guaguaguaxia/english_pod](https://github.com/guaguaguaxia/english_pod) (generated with OpenAI Whisper)
- Original audio + transcripts hosted on [archive.org/details/englishpod_all](https://archive.org/details/englishpod_all)
