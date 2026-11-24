export type Layout = {
  vertical: boolean;
  avatarW: number;
  avatarLeft: number;
  content: {left: number; top: number; width: number; height: number};
  subs: {left: number; width: number; bottom: number; font: number};
  sigTop: number;
  sigLeft: number;
  dots: {top: number; right: number; size: number; gap: number};
  /** Escala tipográfica del contenido */
  k: number;
};

/** Adapta la composición horizontal (16:9) o vertical (9:16) según el tamaño del video. */
export function getLayout(width: number, height: number): Layout {
  const vertical = height > width;
  if (!vertical) {
    const avatarW = Math.round(width * 0.27);
    return {
      vertical,
      avatarW,
      avatarLeft: 0,
      content: {left: 760, top: 180, width: 1090, height: 650},
      subs: {left: avatarW + 50, width: width - avatarW - 50 - 70, bottom: 44, font: 38},
      sigTop: 50,
      sigLeft: 64,
      dots: {top: 60, right: 64, size: 58, gap: 12},
      k: 1,
    };
  }
  const avatarW = 560;
  return {
    vertical,
    avatarW,
    avatarLeft: (width - avatarW) / 2 - 20,
    content: {left: 70, top: 215, width: 940, height: 725},
    subs: {left: 50, width: width - 100, bottom: 725, font: 34},
    sigTop: 56,
    sigLeft: 56,
    dots: {top: 70, right: 46, size: 50, gap: 8},
    k: 0.92,
  };
}
