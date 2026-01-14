import { useRef, useState, useEffect, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './LottiePlayer.css';

interface LottiePlayerProps {
    src: string;
    title: string;
    onReady?: () => void;
    forcePause?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DotLottieInstance = any;

export function LottiePlayer({ src, title, onReady, forcePause = false }: LottiePlayerProps) {
    const dotLottieRef = useRef<DotLottieInstance>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [totalFrames, setTotalFrames] = useState(0);
    // 初回ロード時のみ自動再生するフラグ
    const isInitialLoad = useRef(true);


    const handleDotLottieRef = useCallback((dotLottie: DotLottieInstance) => {
        dotLottieRef.current = dotLottie;

        if (dotLottie) {
            dotLottie.addEventListener('load', () => {
                setTotalFrames(dotLottie.totalFrames);
                // 初回ロード時のみ自動再生
                if (isInitialLoad.current) {
                    dotLottie.play();
                    isInitialLoad.current = false;
                }
                onReady?.();
            });

            dotLottie.addEventListener('frame', (event: { currentFrame: number }) => {
                setCurrentFrame(Math.round(event.currentFrame));
            });

            dotLottie.addEventListener('play', () => {
                setIsPlaying(true);
            });

            dotLottie.addEventListener('pause', () => {
                setIsPlaying(false);
            });

            dotLottie.addEventListener('stop', () => {
                setIsPlaying(false);
                setCurrentFrame(0);
            });
        }
    }, [onReady]);

    // srcが変更されたらフレームをリセット（再生状態は維持しない）
    useEffect(() => {
        setCurrentFrame(0);
    }, [src]);

    // forcePauseの変化を監視して一時停止
    useEffect(() => {
        if (forcePause) {
            // 一時停止前の状態を確認して停止
            const currentlyPlaying = dotLottieRef.current?.isPlaying ?? false;
            if (currentlyPlaying) {
                dotLottieRef.current?.pause();
            }
        }
        // forcePauseが解除されても自動再生しない
    }, [forcePause]);

    const handlePlayPause = useCallback(() => {
        if (isPlaying) {
            dotLottieRef.current?.pause();
        } else {
            dotLottieRef.current?.play();
        }
    }, [isPlaying]);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const frame = parseInt(e.target.value, 10);
        dotLottieRef.current?.setFrame(frame);
        setCurrentFrame(frame);
    }, []);

    return (
        <div className="lottie-player">
            <h2 className="player-title">{title}</h2>

            <div className="animation-container">
                <DotLottieReact
                    src={src}
                    loop
                    autoplay={false}
                    style={{ width: '100%', height: '100%' }}
                    dotLottieRefCallback={handleDotLottieRef}
                />
            </div>

            <div className="playback-controls">
                <button
                    className="control-button"
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? '一時停止' : '再生'}
                >
                    {isPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                    )}
                </button>

                <div className="seek-container">
                    <input
                        type="range"
                        className="seek-bar"
                        min={0}
                        max={totalFrames}
                        value={currentFrame}
                        onChange={handleSeek}
                    />
                    <span className="frame-info">
                        {currentFrame} / {totalFrames}
                    </span>
                </div>
            </div>
        </div>
    );
}
