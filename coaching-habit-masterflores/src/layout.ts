export type Layout = {
  vertical: boolean;
  avatarW: number;
  avatarLeft: number;
  content: {left: number; top: number; width: number; height: number};
  subs: {left: number; width: number; bottom: number; font: number};
  sigTop: number;
  sigLeft: number;
  dots: {top: number; right: number; size: number; gap: number};
  titleScale: number;
};

export function getLayout(width: number, height: number): Layout {
  const vertical = height > width;
  if (!vertical) {
    const avatarW = Math.round(width * 0.27);
    return {
      vertical,
      avatarW,
      avatarLeft: 0,
      content: {left: 760, top: 200, width: 1080, height: 560},
      subs: {left: avatarW + 50, width: width - avatarW - 50 - 70, bottom: 44, font: 40},
      sigTop: 50,
      sigLeft: 64,
      dots: {top: 60, right: 64, size: 58, gap: 12},
      titleScale: 1,
    };
  }
  const avatarW = 580;
  return {
    vertical,
    avatarW,
    avatarLeft: (width - avatarW) / 2 - 20,
    content: {left: 70, top: 290, width: 940, height: 640},
    subs: {left: 60, width: width - 120, bottom: 770, font: 38},
    sigTop: 56,
    sigLeft: 56,
    dots: {top: 70, right: 46, size: 50, gap: 8},
    titleScale: 0.82,
  };
}
