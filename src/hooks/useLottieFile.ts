import { useState, useCallback } from 'react';

export interface LottieFileData {
    name: string;
    src: string;
    type: 'json' | 'lottie';
}

interface UseLottieFileReturn {
    fileData: LottieFileData | null;
    error: string | null;
    isLoading: boolean;
    handleFile: (file: File) => Promise<void>;
    clearFile: () => void;
}

/**
 * Lottie JSONファイルの簡易バリデーション
 * 必須キーの存在をチェック
 */
function isValidLottieJson(data: unknown): boolean {
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

            // .jsonの場合はLottie形式かチェック
            if (fileType === 'json') {
                const text = await file.text();
                let jsonData: unknown;

                try {
                    jsonData = JSON.parse(text);
                } catch {
                    throw new Error('JSONファイルの解析に失敗しました。');
                }

                if (!isValidLottieJson(jsonData)) {
                    throw new Error('このJSONファイルはLottie形式ではありません。');
                }
            }

            // Data URL生成
            const reader = new FileReader();
            const src = await new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました。'));
                reader.readAsDataURL(file);
            });

            setFileData({
                name: file.name,
                src,
                type: fileType,
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

    return {
        fileData,
        error,
        isLoading,
        handleFile,
        clearFile,
    };
}
