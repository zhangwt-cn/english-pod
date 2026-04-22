import { Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="py-3 px-4 lg:px-6 max-w-4xl mx-auto text-center text-xs text-zinc-500 dark:text-zinc-500 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <span className="flex items-center gap-1.5">
                <Github size={12} />
                Modified from{' '}
                <a
                    href="https://github.com/huynhthientung/english-pod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    huynhthientung/english-pod
                </a>
            </span>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">·</span>
            <span>
                Subtitles from{' '}
                <a
                    href="https://github.com/guaguaguaxia/english_pod"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    guaguaguaxia/english_pod
                </a>
            </span>
        </footer>
    );
}
