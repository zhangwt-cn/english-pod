import { useState, useEffect, useRef, useMemo } from 'react';
import { Captions, BookText } from 'lucide-react';
import { parseSRT, findActiveCueIndex, formatTimestamp } from '../utils/srt';

const Transcript = ({ episode, audioRef, onSeek }) => {
    const [tab, setTab] = useState('subtitles'); // 'subtitles' | 'dialogue'

    return (
        <div className="glass-card rounded-2xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Transcript</h3>
                <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-200 dark:border-zinc-700/50">
                    <TabButton active={tab === 'subtitles'} onClick={() => setTab('subtitles')} icon={<Captions size={14} />}>
                        Live Subtitles
                    </TabButton>
                    <TabButton active={tab === 'dialogue'} onClick={() => setTab('dialogue')} icon={<BookText size={14} />}>
                        Dialogue & Vocab
                    </TabButton>
                </div>
            </div>

            {tab === 'subtitles' ? (
                <SubtitleView episode={episode} audioRef={audioRef} onSeek={onSeek} />
            ) : (
                <DialogueView episode={episode} />
            )}
        </div>
    );
};

const TabButton = ({ active, onClick, icon, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${active
            ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
    >
        {icon}
        {children}
    </button>
);

const SubtitleView = ({ episode, audioRef, onSeek }) => {
    const [cues, setCues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const listRef = useRef(null);
    const cueRefs = useRef([]);

    // Load and parse SRT when episode changes
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        setCues([]);
        setActiveIdx(-1);

        const url = `./subtitles/${episode.transcript_id}.srt`;
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error('Subtitles missing');
                return res.text();
            })
            .then((text) => {
                if (cancelled) return;
                setCues(parseSRT(text));
                setLoading(false);
            })
            .catch(() => {
                if (cancelled) return;
                setError(true);
                setLoading(false);
            });

        return () => { cancelled = true; };
    }, [episode.transcript_id]);

    // Subscribe to audio timeupdate to drive highlight
    useEffect(() => {
        const audio = audioRef?.current;
        if (!audio || cues.length === 0) return;

        const onTime = () => {
            const idx = findActiveCueIndex(cues, audio.currentTime);
            setActiveIdx((prev) => (prev === idx ? prev : idx));
        };
        onTime();
        audio.addEventListener('timeupdate', onTime);
        audio.addEventListener('seeked', onTime);
        return () => {
            audio.removeEventListener('timeupdate', onTime);
            audio.removeEventListener('seeked', onTime);
        };
    }, [audioRef, cues]);

    // Auto-scroll active cue into view
    useEffect(() => {
        if (activeIdx < 0) return;
        const el = cueRefs.current[activeIdx];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [activeIdx]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || cues.length === 0) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                Could not load subtitles for this episode.
            </div>
        );
    }

    return (
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto pr-2 space-y-1">
            {cues.map((cue, i) => {
                const isActive = i === activeIdx;
                return (
                    <button
                        key={cue.id}
                        ref={(el) => (cueRefs.current[i] = el)}
                        onClick={() => onSeek?.(cue.start)}
                        className={`w-full text-left flex gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive
                            ? 'bg-indigo-50 dark:bg-indigo-500/15 border-l-4 border-indigo-500'
                            : 'border-l-4 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
                            }`}
                    >
                        <span className={`shrink-0 text-xs font-mono pt-0.5 w-12 ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-zinc-400 dark:text-zinc-500'
                            }`}>
                            {formatTimestamp(cue.start)}
                        </span>
                        <span className={`text-sm leading-relaxed ${isActive
                            ? 'text-indigo-900 dark:text-indigo-100 font-medium'
                            : 'text-zinc-700 dark:text-zinc-300'
                            }`}>
                            {cue.text}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

const DialogueView = ({ episode }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        setContent('');

        const url = `./transcripts/${episode.transcript_id}.html`;
        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error('Transcript missing');
                return res.text();
            })
            .then((html) => {
                if (cancelled) return;
                setContent(html);
                setLoading(false);
            })
            .catch(() => {
                if (cancelled) return;
                setError(true);
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, [episode.transcript_id]);

    const sanitized = useMemo(() =>
        content
            .replace(/<!DOCTYPE html>/i, '')
            .replace(/<html[^>]*>/i, '')
            .replace(/<\/html>/i, '')
            .replace(/<head>[\s\S]*?<\/head>/i, '')
            .replace(/<body[^>]*>/i, '<div class="transcript-body">')
            .replace(/<\/body>/i, '</div>'),
        [content]
    );

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                Could not load transcript for this episode.
            </div>
        );
    }

    return (
        <div
            className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 transcript-content"
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    );
};

export default Transcript;
