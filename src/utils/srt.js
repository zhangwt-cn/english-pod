export function parseSRT(text) {
    const blocks = text.replace(/\r\n/g, '\n').trim().split(/\n\n+/);
    const cues = [];
    for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length < 2) continue;
        const timeMatch = lines[1]?.match(
            /(\d+):(\d+):(\d+),(\d+)\s*-->\s*(\d+):(\d+):(\d+),(\d+)/
        );
        if (!timeMatch) continue;
        const toSec = (h, m, s, ms) => +h * 3600 + +m * 60 + +s + +ms / 1000;
        cues.push({
            id: cues.length,
            start: toSec(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]),
            end: toSec(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]),
            text: lines.slice(2).join(' ').trim(),
        });
    }
    return cues;
}

export function findActiveCueIndex(cues, time) {
    if (!cues.length || time < cues[0].start) return -1;
    let lo = 0, hi = cues.length - 1, ans = -1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (cues[mid].start <= time) { ans = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    return ans;
}

export function formatTimestamp(time) {
    if (!time || isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}
