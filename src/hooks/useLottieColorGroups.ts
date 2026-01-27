/**
 * レイヤー単位のLottie色管理用カスタムフック
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ColorGroup, LayerColor } from '../types/lottieColor';
import type { LottieJson } from '../types/lottieJson';
import { extractColorGroupsFromLottie, applyColorsToLottie } from '../utils/lottieColorExtractor';

interface UseLottieColorGroupsProps {
    lottieJson: LottieJson | null;
}

interface UseLottieColorGroupsReturn {
    /** 抽出された色グループのリスト */
    colorGroups: ColorGroup[];
    /** 選択中のレイヤー色ID（個別編集用） */
    selectedLayerColorId: string | null;
    /** 選択中のグループID（一括編集用） */
    selectedGroupId: string | null;
    /** 一括編集モードかどうか */
    isBatchEditMode: boolean;
    /** レイヤー色を選択（個別編集） */
    selectLayerColor: (id: string | null) => void;
    /** グループを選択（一括編集） */
    selectGroupForBatchEdit: (groupId: string) => void;
    /** グループの展開/折りたたみを切り替え */
    toggleGroupExpanded: (groupId: string) => void;
    /** レイヤー色を更新（個別） */
    updateLayerColor: (layerColorId: string, newColor: number[]) => void;
    /** グループの全レイヤーを一括更新 */
    updateGroupColor: (groupId: string, newColor: number[]) => void;
    /** 特定のレイヤー色をリセット */
    resetLayerColor: (layerColorId: string) => void;
    /** グループの全レイヤーを一括リセット */
    resetGroupColor: (groupId: string) => void;
    /** 全ての色をリセット */
    resetAllColors: () => void;
    /** 変更を適用したJSONを取得 */
    getModifiedJson: () => LottieJson | null;
    /** 変更があるかどうか */
    hasChanges: boolean;
    /** 現在選択中のレイヤー色（スライダー用） */
    selectedLayerColor: LayerColor | null;
    /** 合計色数 */
    totalColorCount: number;
}

/**
 * 2つの色配列が等しいかを判定（許容誤差付き）
 */
function areColorsEqual(color1: number[], color2: number[], tolerance = 0.001): boolean {
    return color1.every((v, i) => Math.abs(v - color2[i]) < tolerance);
}

