/**
 * Lottie色管理用カスタムフック
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { LottieColor } from '../types/lottieColor';
import type { LottieJson } from '../types/lottieJson';
import { extractColorsFromLottie, applyColorsToLottie } from '../utils/lottieColorExtractor';

interface UseLottieColorsProps {
    lottieJson: LottieJson | null;
}

interface UseLottieColorsReturn {
    /** 抽出された色のリスト */
    colors: LottieColor[];
    /** 選択中の色ID */
    selectedColorId: string | null;
    /** 色を選択 */
    selectColor: (id: string | null) => void;
    /** 色を更新 */
    updateColor: (id: string, newColor: number[]) => void;
    /** 特定の色をリセット */
    resetColor: (id: string) => void;
    /** 全ての色をリセット */
    resetAllColors: () => void;
    /** 変更を適用したJSONを取得 */
    getModifiedJson: () => LottieJson | null;
    /** 変更があるかどうか */
    hasChanges: boolean;
}

/**
 * 2つの色配列が等しいかを判定（許容誤差付き）
 */
function areColorsEqual(color1: number[], color2: number[], tolerance = 0.001): boolean {
    return color1.every((v, i) => Math.abs(v - color2[i]) < tolerance);
}

export function useLottieColors({ lottieJson }: UseLottieColorsProps): UseLottieColorsReturn {
    const [colors, setColors] = useState<LottieColor[]>([]);
    const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
    const [originalJson, setOriginalJson] = useState<LottieJson | null>(null);

    // JSONが変更されたら色を抽出
    useEffect(() => {
        if (lottieJson) {
            const extractedColors = extractColorsFromLottie(lottieJson);
            setColors(extractedColors);
            setOriginalJson(lottieJson);
            setSelectedColorId(extractedColors.length > 0 ? extractedColors[0].id : null);
        } else {
            setColors([]);
            setOriginalJson(null);
            setSelectedColorId(null);
        }
    }, [lottieJson]);

    // 色を選択
    const selectColor = useCallback((id: string | null) => {
        setSelectedColorId(id);
    }, []);

    // 色を更新
    const updateColor = useCallback((id: string, newColor: number[]) => {
        setColors(prevColors =>
            prevColors.map(color =>
                color.id === id
                    ? { ...color, current: [...newColor] }
                    : color
            )
        );
    }, []);

    // 特定の色をリセット
    const resetColor = useCallback((id: string) => {
        setColors(prevColors =>
            prevColors.map(color =>
                color.id === id
                    ? { ...color, current: [...color.original] }
                    : color
            )
        );
    }, []);

    // 全ての色をリセット
    const resetAllColors = useCallback(() => {
        setColors(prevColors =>
            prevColors.map(color => ({
                ...color,
                current: [...color.original],
            }))
        );
    }, []);

    // 変更された色のリストをキャッシュ（hasChangesとgetModifiedJsonで共有）
    const changedColors = useMemo(() =>
        colors.filter(color => !areColorsEqual(color.original, color.current)),
        [colors]
    );

    // 変更があるかどうか
    const hasChanges = changedColors.length > 0;

    // 変更を適用したJSONを取得
    const getModifiedJson = useCallback((): LottieJson | null => {
        if (!originalJson) return null;

        if (changedColors.length === 0) {
            return originalJson;
        }

        const changes = changedColors.map(color => ({
            targets: color.targets,
            newColor: color.current,
        }));

        return applyColorsToLottie(originalJson, changes);
    }, [originalJson, changedColors]);

    return {
        colors,
        selectedColorId,
        selectColor,
        updateColor,
        resetColor,
        resetAllColors,
        getModifiedJson,
        hasChanges,
    };
}

