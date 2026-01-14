/**
 * Lottie JSON の型定義
 * any型の使用を減らし、型安全性を向上
 */

/**
 * Lottie JSON のベース型
 * 完全な型定義は非常に複雑なため、主要なプロパティのみ定義
 */
export interface LottieJson {
    /** Lottie version */
    v: string;
    /** Frame rate */
    fr: number;
    /** In point (start frame) */
    ip: number;
    /** Out point (end frame) */
    op: number;
    /** Width */
    w: number;
    /** Height */
    h: number;
    /** Name */
    nm?: string;
    /** Layers */
    layers: LottieLayer[];
    /** Assets (precomps, images, etc.) */
    assets?: LottieAsset[];
    /** Markers */
    markers?: unknown[];
}

/**
 * レイヤーの基本型
 */
export interface LottieLayer {
    /** Layer type: 0=precomp, 1=solid, 2=image, 3=null, 4=shape, 5=text */
    ty: number;
    /** Layer name */
    nm?: string;
    /** Shapes (for shape layers) */
    shapes?: LottieShape[];
    /** Solid color (for solid layers, hex string) */
    sc?: string;
    /** Reference ID (for precomp/image layers) */
    refId?: string;
    /** In point */
    ip: number;
    /** Out point */
    op: number;
    /** Start time */
    st: number;
    /** その他のプロパティ */
    [key: string]: unknown;
}

/**
 * シェイプの基本型
 */
export interface LottieShape {
    /** Shape type: fl=fill, st=stroke, gr=group, etc. */
    ty: string;
    /** Shape name */
    nm?: string;
    /** Color property (for fill/stroke) */
    c?: LottieColorProperty;
    /** Items (for groups) */
    it?: LottieShape[];
    /** その他のプロパティ */
    [key: string]: unknown;
}

/**
 * カラープロパティ
 */
export interface LottieColorProperty {
    /** Animation flag: 0=static, 1=animated */
    a: number;
    /** Value: static color array or keyframes */
    k: number[] | unknown[];
}

/**
 * アセットの基本型
 */
export interface LottieAsset {
    /** Asset ID */
    id: string;
    /** Layers (for precomps) */
    layers?: LottieLayer[];
    /** Width (for images) */
    w?: number;
    /** Height (for images) */
    h?: number;
    /** Path (for images) */
    p?: string;
    /** その他のプロパティ */
    [key: string]: unknown;
}
