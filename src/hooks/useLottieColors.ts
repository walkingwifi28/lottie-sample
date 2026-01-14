/**
 * Lottie色管理用カスタムフック
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { LottieColor } from '../types/lottieColor';
import { extractColorsFromLottie, applyColorsToLottie } from '../utils/lottieColorExtractor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LottieJson = any;

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

export function useLottieColors({ lottieJson }: UseLottieColorsProps): UseLottieColorsReturn {
    const [colors, setColors] = useState<LottieColor[]>([]);
    const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
    const [originalJson, setOriginalJson] = useState<LottieJson | null>(null);

    // JSONが変更されたら色を抽出
    // Note: useMemo was used incorrectly for side effects. Switched to useEffect.
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

    // 変更を適用したJSONを取得
    const getModifiedJson = useCallback((): LottieJson | null => {
        if (!originalJson) return null;

        const changes = colors
            .filter(color => {
                // 変更があるもののみ
                return !color.original.every((v, i) => Math.abs(v - color.current[i]) < 0.001);
            })
            .map(color => ({
                targets: color.targets,
                newColor: color.current,
            }));

        if (changes.length === 0) {
            return originalJson;
        }

        return applyColorsToLottie(originalJson, changes);
    }, [originalJson, colors]);

    // 変更があるかどうか
    const hasChanges = useMemo(() => {
        return colors.some(color =>
            !color.original.every((v, i) => Math.abs(v - color.current[i]) < 0.001)
        );
    }, [colors]);

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
