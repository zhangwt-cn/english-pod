import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const episodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/data/episodes.json'), 'utf-8'));

const subtitleDir = path.resolve(__dirname, '../public/subtitles');

if (!fs.existsSync(subtitleDir)) {
    fs.mkdirSync(subtitleDir, { recursive: true });
}

const BASE_URL = 'https://raw.githubusercontent.com/guaguaguaxia/english_pod/master/srt';

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                file.close();
                fs.unlink(dest, () => { });
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => { });
                reject(new Error(`Failed to download: ${response.statusCode} ${url}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

const BATCH_SIZE = 8;

async function fetchAll() {
    console.log(`Starting download of ${episodes.length} subtitles...`);
    let ok = 0, skipped = 0, failed = 0;

    for (let i = 0; i < episodes.length; i += BATCH_SIZE) {
        const batch = episodes.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (ep) => {
            const filename = `${ep.transcript_id}.srt`;
            const dest = path.join(subtitleDir, filename);

            if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
                skipped++;
                return;
            }

            const url = `${BASE_URL}/${filename}`;
            try {
                await downloadFile(url, dest);
                ok++;
                console.log(`[${ep.id}] OK: ${filename}`);
            } catch (err) {
                failed++;
                console.error(`[${ep.id}] FAIL: ${filename} - ${err.message}`);
            }
        }));
    }
    console.log(`\nDone! ok=${ok} skipped=${skipped} failed=${failed}`);
}

fetchAll();