export function useLottieColorGroups({ lottieJson }: UseLottieColorGroupsProps): UseLottieColorGroupsReturn {
    const [colorGroups, setColorGroups] = useState<ColorGroup[]>([]);
    const [selectedLayerColorId, setSelectedLayerColorId] = useState<string | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isBatchEditMode, setIsBatchEditMode] = useState(false);
    const [originalJson, setOriginalJson] = useState<LottieJson | null>(null);

    // JSONが変更されたら色を抽出
    useEffect(() => {
        if (lottieJson) {
            const extractedGroups = extractColorGroupsFromLottie(lottieJson);
            setColorGroups(extractedGroups);
            setOriginalJson(lottieJson);
            // 最初のグループの最初のレイヤー色を選択
            if (extractedGroups.length > 0 && extractedGroups[0].layers.length > 0) {
                setSelectedLayerColorId(extractedGroups[0].layers[0].id);
                setSelectedGroupId(null);
                setIsBatchEditMode(false);
            }
        } else {
            setColorGroups([]);
            setOriginalJson(null);
            setSelectedLayerColorId(null);
            setSelectedGroupId(null);
            setIsBatchEditMode(false);
        }
    }, [lottieJson]);

    // 合計色数を計算
    const totalColorCount = useMemo(() =>
        colorGroups.reduce((sum, group) => sum + group.layers.length, 0),
        [colorGroups]
    );

    // レイヤー色を選択（個別編集）
    const selectLayerColor = useCallback((id: string | null) => {
        setSelectedLayerColorId(id);
        setSelectedGroupId(null);
        setIsBatchEditMode(false);
    }, []);

    // グループを選択（一括編集）
    const selectGroupForBatchEdit = useCallback((groupId: string) => {
        setSelectedGroupId(groupId);
        setSelectedLayerColorId(null);
        setIsBatchEditMode(true);
    }, []);

    // グループの展開/折りたたみを切り替え
    const toggleGroupExpanded = useCallback((groupId: string) => {
        setColorGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId
                    ? { ...group, isExpanded: !group.isExpanded }
                    : group
            )
        );
    }, []);

    // レイヤー色を更新（個別）
    const updateLayerColor = useCallback((layerColorId: string, newColor: number[]) => {
        setColorGroups(prevGroups =>
            prevGroups.map(group => ({
                ...group,
                layers: group.layers.map(layer =>
                    layer.id === layerColorId
                        ? { ...layer, current: [...newColor] }
                        : layer
                ),
            }))
        );
    }, []);

    // グループの全レイヤーを一括更新
    const updateGroupColor = useCallback((groupId: string, newColor: number[]) => {
        setColorGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId
                    ? {
                        ...group,
                        layers: group.layers.map(layer => ({
                            ...layer,
                            current: [...newColor],
                        })),
                    }
                    : group
            )
        );
    }, []);

    // 特定のレイヤー色をリセット
    const resetLayerColor = useCallback((layerColorId: string) => {
        setColorGroups(prevGroups =>
            prevGroups.map(group => ({
                ...group,
                layers: group.layers.map(layer =>
                    layer.id === layerColorId
                        ? { ...layer, current: [...layer.original] }
                        : layer
                ),
            }))
        );
    }, []);

    // グループの全レイヤーを一括リセット
    const resetGroupColor = useCallback((groupId: string) => {
        setColorGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId
                    ? {
                        ...group,
                        layers: group.layers.map(layer => ({
                            ...layer,
                            current: [...layer.original],
                        })),
                    }
                    : group
            )
        );
    }, []);

    // 全ての色をリセット
    const resetAllColors = useCallback(() => {
        setColorGroups(prevGroups =>
            prevGroups.map(group => ({
                ...group,
                layers: group.layers.map(layer => ({
                    ...layer,
                    current: [...layer.original],
                })),
            }))
        );
    }, []);

    // 変更されたレイヤー色のリスト
    const changedLayerColors = useMemo(() => {
        const changed: LayerColor[] = [];
        colorGroups.forEach(group => {
            group.layers.forEach(layer => {
                if (!areColorsEqual(layer.original, layer.current)) {
                    changed.push(layer);
                }
            });
        });
        return changed;
    }, [colorGroups]);

    // 変更があるかどうか
    const hasChanges = changedLayerColors.length > 0;

    // 現在選択中のレイヤー色
    const selectedLayerColor = useMemo(() => {
        if (isBatchEditMode && selectedGroupId) {
            // 一括編集モードの場合、グループの最初のレイヤー色を返す
            const group = colorGroups.find(g => g.id === selectedGroupId);
            return group?.layers[0] ?? null;
        }
        if (selectedLayerColorId) {
            for (const group of colorGroups) {
                const layer = group.layers.find(l => l.id === selectedLayerColorId);
                if (layer) return layer;
            }
        }
        return null;
    }, [colorGroups, selectedLayerColorId, selectedGroupId, isBatchEditMode]);

    // 変更を適用したJSONを取得
    const getModifiedJson = useCallback((): LottieJson | null => {
        if (!originalJson) return null;

        if (changedLayerColors.length === 0) {
            return originalJson;
        }

        const changes = changedLayerColors.map(layer => ({
            targets: layer.targets,
            newColor: layer.current,
        }));

        return applyColorsToLottie(originalJson, changes);
    }, [originalJson, changedLayerColors]);

    return {
        colorGroups,
        selectedLayerColorId,
        selectedGroupId,
        isBatchEditMode,
        selectLayerColor,
        selectGroupForBatchEdit,
        toggleGroupExpanded,
        updateLayerColor,
        updateGroupColor,
        resetLayerColor,
        resetGroupColor,
        resetAllColors,
        getModifiedJson,
        hasChanges,
        selectedLayerColor,
        totalColorCount,
    };
}
