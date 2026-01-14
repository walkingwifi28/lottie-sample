/**
 * カラースウォッチコンポーネント
 * 色を視覚的に表示し、クリックで選択可能
 */

import { lottieToHex, getTextColor, colorsEqual } from '../../utils/colorConverter';
import type { LottieColor } from '../../types/lottieColor';
import './ColorEditor.css';

interface ColorSwatchProps {
    color: LottieColor;
    isSelected: boolean;
    onClick: () => void;
    onReset: () => void;
}

export function ColorSwatch({ color, isSelected, onClick, onReset }: ColorSwatchProps) {
    const currentHex = lottieToHex(color.current);
    const originalHex = lottieToHex(color.original);
    const textColor = getTextColor(color.current);
    const hasChanged = !colorsEqual(color.original, color.current);

    const typeLabel = {
        fill: 'Fill',
        stroke: 'Stroke',
        solid: 'Solid',
    }[color.type];

    const count = color.targets.length;
    const layerInfo = count === 1
        ? color.targets[0].layerName
        : `${count}箇所`;

    return (
        <div
            className={`color-swatch ${isSelected ? 'color-swatch--selected' : ''} ${hasChanged ? 'color-swatch--changed' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            aria-label={`${layerInfo} - ${typeLabel}`}
        >
            <div
                className="color-swatch__preview"
                style={{ backgroundColor: currentHex }}
            >
                {hasChanged && (
                    <div
                        className="color-swatch__original"
                        style={{ backgroundColor: originalHex }}
                        title={`元の色: ${originalHex}`}
                    />
                )}
                <span
                    className="color-swatch__type"
                    style={{ color: textColor }}
                >
                    {typeLabel}
                </span>
            </div>

            <div className="color-swatch__info">
                <span className="color-swatch__hex">{currentHex.toUpperCase()}</span>
                <span className="color-swatch__layer" title={count === 1 ? layerInfo : `${count}箇所で使用されています`}>
                    {layerInfo}
                </span>
            </div>

            {hasChanged && (
                <button
                    className="color-swatch__reset"
                    onClick={(e) => {
                        e.stopPropagation();
                        onReset();
                    }}
                    title="元の色に戻す"
                    aria-label="元の色に戻す"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                </button>
            )}
        </div>
    );
}
