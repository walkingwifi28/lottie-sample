/**
 * Lottie JSONから静的カラーを抽出するユーティリティ
 */

import type { LottieColor, TargetLocation, ColorGroup, LayerColor } from '../types/lottieColor';
import { colorToKey } from './colorConverter';

// Lottie JSONは深くネストした構造を持ち、動的にプロパティにアクセスする必要があるため
// このファイル内ではany型を使用する（公開APIの型はlottieJson.tsで定義）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LottieJson = any;

/**
 * 抽出段階での中間形式
 */
interface ExtractedColor {
    path: (string | number)[];
    color: number[];
    type: 'fill' | 'stroke' | 'solid';
    layerName: string;
    shapeName?: string;
}

/**
 * ユニークIDを生成
 */
function generateId(): string {
    return `color_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 色配列かどうかを判定
 * Lottie色は [r, g, b] または [r, g, b, a] 形式 (0-1)
 */
function isColorArray(arr: unknown): arr is number[] {
    if (!Array.isArray(arr)) return false;
    if (arr.length < 3 || arr.length > 4) return false;
    return arr.every(v => typeof v === 'number' && v >= 0 && v <= 1);
}

/**
 * 静的カラーかどうかを判定 (a === 0 は静的)
 */
function isStaticColor(colorProperty: unknown): colorProperty is { a: number; k: number[] } {
    if (typeof colorProperty !== 'object' || colorProperty === null) return false;
    const cp = colorProperty as { a?: number; k?: unknown };

    // a が 0 の場合は静的カラー
    if (cp.a !== 0) return false;

    // k が色配列であること
    return isColorArray(cp.k);
}

/**
 * shapes配列から色を抽出
 */
function extractColorsFromShapes(
    shapes: LottieJson[],
    path: (string | number)[],
    layerName: string,
    colors: ExtractedColor[]
): void {
    if (!Array.isArray(shapes)) return;

    shapes.forEach((shape, shapeIndex) => {
        if (!shape || typeof shape !== 'object') return;

        const currentPath = [...path, shapeIndex];
        const shapeName = shape.nm || `Shape ${shapeIndex}`;

        // グループ (ty: "gr") の場合は再帰的に処理
        if (shape.ty === 'gr' && Array.isArray(shape.it)) {
            extractColorsFromShapes(shape.it, [...currentPath, 'it'], layerName, colors);
            return;
        }

        // Fill (ty: "fl")
        if (shape.ty === 'fl' && shape.c) {
            if (isStaticColor(shape.c)) {
                colors.push({
                    path: [...currentPath, 'c', 'k'],
                    color: [...shape.c.k],
                    type: 'fill',
                    layerName,
                    shapeName,
                });
            }
        }

        // Stroke (ty: "st")
        if (shape.ty === 'st' && shape.c) {
            if (isStaticColor(shape.c)) {
                colors.push({
                    path: [...currentPath, 'c', 'k'],
                    color: [...shape.c.k],
                    type: 'stroke',
                    layerName,
                    shapeName,
                });
            }
        }

        // Gradient Fill (ty: "gf") - 簡易対応：グラデーションの色も抽出
        if (shape.ty === 'gf' && shape.g?.k?.k) {
            // グラデーションは複雑なので、現時点ではスキップ
            // 将来的に対応する場合はここに実装
        }

        // Gradient Stroke (ty: "gs") - 同様にスキップ
    });
}

/**
 * レイヤーから色を抽出
 */
function extractColorsFromLayer(
    layer: LottieJson,
    layerIndex: number,
    colors: ExtractedColor[]
): void {
    if (!layer || typeof layer !== 'object') return;

    const layerName = layer.nm || `Layer ${layerIndex}`;
    const layerPath: (string | number)[] = ['layers', layerIndex];

    // Solid Layer (ty: 1) の場合
    if (layer.ty === 1 && typeof layer.sc === 'string') {
        // sc は HEX文字列 (例: "#BF2525")
        // これを Lottie色に変換して追加
        const hexMatch = layer.sc.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (hexMatch) {
            const r = parseInt(hexMatch[1], 16) / 255;
            const g = parseInt(hexMatch[2], 16) / 255;
            const b = parseInt(hexMatch[3], 16) / 255;
            colors.push({
                path: [...layerPath, 'sc'],
                color: [r, g, b, 1],
                type: 'solid',
                layerName,
            });
        }
    }

    // Shape Layer (ty: 4) の場合
    if (layer.ty === 4 && Array.isArray(layer.shapes)) {
        extractColorsFromShapes(layer.shapes, [...layerPath, 'shapes'], layerName, colors);
    }

    // Precomp Layer (ty: 0) の場合、assets内の該当precompを処理する必要がある
    // これは extractColorsFromLottie で処理
}

/**
 * 色をグループ化してLottieColorのリストに変換
 */
function groupColors(extractedColors: ExtractedColor[]): LottieColor[] {
    const groups: { [key: string]: LottieColor } = {};

    extractedColors.forEach(extracted => {
        // 色の値とタイプでユニークキーを作成
        // 許容誤差を考慮してcolorToKeyを使用
        const colorKey = `${extracted.type}_${colorToKey(extracted.color)}`;

        if (!groups[colorKey]) {
            groups[colorKey] = {
                id: generateId(),
                targets: [],
                original: [...extracted.color],
                current: [...extracted.color],
                type: extracted.type,
            };
        }

        groups[colorKey].targets.push({
            path: extracted.path,
            layerName: extracted.layerName,
            shapeName: extracted.shapeName,
        });
    });

    return Object.values(groups);
}

/**
 * Lottie JSONから全ての静的カラーを抽出して集約
 */
export function extractColorsFromLottie(lottieJson: LottieJson): LottieColor[] {
    const rawColors: ExtractedColor[] = [];

    if (!lottieJson || typeof lottieJson !== 'object') {
        return [];
    }

    // メインレイヤーから抽出
    if (Array.isArray(lottieJson.layers)) {
        lottieJson.layers.forEach((layer: LottieJson, index: number) => {
            extractColorsFromLayer(layer, index, rawColors);
        });
    }

    // Assets内のprecompsも処理
    if (Array.isArray(lottieJson.assets)) {
        lottieJson.assets.forEach((asset: LottieJson, assetIndex: number) => {
            if (Array.isArray(asset.layers)) {
                asset.layers.forEach((layer: LottieJson, layerIndex: number) => {
                    const assetColors: ExtractedColor[] = [];
                    extractColorsFromLayer(layer, layerIndex, assetColors);

                    // パスをassets配下に修正
                    assetColors.forEach(color => {
                        color.path = ['assets', assetIndex, ...color.path];
                        rawColors.push(color);
                    });
                });
            }
        });
    }

    return groupColors(rawColors);
}

/**
 * Lottie JSONの指定パスに新しい色を適用
 */
export function applyColorToLottie(
    lottieJson: LottieJson,
    path: (string | number)[],
    newColor: number[]
): LottieJson {
    // deep clone
    // 注意: ここで都度全コピーすると遅いので、applyColorsToLottie側で制御するほうが良いが、
    // 単体利用のために残しておく
    const cloned = JSON.parse(JSON.stringify(lottieJson));
    return applyColorToLottieMutable(cloned, path, newColor);
}

/**
 * 可変オブジェクトに対して色を適用（内部用）
 */
function applyColorToLottieMutable(
    lottieJson: LottieJson,
    path: (string | number)[],
    newColor: number[]
): LottieJson {
    let current = lottieJson;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
        if (current === undefined) {
            console.warn(`Path not found: ${path.slice(0, i + 1).join('.')}`);
            return lottieJson;
        }
    }

    const lastKey = path[path.length - 1];

    // Solid Layer の場合は HEX に変換
    if (lastKey === 'sc') {
        const r = Math.round(newColor[0] * 255).toString(16).padStart(2, '0');
        const g = Math.round(newColor[1] * 255).toString(16).padStart(2, '0');
        const b = Math.round(newColor[2] * 255).toString(16).padStart(2, '0');
        current[lastKey] = `#${r}${g}${b}`;
    } else {
        current[lastKey] = newColor;
    }

    return lottieJson;
}

