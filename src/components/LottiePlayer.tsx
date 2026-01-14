import { useRef, useState, useEffect, useCallback } from 'react';
import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react';
import './LottiePlayer.css';

interface LottiePlayerProps {
    src: string;
    title: string;
    onReady?: () => void;
    forcePause?: boolean;
}

// インラインスタイルを定数として定義（パフォーマンス最適化）
const ANIMATION_CONTAINER_STYLE = { width: '100%', height: '100%' } as const;

export function LottiePlayer({ src, title, onReady, forcePause = false }: LottiePlayerProps) {
    const dotLottieRef = useRef<DotLottie | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [totalFrames, setTotalFrames] = useState(0);
    // 初回ロード時のみ自動再生するフラグ
    const isInitialLoad = useRef(true);
    // イベントリスナーを登録したかどうかを追跡
    const listenersAttached = useRef(false);

    // イベントハンドラー（安定した参照のためuseCallbackを使用）
    const handleLoad = useCallback(() => {
        const dotLottie = dotLottieRef.current;
        if (!dotLottie) return;

        setTotalFrames(dotLottie.totalFrames);
        // 初回ロード時のみ自動再生
        if (isInitialLoad.current) {
            dotLottie.play();
            isInitialLoad.current = false;
        }
        onReady?.();
    }, [onReady]);

    const handleFrame = useCallback((event: unknown) => {
        const frameEvent = event as { currentFrame: number };
        setCurrentFrame(Math.round(frameEvent.currentFrame));
    }, []);

    const handlePlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleStop = useCallback(() => {
        setIsPlaying(false);
        setCurrentFrame(0);
    }, []);

    // DotLottieインスタンスのref callback
    const handleDotLottieRef = useCallback((dotLottie: DotLottie | null) => {
        // 前のインスタンスがあればリスナーを解除
        if (dotLottieRef.current && listenersAttached.current) {
            const prevDotLottie = dotLottieRef.current;
            prevDotLottie.removeEventListener('load', handleLoad);
            prevDotLottie.removeEventListener('frame', handleFrame);
            prevDotLottie.removeEventListener('play', handlePlay);
            prevDotLottie.removeEventListener('pause', handlePause);
            prevDotLottie.removeEventListener('stop', handleStop);
            listenersAttached.current = false;
        }

        dotLottieRef.current = dotLottie;

        // 新しいインスタンスにリスナーを登録
        if (dotLottie) {
            dotLottie.addEventListener('load', handleLoad);
            dotLottie.addEventListener('frame', handleFrame);
            dotLottie.addEventListener('play', handlePlay);
            dotLottie.addEventListener('pause', handlePause);
            dotLottie.addEventListener('stop', handleStop);
            listenersAttached.current = true;
        }
    }, [handleLoad, handleFrame, handlePlay, handlePause, handleStop]);

    // コンポーネントアンマウント時のクリーンアップ
    useEffect(() => {
        return () => {
            const dotLottie = dotLottieRef.current;
            if (dotLottie && listenersAttached.current) {
                dotLottie.removeEventListener('load', handleLoad);
                dotLottie.removeEventListener('frame', handleFrame);
                dotLottie.removeEventListener('play', handlePlay);
                dotLottie.removeEventListener('pause', handlePause);
                dotLottie.removeEventListener('stop', handleStop);
                listenersAttached.current = false;
            }
        };
    }, [handleLoad, handleFrame, handlePlay, handlePause, handleStop]);

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
                    style={ANIMATION_CONTAINER_STYLE}
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
