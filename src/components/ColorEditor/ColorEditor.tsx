/**
 * カラーエディターメインコンポーネント
 */

import { ColorSwatch } from './ColorSwatch';
import { ColorSliders } from './ColorSliders';
import type { LottieColor } from '../../types/lottieColor';
import './ColorEditor.css';

interface ColorEditorProps {
    colors: LottieColor[];
    selectedColorId: string | null;
    onSelectColor: (id: string | null) => void;
    onUpdateColor: (id: string, newColor: number[]) => void;
    onResetColor: (id: string) => void;
    onResetAllColors: () => void;
    hasChanges: boolean;
    onSliderDragStart?: () => void;
    onSliderDragEnd?: () => void;
}

export function ColorEditor({
    colors,
    selectedColorId,
    onSelectColor,
    onUpdateColor,
    onResetColor,
    onResetAllColors,
    hasChanges,
    onSliderDragStart,
    onSliderDragEnd,
}: ColorEditorProps) {
    const selectedColor = colors.find((c) => c.id === selectedColorId);

    if (colors.length === 0) {
        return (
            <div className="color-editor color-editor--empty">
                <div className="color-editor__empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                    <p>編集可能な色が見つかりませんでした</p>
                    <span>静的カラー（アニメーションしていない色）のみ編集できます</span>
                </div>
            </div>
        );
    }

    return (
        <div className="color-editor">
            <div className="color-editor__header">
                <h3 className="color-editor__title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="13.5" cy="6.5" r="2.5" />
                        <circle cx="17.5" cy="10.5" r="2.5" />
                        <circle cx="8.5" cy="7.5" r="2.5" />
                        <circle cx="6.5" cy="12.5" r="2.5" />
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
                    </svg>
                    カラーエディター
                    <span className="color-editor__count">({colors.length}色)</span>
                </h3>
                {hasChanges && (
                    <button
                        className="color-editor__reset-all"
                        onClick={onResetAllColors}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                        全てリセット
                    </button>
                )}
            </div>

            <div className="color-editor__content">
                <div className="color-editor__swatches">
                    <h4 className="color-editor__section-title">使用されている色</h4>
                    <div className="color-editor__swatch-grid">
                        {colors.map((color) => (
                            <ColorSwatch
                                key={color.id}
                                color={color}
                                isSelected={color.id === selectedColorId}
                                onClick={() => onSelectColor(color.id)}
                                onReset={() => onResetColor(color.id)}
                            />
                        ))}
                    </div>
                </div>

                {selectedColor && (
                    <div className="color-editor__sliders">
                        <h4 className="color-editor__section-title">色を調整</h4>
                        <ColorSliders
                            color={selectedColor}
                            onColorChange={(newColor) => onUpdateColor(selectedColor.id, newColor)}
                            onReset={() => onResetColor(selectedColor.id)}
                            onSliderDragStart={onSliderDragStart}
                            onSliderDragEnd={onSliderDragEnd}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