/**
 * 複数の色変更を一括適用
 */
export function applyColorsToLottie(
    lottieJson: LottieJson,
    colorChanges: { targets: TargetLocation[]; newColor: number[] }[]
): LottieJson {
    const result = JSON.parse(JSON.stringify(lottieJson));

    for (const change of colorChanges) {
        for (const target of change.targets) {
            applyColorToLottieMutable(result, target.path, change.newColor);
        }
    }

    return result;
}

/**
 * レイヤー単位でグループ化された色を抽出
 * 同じ色・タイプをColorGroupにまとめ、各レイヤーはLayerColorとして保持
 */
export function extractColorGroupsFromLottie(lottieJson: LottieJson): ColorGroup[] {
    const rawColors: ExtractedColor[] = [];

    if (!lottieJson || typeof lottieJson !== 'object') {
        return [];
    }

    // メインレイヤーから抽出
    if (Array.isArray(lottieJson.layers)) {
        lottieJson.layers.forEach((layer: LottieJson, index: number) => {
            extractColorsFromLayer(layer, index, rawColors);
        });
    }

    // Assets内のprecompsも処理
    if (Array.isArray(lottieJson.assets)) {
        lottieJson.assets.forEach((asset: LottieJson, assetIndex: number) => {
            if (Array.isArray(asset.layers)) {
                asset.layers.forEach((layer: LottieJson, layerIndex: number) => {
                    const assetColors: ExtractedColor[] = [];
                    extractColorsFromLayer(layer, layerIndex, assetColors);

                    // パスをassets配下に修正
                    assetColors.forEach(color => {
                        color.path = ['assets', assetIndex, ...color.path];
                        rawColors.push(color);
                    });
                });
            }
        });
    }

    return groupColorsByLayer(rawColors);
}

