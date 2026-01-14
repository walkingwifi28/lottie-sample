/**
 * Lottie カラー関連の型定義
 */

/**
 * Lottie JSONから抽出された色情報
 */
/**
 * 色の適用先情報
 */
export interface TargetLocation {
    path: (string | number)[];
    layerName?: string;
    shapeName?: string;
}

/**
 * Lottie JSONから抽出された色情報
 */
export interface LottieColor {
    /** ユニークID */
    id: string;
    /** 色の適用先リスト */
    targets: TargetLocation[];
    /** 元の色 [r, g, b] or [r, g, b, a] (0-1形式) */
    original: number[];
    /** 現在の色 */
    current: number[];
    /** 色のタイプ */
    type: 'fill' | 'stroke' | 'solid';
}

/**
 * 色のマッピング情報（元の色→新しい色）
 */
export interface ColorMapping {
    /** 元の色を文字列化したキー */
    originalKey: string;
    /** 新しい色 */
    newColor: number[];
}

/**
 * RGB形式の色 (0-255)
 */
export interface RGBColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}

/**
 * HSL形式の色
 */
export interface HSLColor {
    h: number; // 0-360
    s: number; // 0-100
    l: number; // 0-100
    a?: number; // 0-1
}

/**
 * Lottie形式の色 (0-1)
 */
export type LottieColorArray = [number, number, number] | [number, number, number, number];
