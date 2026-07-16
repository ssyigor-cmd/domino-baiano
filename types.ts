export type Team = 'A' | 'B';

export interface Tile {
  left: number;
  right: number;
  id: string;
}

export interface Player {
  id: number;
  name: string;
  team: Team;
  hand: Tile[];
}

export interface PlacedTile extends Tile {
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
}

export type WinMethod = 
  | 'NORMAL_KNOCK'      // Batida Simples (3 pts)
  | 'LOCK'              // Fechamento (3 pts)
  | 'BUXADA'            // Buxada (2 Pieces)
  | 'LA_E_CA'           // Fits both ends same number (1 Piece)
  | 'LASQUINEI'         // Fits both ends exact numbers (1 Piece)
  | 'CHORO_PENALTY';    // Penalty for bad lock (4 Pieces to opponent)

export interface RoundResult {
  winnerTeam: Team;
  winnerPlayerId?: number; // The specific player who won (to start next round)
  method: WinMethod;
  pointsAwarded: number; // Points added to simple score (3 or 5)
  piecesAwarded: number; // "Pieces" added to global score
  shouldResetSimpleScore: boolean; // True if the simple score converted to a Piece
  description: string;
  descriptionKey: string;
  winningTile?: Tile | null;
}

export interface GameSettings {
  tableColor: string;
  gameSpeed: 'SLOW' | 'NORMAL' | 'FAST';
  difficulty: 'EASY' | 'HARD';
  soundEnabled: boolean;
}

export interface GameState {
  currentTurnPlayerId: number;
  boardTiles: { left: Tile; right: Tile | null; sequence: Tile[] };
  boardEnds: { left: number; right: number };
  gameStatus: 'MENU' | 'WAITING' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER';
  
  // Scoring State
  simpleScore: { A: number; B: number };   // The accumulated points (e.g. 3, 5, 8...)
  handWins: { A: number; B: number };      // The count of wins (Target: 3 to get a Piece)
  consecutiveWins: { team: Team | null; count: number }; // Only used for "Cara de Gato" check
  
  globalPieces: {
    A: number;
    B: number;
  };
  lastActivePlayerId?: number;
  mustPlayDoubleOne: boolean; // Enforces the 1-1 start rule
  log: string[];
}