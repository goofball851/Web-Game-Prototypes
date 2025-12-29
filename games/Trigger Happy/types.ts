
export enum GameState {
  START_SCREEN = 'START_SCREEN',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum VisualStyle {
  NEON = 'NEON',
  PIXEL = 'PIXEL',
  GLITCH = 'GLITCH',
  RETRO = 'RETRO',
  MONO = 'MONO'
}

export interface RunFlavor {
  characterName: string;
  weaponName: string;
  destructionStyle: string;
  initialStyle: VisualStyle;
  labCommentary: string;
}

export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}
