/**
 * カラーグループコンポーネント
 * 同じ色のレイヤーをまとめて表示し、展開/折りたたみ可能
 */

import { useMemo } from 'react';
import { lottieToHex, getTextColor, colorsEqual } from '../../utils/colorConverter';
import type { ColorGroup, LayerColor } from '../../types/lottieColor';
import './ColorEditor.css';

interface ColorGroupItemProps {
    group: ColorGroup;
    selectedLayerColorId: string | null;
    selectedGroupId: string | null;
    isBatchEditMode: boolean;
    onToggleExpand: () => void;
    onSelectLayerColor: (id: string) => void;
    onSelectGroupForBatchEdit: () => void;
    onResetGroup: () => void;
    onResetLayerColor: (id: string) => void;
}

export function ColorGroupItem({
    group,
    selectedLayerColorId,
    selectedGroupId,
    isBatchEditMode,
    onToggleExpand,
    onSelectLayerColor,
    onSelectGroupForBatchEdit,
    onResetGroup,
    onResetLayerColor,
}: ColorGroupItemProps) {
    // グループ全体で変更があるかどうか
    const groupHasChanges = useMemo(() =>
        group.layers.some(layer => !colorsEqual(layer.original, layer.current)),
        [group.layers]
    );

    // グループの現在の色（最初のレイヤーから取得）
    const currentColor = group.layers[0]?.current ?? group.originalColor;
    const currentHex = lottieToHex(currentColor);
    const originalHex = lottieToHex(group.originalColor);
    const textColor = getTextColor(currentColor);

    const typeLabel = {
        fill: 'Fill',
        stroke: 'Stroke',
        solid: 'Solid',
    }[group.type];

    const layerCount = group.layers.length;
    const isGroupSelected = isBatchEditMode && selectedGroupId === group.id;

    return (
        <div className={`color-group ${group.isExpanded ? 'color-group--expanded' : ''}`}>
            {/* グループヘッダー */}
            <div
                className={`color-group__header ${isGroupSelected ? 'color-group__header--selected' : ''} ${groupHasChanges ? 'color-group__header--changed' : ''}`}
            >
                {/* 展開ボタン */}
                {layerCount > 1 && (
                    <button
                        className="color-group__expand-btn"
                        onClick={onToggleExpand}
                        aria-label={group.isExpanded ? '折りたたむ' : '展開する'}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ transform: group.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                        >
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                )}

                {/* 色プレビュー */}
                <div
                    className="color-group__preview"
                    style={{ backgroundColor: currentHex }}
                    onClick={() => {
                        if (layerCount === 1) {
                            onSelectLayerColor(group.layers[0].id);
                        } else {
                            onSelectGroupForBatchEdit();
                        }
                    }}
                >
                    {groupHasChanges && (
                        <div
                            className="color-group__original"
                            style={{ backgroundColor: originalHex }}
                            title={`元の色: ${originalHex}`}
                        />
                    )}
                    <span
                        className="color-group__type"
                        style={{ color: textColor }}
                    >
                        {typeLabel}
                    </span>
                </div>

                {/* 色情報 */}
                <div className="color-group__info">
                    <span className="color-group__hex">{currentHex.toUpperCase()}</span>
                    <span className="color-group__count">
                        {layerCount === 1 ? group.layers[0].layerName : `${layerCount}レイヤー`}
                    </span>
                </div>

                {/* アクションボタン */}
                <div className="color-group__actions">
                    {layerCount > 1 && (
                        <button
                            className={`color-group__batch-btn ${isGroupSelected ? 'color-group__batch-btn--active' : ''}`}
                            onClick={onSelectGroupForBatchEdit}
                            title="一括編集"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                        </button>
                    )}
                    {groupHasChanges && (
                        <button
                            className="color-group__reset-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onResetGroup();
                            }}
                            title="グループをリセット"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* 展開されたレイヤーリスト */}
            {group.isExpanded && layerCount > 1 && (
                <div className="color-group__layers">
                    {group.layers.map(layer => (
                        <LayerColorItem
                            key={layer.id}
                            layer={layer}
                            isSelected={selectedLayerColorId === layer.id}
                            onSelect={() => onSelectLayerColor(layer.id)}
                            onReset={() => onResetLayerColor(layer.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface LayerColorItemProps {
    layer: LayerColor;
    isSelected: boolean;
    onSelect: () => void;
    onReset: () => void;
}

function LayerColorItem({
    layer,
    isSelected,
    onSelect,
    onReset,
}: LayerColorItemProps) {
    const currentHex = lottieToHex(layer.current);
    const originalHex = lottieToHex(layer.original);
    const hasChanged = !colorsEqual(layer.original, layer.current);

    return (
        <div
            className={`layer-color ${isSelected ? 'layer-color--selected' : ''} ${hasChanged ? 'layer-color--changed' : ''}`}
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect()}
        >
            <div className="layer-color__connector" />

            <div
                className="layer-color__preview"
                style={{ backgroundColor: currentHex }}
            >
                {hasChanged && (
                    <div
                        className="layer-color__original"
                        style={{ backgroundColor: originalHex }}
                        title={`元の色: ${originalHex}`}
                    />
                )}
            </div>

            <span className="layer-color__name" title={layer.layerName}>
                {layer.layerName}
            </span>

            {hasChanged && (
                <button
                    className="layer-color__reset"
                    onClick={(e) => {
                        e.stopPropagation();
                        onReset();
                    }}
                    title="元の色に戻す"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                </button>
            )}
        </div>
    );
}
