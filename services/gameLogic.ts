import { Tile, Player, Team, RoundResult, WinMethod } from '../types';

// Constants
const WINS_FOR_PIECE = 3; // Number of simple wins needed to convert to a Piece

// Helper: Generate Deck
export const generateDeck = (): Tile[] => {
  const deck: Tile[] = [];
  let id = 0;
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      deck.push({ left: i, right: j, id: `tile-${id++}` });
    }
  }
  return shuffle(deck);
};

const shuffle = <T,>(array: T[]): T[] => {
  return array.sort(() => Math.random() - 0.5);
};

// Helper: Calculate Sum of pips in hand
export const calculateHandSum = (hand: Tile[]): number => {
  return hand.reduce((acc, tile) => acc + tile.left + tile.right, 0);
};

/**
 * CORE LOGIC: Determines the score based on the "Domino Baiano" rules.
 */
export const calculateRoundScore = (
  winnerTeam: Team,
  winnerPlayerId: number | undefined,
  method: WinMethod,
  lastTile: Tile | null,
  boardEnds: { left: number; right: number },
  currentSimpleScore: { A: number; B: number },
  currentHandWins: { A: number; B: number },
  currentConsecutive: { team: Team | null; count: number }
): RoundResult => {
  
  const opponentTeam = winnerTeam === 'A' ? 'B' : 'A';
  
  let result: RoundResult = {
    winnerTeam,
    winnerPlayerId,
    method,
    pointsAwarded: 0,
    piecesAwarded: 0,
    shouldResetSimpleScore: false,
    description: '',
    descriptionKey: '',
    winningTile: lastTile
  };

  // --- 1. SPECIAL BEATS (Immediate Pieces, No Points, No Reset usually) ---

  // Choro (Penalty) - 4 Pieces to Opponent
  if (method === 'CHORO_PENALTY') {
    // winnerTeam passed in is already the Opponent Team (the innocent one).
    return {
      winnerTeam, 
      winnerPlayerId, 
      method: 'CHORO_PENALTY',
      pointsAwarded: 0,
      piecesAwarded: 4,
      shouldResetSimpleScore: false, // Special beats usually don't reset simple score
      description: 'CHORO! Locked with higher count. Opponent gets 4 Pieces.',
      descriptionKey: 'desc_CHORO_PENALTY',
      winningTile: lastTile
    };
  }

  // Check Tile-based Special Beats
  if (lastTile) {
    // Buxada (Ending with a double)
    if (lastTile.left === lastTile.right) {
       return { 
         ...result, 
         method: 'BUXADA', 
         piecesAwarded: 2, 
         description: `BUXADA! with ${lastTile.left}-${lastTile.right}`,
         descriptionKey: 'desc_BUXADA'
       };
    }

    // Lá e Cá (Fits both ends, board ends are identical)
    if (boardEnds.left === boardEnds.right && (lastTile.left === boardEnds.left || lastTile.right === boardEnds.left)) {
       return { 
         ...result, 
         method: 'LA_E_CA', 
         piecesAwarded: 1, 
         description: 'BUXADA LÁ E CÁ! (+1 Piece)',
         descriptionKey: 'desc_LA_E_CA'
       };
    }

    // Lasquinei (Fits exactly on two different extreme numbers)
    const tileMatchesLeft = lastTile.left === boardEnds.left || lastTile.right === boardEnds.left;
    const tileMatchesRight = lastTile.left === boardEnds.right || lastTile.right === boardEnds.right;
    
    if (boardEnds.left !== boardEnds.right && tileMatchesLeft && tileMatchesRight) {
       return { 
         ...result, 
         method: 'LASQUINEI', 
         piecesAwarded: 1, 
         description: 'LASQUINEI! (+1 Piece)',
         descriptionKey: 'desc_LASQUINEI'
       };
    }
  }

  // --- 2. SIMPLE SCORING & CONVERSION ---

  let pointsToAdd = 0;
  // Simple wins (Knock or Lock) follow the 3 -> 5 -> Piece progression
  if (method === 'NORMAL_KNOCK' || method === 'LOCK') {
      if (currentHandWins[winnerTeam] === 0) {
          pointsToAdd = 3;
      } else if (currentHandWins[winnerTeam] === 1) {
          pointsToAdd = 2; // 3 + 2 = 5
      }
      // If currentHandWins >= 2, next is 3rd win -> Conversion. 
      // pointsToAdd remains 0 (reset happens below).
  }

  const newHandWins = currentHandWins[winnerTeam] + 1;

  // CHECK FOR CONVERSION (Reached 3 wins)
  if (newHandWins >= WINS_FOR_PIECE) {
    // Check CARA DE GATO condition:
    // 1. Must be 3rd CONSECUTIVE win for this team
    // 2. Opponent must have 0 simple points
    const isConsecutiveThree = (currentConsecutive.team === winnerTeam && currentConsecutive.count === 2); // 2 previous + this 1 = 3
    const isOpponentZero = currentSimpleScore[opponentTeam] === 0;

    if (isConsecutiveThree && isOpponentZero) {
        return {
            ...result,
            pointsAwarded: pointsToAdd, // Visually added before reset
            piecesAwarded: 2,
            shouldResetSimpleScore: true,
            description: 'CARA DE GATO! 3 consecutive wins, opponent zeroed. (+2 Pieces)',
            descriptionKey: 'desc_CARA_DE_GATO'
        };
    }

    // Normal Conversion
    return {
        ...result,
        pointsAwarded: pointsToAdd,
        piecesAwarded: 1,
        shouldResetSimpleScore: true,
        description: `Completed 3 wins! Converted to +1 Piece.`,
        descriptionKey: 'desc_CONSECUTIVE_3'
    };
  }

  // Just Accumulate
  return {
    ...result,
    pointsAwarded: pointsToAdd,
    piecesAwarded: 0,
    shouldResetSimpleScore: false,
    description: `Won round via ${method}. (+${pointsToAdd} pts)`,
    descriptionKey: 'desc_SIMPLE'
  };
};

export const isValidMove = (tile: Tile, boardEnds: { left: number; right: number } | null): boolean => {
  if (!boardEnds || boardEnds.left === -1) return true;
  return (
    tile.left === boardEnds.left ||
    tile.right === boardEnds.left ||
    tile.left === boardEnds.right ||
    tile.right === boardEnds.right
  );
};