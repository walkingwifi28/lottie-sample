/**
 * 色変換ユーティリティ
 * Lottie色 (0-1) ↔ RGB (0-255) ↔ HSL ↔ HEX 変換
 */

import type { RGBColor, HSLColor, LottieColorArray } from '../types/lottieColor';

/**
 * Lottie色配列 (0-1) を RGB (0-255) に変換
 */
export function lottieToRgb(lottieColor: number[]): RGBColor {
    return {
        r: Math.round(lottieColor[0] * 255),
        g: Math.round(lottieColor[1] * 255),
        b: Math.round(lottieColor[2] * 255),
        a: lottieColor[3] ?? 1,
    };
}

/**
 * RGB (0-255) を Lottie色配列 (0-1) に変換
 */
export function rgbToLottie(rgb: RGBColor): LottieColorArray {
    const result: LottieColorArray = [
        rgb.r / 255,
        rgb.g / 255,
        rgb.b / 255,
    ];
    if (rgb.a !== undefined) {
        return [...result, rgb.a] as LottieColorArray;
    }
    return result;
}

/**
 * RGB を HEX文字列に変換
 */
export function rgbToHex(rgb: RGBColor): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * HEX文字列 を RGB に変換
 */
export function hexToRgb(hex: string): RGBColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error(`Invalid hex color: ${hex}`);
    }
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
}

/**
 * Lottie色配列 を HEX文字列に変換
 */
export function lottieToHex(lottieColor: number[]): string {
    return rgbToHex(lottieToRgb(lottieColor));
}

/**
 * HEX文字列 を Lottie色配列に変換
 */
export function hexToLottie(hex: string): LottieColorArray {
    return rgbToLottie(hexToRgb(hex));
}

/**
 * RGB を HSL に変換
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
        a: rgb.a,
    };
}

/**
 * HSL を RGB に変換
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a: hsl.a,
    };
}

/**
 * Lottie色配列 を HSL に変換
 */
export function lottieToHsl(lottieColor: number[]): HSLColor {
    return rgbToHsl(lottieToRgb(lottieColor));
}

/**
 * HSL を Lottie色配列に変換
 */
export function hslToLottie(hsl: HSLColor): LottieColorArray {
    return rgbToLottie(hslToRgb(hsl));
}

/**
 * 2つの色が同じかどうかを比較（許容誤差付き）
 */
export function colorsEqual(color1: number[], color2: number[], tolerance = 0.001): boolean {
    if (color1.length !== color2.length) return false;
    return color1.every((v, i) => Math.abs(v - color2[i]) < tolerance);
}

/**
 * 色を文字列キーに変換（マッピング用）
 */
export function colorToKey(color: number[]): string {
    return color.map(v => v.toFixed(3)).join(',');
}

/**
 * 色のコントラスト比を計算（テキスト色決定用）
 */
export function getContrastRatio(rgb: RGBColor): number {
    // 相対輝度を計算
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance;
}

/**
 * 背景色に対する適切なテキスト色を返す
 */
export function getTextColor(backgroundColor: number[]): string {
    const rgb = lottieToRgb(backgroundColor);
    const luminance = getContrastRatio(rgb);
    return luminance > 0.5 ? '#000000' : '#ffffff';
}
