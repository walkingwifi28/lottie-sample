import { useState, useCallback } from 'react';
import type { LottieJson } from '../types/lottieJson';

export interface LottieFileData {
    name: string;
    src: string;
    type: 'json' | 'lottie';
    /** Lottie JSONの生データ */
    rawJson: LottieJson | null;
}

interface UseLottieFileReturn {
    fileData: LottieFileData | null;
    error: string | null;
    isLoading: boolean;
    handleFile: (file: File) => Promise<void>;
    clearFile: () => void;
    /** 変更されたJSONでsrcを更新 */
    updateSrcFromJson: (json: LottieJson) => void;
}

/**
 * Lottie JSONファイルの簡易バリデーション
 * 必須キーの存在をチェック
 */
function isValidLottieJson(data: unknown): data is LottieJson {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    const lottie = data as Record<string, unknown>;

    // Lottie形式の必須キー
    const requiredKeys = ['v', 'fr', 'ip', 'op', 'layers'];
    return requiredKeys.every(key => key in lottie);
}

/**
 * ファイル拡張子のチェック
 */
function getFileType(fileName: string): 'json' | 'lottie' | null {
    const extension = fileName.toLowerCase().split('.').pop();
    if (extension === 'json') return 'json';
    if (extension === 'lottie') return 'lottie';
    return null;
}

/**
 * テキストをData URLに変換
 */
function textToDataUrl(text: string, mimeType: string): string {
    const base64 = btoa(unescape(encodeURIComponent(text)));
    return `data:${mimeType};base64,${base64}`;
}

/**
 * Lottieファイルの読み込みとバリデーションを行うカスタムフック
 */
export function useLottieFile(): UseLottieFileReturn {
    const [fileData, setFileData] = useState<LottieFileData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFile = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);

        try {
            // ファイル拡張子チェック
            const fileType = getFileType(file.name);
            if (!fileType) {
                throw new Error('対応していないファイル形式です。.json または .lottie ファイルを選択してください。');
            }

            let rawJson: LottieJson | null = null;
            let src: string;

            if (fileType === 'json') {
                // JSONファイルの場合：テキストを1回だけ読み込み
                const text = await file.text();

                try {
                    rawJson = JSON.parse(text) as LottieJson;
                } catch {
                    throw new Error('JSONファイルの解析に失敗しました。');
                }

                if (!isValidLottieJson(rawJson)) {
                    throw new Error('このJSONファイルはLottie形式ではありません。');
                }

                // パース済みのテキストからData URLを生成（2回目のファイル読み込みを回避）
                src = textToDataUrl(text, 'application/json');
            } else {
                // .lottieファイルの場合はバイナリとして読み込み
                const reader = new FileReader();
                src = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました。'));
                    reader.readAsDataURL(file);
                });
            }

            setFileData({
                name: file.name,
                src,
                type: fileType,
                rawJson,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : '不明なエラーが発生しました。');
            setFileData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearFile = useCallback(() => {
        setFileData(null);
        setError(null);
    }, []);

    /**
     * 変更されたJSONでsrcを更新（カラー変更時に使用）
     */
    const updateSrcFromJson = useCallback((json: LottieJson) => {
        if (!fileData) return;

        // JSONをData URLに変換
        const jsonString = JSON.stringify(json);
        const base64 = btoa(unescape(encodeURIComponent(jsonString)));
        const newSrc = `data:application/json;base64,${base64}`;

        setFileData(prev => prev ? {
            ...prev,
            src: newSrc,
            // rawJson NOT updated to preserve original file content and prevent re-extraction loop
        } : null);
    }, [fileData]);

    return {
        fileData,
        error,
        isLoading,
        handleFile,
        clearFile,
        updateSrcFromJson,
    };
}
