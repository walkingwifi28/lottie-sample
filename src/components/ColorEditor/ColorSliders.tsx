/**
 * カラースライダーコンポーネント
 * RGB各チャンネルをスライダーで調整
 */

import { useCallback, useMemo } from 'react';
import { lottieToHex, getTextColor } from '../../utils/colorConverter';
import type { LottieColor } from '../../types/lottieColor';
import './ColorEditor.css';

interface ColorSlidersProps {
    color: LottieColor;
    onColorChange: (newColor: number[]) => void;
    onReset: () => void;
    onSliderDragStart?: () => void;
    onSliderDragEnd?: () => void;
}

export function ColorSliders({ color, onColorChange, onReset, onSliderDragStart, onSliderDragEnd }: ColorSlidersProps) {
    const currentHex = lottieToHex(color.current);
    const originalHex = lottieToHex(color.original);
    const textColor = getTextColor(color.current);

    // スライダーの値変更ハンドラー
    const handleSliderChange = useCallback(
        (channel: 0 | 1 | 2, value: number) => {
            const newColor = [...color.current];
            newColor[channel] = value;
            onColorChange(newColor);
        },
        [color.current, onColorChange]
    );

    // 各チャンネルのグラデーション背景を計算
    const gradients = useMemo(() => {
        const [r, g, b] = color.current;
        return {
            r: `linear-gradient(to right,
        rgb(0, ${g * 255}, ${b * 255}),
        rgb(255, ${g * 255}, ${b * 255}))`,
            g: `linear-gradient(to right,
        rgb(${r * 255}, 0, ${b * 255}),
        rgb(${r * 255}, 255, ${b * 255}))`,
            b: `linear-gradient(to right,
        rgb(${r * 255}, ${g * 255}, 0),
        rgb(${r * 255}, ${g * 255}, 255))`,
        };
    }, [color.current]);

    const typeLabel = {
        fill: 'Fill',
        stroke: 'Stroke',
        solid: 'Solid',
    }[color.type];

    const count = color.targets.length;
    const layerInfo = count === 1
        ? color.targets[0].layerName
        : `${count}箇所で使用されています`;

    return (
        <div className="color-sliders">
            <div className="color-sliders__header">
                <div
                    className="color-sliders__preview"
                    style={{ backgroundColor: currentHex }}
                >
                    <span style={{ color: textColor }}>{currentHex.toUpperCase()}</span>
                </div>
                <div className="color-sliders__meta">
                    <span className="color-sliders__type">{typeLabel}</span>
                    <span className="color-sliders__layer">{layerInfo}</span>
                </div>
            </div>

            <div className="color-sliders__channels">
                {/* Red Channel */}
                <div className="color-slider">
                    <label className="color-slider__label">
                        <span className="color-slider__channel color-slider__channel--r">R</span>
                        <span className="color-slider__value">
                            {(color.current[0] * 255).toFixed(0)}
                        </span>
                    </label>
                    <div className="color-slider__track" style={{ background: gradients.r }}>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.001"
                            value={color.current[0]}
                            onChange={(e) => handleSliderChange(0, parseFloat(e.target.value))}
                            onMouseDown={onSliderDragStart}
                            onMouseUp={onSliderDragEnd}
                            onTouchStart={onSliderDragStart}
                            onTouchEnd={onSliderDragEnd}
                            className="color-slider__input"
                        />
                    </div>
                    <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.001"
                        value={color.current[0].toFixed(3)}
                        onChange={(e) => handleSliderChange(0, Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
                        className="color-slider__number"
                    />
                </div>

                {/* Green Channel */}
                <div className="color-slider">
                    <label className="color-slider__label">
                        <span className="color-slider__channel color-slider__channel--g">G</span>
                        <span className="color-slider__value">
                            {(color.current[1] * 255).toFixed(0)}
                        </span>
                    </label>
                    <div className="color-slider__track" style={{ background: gradients.g }}>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.001"
                            value={color.current[1]}
                            onChange={(e) => handleSliderChange(1, parseFloat(e.target.value))}
                            onMouseDown={onSliderDragStart}
                            onMouseUp={onSliderDragEnd}
                            onTouchStart={onSliderDragStart}
                            onTouchEnd={onSliderDragEnd}
                            className="color-slider__input"
                        />
                    </div>
                    <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.001"
                        value={color.current[1].toFixed(3)}
                        onChange={(e) => handleSliderChange(1, Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
                        className="color-slider__number"
                    />
                </div>

                {/* Blue Channel */}
                <div className="color-slider">
                    <label className="color-slider__label">
                        <span className="color-slider__channel color-slider__channel--b">B</span>
                        <span className="color-slider__value">
                            {(color.current[2] * 255).toFixed(0)}
                        </span>
                    </label>
                    <div className="color-slider__track" style={{ background: gradients.b }}>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.001"
                            value={color.current[2]}
                            onChange={(e) => handleSliderChange(2, parseFloat(e.target.value))}
                            onMouseDown={onSliderDragStart}
                            onMouseUp={onSliderDragEnd}
                            onTouchStart={onSliderDragStart}
                            onTouchEnd={onSliderDragEnd}
                            className="color-slider__input"
                        />
                    </div>
                    <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.001"
                        value={color.current[2].toFixed(3)}
                        onChange={(e) => handleSliderChange(2, Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
                        className="color-slider__number"
                    />
                </div>
            </div>

            <div className="color-sliders__footer">
                <div className="color-sliders__original">
                    <span>元の色:</span>
                    <div
                        className="color-sliders__original-preview"
                        style={{ backgroundColor: originalHex }}
                        title={originalHex}
                    />
                    <span className="color-sliders__original-hex">{originalHex.toUpperCase()}</span>
                </div>
                <button
                    className="color-sliders__reset-btn"
                    onClick={onReset}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                    元に戻す
                </button>
            </div>
        </div>
    );
}