/**
 * 色をレイヤー単位でまとめ、さらに同じ色でグループ化
 */
function groupColorsByLayer(extractedColors: ExtractedColor[]): ColorGroup[] {
    // まず、色とタイプでグループ化
    const colorTypeGroups: { [key: string]: ExtractedColor[] } = {};

    extractedColors.forEach(extracted => {
        const colorKey = `${extracted.type}_${colorToKey(extracted.color)}`;
        if (!colorTypeGroups[colorKey]) {
            colorTypeGroups[colorKey] = [];
        }
        colorTypeGroups[colorKey].push(extracted);
    });

    // 各色グループ内でレイヤー単位にまとめる
    const colorGroups: ColorGroup[] = [];

    Object.entries(colorTypeGroups).forEach(([, colors]) => {
        if (colors.length === 0) return;

        const groupId = generateId();
        const firstColor = colors[0];

        // レイヤー名でグループ化
        const layerGroups: { [layerName: string]: ExtractedColor[] } = {};
        colors.forEach(color => {
            if (!layerGroups[color.layerName]) {
                layerGroups[color.layerName] = [];
            }
            layerGroups[color.layerName].push(color);
        });

        // 各レイヤーのLayerColorを作成
        const layers: LayerColor[] = Object.entries(layerGroups).map(([layerName, layerColors]) => ({
            id: generateId(),
            layerName,
            targets: layerColors.map(c => ({
                path: c.path,
                layerName: c.layerName,
                shapeName: c.shapeName,
            })),
            original: [...layerColors[0].color],
            current: [...layerColors[0].color],
            type: layerColors[0].type,
            groupId,
        }));

        colorGroups.push({
            id: groupId,
            originalColor: [...firstColor.color],
            type: firstColor.type,
            layers,
            isExpanded: false,
        });
    });

    return colorGroups;
}

