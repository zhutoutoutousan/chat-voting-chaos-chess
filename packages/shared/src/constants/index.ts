export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const DEFAULT_TIME_CONTROLS = [
  { label: 'Bullet 1+0', value: '60+0' },
  { label: 'Bullet 2+1', value: '120+1' },
  { label: 'Blitz 3+0', value: '180+0' },
  { label: 'Blitz 5+0', value: '300+0' },
  { label: 'Rapid 10+0', value: '600+0' },
  { label: 'Rapid 15+10', value: '900+10' },
  { label: 'Classical 30+0', value: '1800+0' },
  { label: 'Classical 60+30', value: '3600+30' },
];

export const RATING_INITIAL = 1200;
export const RATING_K_FACTOR_NEW = 40;
export const RATING_K_FACTOR_INTERMEDIATE = 20;
export const RATING_K_FACTOR_ESTABLISHED = 10;
export const RATING_GAMES_NEW = 30;
export const RATING_GAMES_INTERMEDIATE = 100;
