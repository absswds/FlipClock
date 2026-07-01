export interface ClockTheme {
  id: string;
  displayName: string;
  displayNameEn: string;
  displayNameJa: string;
  background: string;
  cardTop: string;
  cardBottom: string;
  cardEdge: string;
  cardEdgeShadow: string;
  digit: string;
  hinge: string;
  hingeShadow: string;
  bevel: string;
  topHighlight: string;
  date: string;
  signature: string;
  accent: string;
}

export const ClassicBlack: ClockTheme = {
  id: 'classic_black',
  displayName: '经典黑',
  displayNameEn: 'Classic Black',
  displayNameJa: 'クラシックブラック',
  background: '#000000',
  cardTop: '#3F3F3F',
  cardBottom: '#3F3F3F',
  cardEdge: '#3F3F3F',
  cardEdgeShadow: 'transparent',
  digit: '#FFFFFF',
  hinge: '#080809',
  hingeShadow: 'transparent',
  bevel: 'transparent',
  topHighlight: 'transparent',
  date: '#C4C4CA',
  signature: '#A6A6AC',
  accent: '#FFFFFF',
};

export const PureBlack: ClockTheme = {
  id: 'pure_black',
  displayName: '纯黑夜间',
  displayNameEn: 'Pure Black',
  displayNameJa: 'ピュアブラック',
  background: '#000000',
  cardTop: '#151517',
  cardBottom: '#070708',
  cardEdge: '#25252A',
  cardEdgeShadow: 'rgba(0,0,0,0.53)',
  digit: '#DADAE0',
  hinge: '#000000',
  hingeShadow: 'rgba(0,0,0,0.67)',
  bevel: 'rgba(255,255,255,0.094)',
  topHighlight: 'rgba(255,255,255,0.07)',
  date: '#76767D',
  signature: '#5A5A60',
  accent: '#DADAE0',
};

export const RetroGreen: ClockTheme = {
  id: 'retro_green',
  displayName: '复古绿',
  displayNameEn: 'Retro Green',
  displayNameJa: 'レトログリーン',
  background: '#05140C',
  cardTop: '#123322',
  cardBottom: '#0A2016',
  cardEdge: '#205A3C',
  cardEdgeShadow: 'rgba(0,0,0,0.47)',
  digit: '#7CFFB0',
  hinge: '#03100A',
  hingeShadow: 'rgba(0,0,0,0.6)',
  bevel: 'rgba(41,255,143,0.2)',
  topHighlight: 'rgba(41,255,143,0.086)',
  date: '#4F9E76',
  signature: '#3C7259',
  accent: '#7CFFB0',
};

export const WarmAmber: ClockTheme = {
  id: 'warm_amber',
  displayName: '暖琥珀',
  displayNameEn: 'Warm Amber',
  displayNameJa: 'ウォームアンバー',
  background: '#120B04',
  cardTop: '#332113',
  cardBottom: '#1F140A',
  cardEdge: '#4B3120',
  cardEdgeShadow: 'rgba(0,0,0,0.47)',
  digit: '#FFD9A0',
  hinge: '#0E0803',
  hingeShadow: 'rgba(0,0,0,0.6)',
  bevel: 'rgba(255,199,115,0.2)',
  topHighlight: 'rgba(255,199,115,0.086)',
  date: '#B08855',
  signature: '#836643',
  accent: '#FFD9A0',
};

export const Slate: ClockTheme = {
  id: 'slate',
  displayName: '石板灰',
  displayNameEn: 'Slate',
  displayNameJa: 'スレート',
  background: '#0C0F14',
  cardTop: '#2A313C',
  cardBottom: '#1A1F27',
  cardEdge: '#3B4554',
  cardEdgeShadow: 'rgba(0,0,0,0.47)',
  digit: '#E6ECF5',
  hinge: '#080A0E',
  hingeShadow: 'rgba(0,0,0,0.6)',
  bevel: 'rgba(220,230,255,0.13)',
  topHighlight: 'rgba(220,230,255,0.07)',
  date: '#8893A4',
  signature: '#626C7A',
  accent: '#E6ECF5',
};

export const allThemes: ClockTheme[] = [
  ClassicBlack,
  PureBlack,
  RetroGreen,
  WarmAmber,
  Slate,
];

export function byId(id: string): ClockTheme {
  return allThemes.find((t) => t.id === id) ?? ClassicBlack;
}
