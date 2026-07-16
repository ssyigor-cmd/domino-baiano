import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Tile, Player, Team, GameState, RoundResult, WinMethod, GameSettings } from './types';
import { generateDeck, calculateRoundScore, isValidMove, calculateHandSum } from './services/gameLogic';
import DominoTile from './components/DominoTile';
import { Trophy, RefreshCw, Play, FastForward, SkipForward, Target, Ban, Settings, BookOpen, LogOut, X, Check, Volume2, VolumeX } from 'lucide-react';

// --- UPDATED LIGHTER UI SOUND ASSETS ---
const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Soft UI click
  play: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',  // Light tap/pop
  pass: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',  // Subtle swoosh
  win: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',   // Friendly chime win
  shuffle: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3' // Lighter rattling tiles
};

// --- TRANSLATION CONFIG ---
type Language = 'en' | 'pt';

const TRANSLATIONS = {
  en: {
    welcome: 'Welcome to Domino Baiano! Press Start Game.',
    newRound: 'New Round. Player {id} starts.',
    waitTurn: 'Wait for your turn.',
    tileNoFit: "That tile doesn't fit!",
    played: '{player} played {tile}',
    passed: '{player} passed.',
    roundOver: 'Round Over.',
    handEmpty: 'Hand Empty',
    matchStatus: 'Match Status',
    streakOwner: 'Consecutive Owner',
    winsInRow: 'Consecutive Count',
    simplePts: 'Simple Pts',
    simpleWins: 'Hands Won',
    startGame: 'NEW GAME',
    nextHand: 'NEXT HAND',
    waitingFor: 'Waiting for Player {id}...',
    yourTurn: 'YOUR TURN',
    passTurn: 'PASS TURN',
    chooseSide: 'Select matching side on board',
    matchSide: 'Match {val}',
    fitsBoth: 'This tile fits both ends!',
    teamWins: 'TEAM {team} WINS!',
    pieces: 'Pieces',
    you: 'You (A)',
    them: 'Them (B)',
    bahiaRuleset: 'Bahia Ruleset',
    forcedOneOne: 'You must start with the 1-1 tile!',
    selectOnBoard: 'SELECT SIDE ON BOARD',
    passedPopup: '{name} PASSED!',
    menu_newGame: 'NEW GAME',
    menu_rules: 'RULES',
    menu_options: 'OPTIONS',
    menu_exit: 'EXIT',
    opt_tableColor: 'Table Color',
    opt_speed: 'Game Speed',
    opt_difficulty: 'AI Level',
    opt_sound: 'Sound Effects',
    diff_easy: 'Easy',
    diff_hard: 'Hard',
    speed_slow: 'Slow',
    speed_normal: 'Normal',
    speed_fast: 'Fast',
    rules_title: 'Rules of Domino Baiano',
    subtitle_edition: 'Bahia Ruleset Edition',
    rules_obj_title: 'Objective:',
    rules_obj_text: 'Be the first team (Pair) to accumulate Global Pieces.',
    rules_score_title: 'Scoring System',
    rules_simple_term: 'Simple Win (Batida):',
    rules_simple_def: '+3 pts to score.',
    rules_lock_term: 'Lock (Fechamento):',
    rules_lock_def: '+3 pts to score.',
    rules_conv_term: 'Conversion:',
    rules_conv_def: 'Reaching 3 wins/points usually converts to 1 Piece.',
    rules_special_title: 'Special Wins (Direct Pieces)',
    rules_bux_term: 'Buxada:',
    rules_bux_def: 'Winning with a double tile. (+2 Pieces)',
    rules_laeca_term: 'La-e-Cá:',
    rules_laeca_def: 'Winning with a tile that matches both ends (same number). (+1 Piece)',
    rules_lasq_term: 'Lasquinei:',
    rules_lasq_def: 'Winning with a tile that matches both ends (different numbers). (+1 Piece)',
    rules_choro_term: 'Choro (Penalty):',
    rules_choro_def: 'Locking the game but having more points than the opponent. Opponent gets +4 Pieces.',
    btn_close: 'Close',
    btn_done: 'Done',
    desc_BUXADA: 'BUXADA! with {tile}',
    desc_LA_E_CA: 'BUXADA LÁ E CÁ! (+1 Piece)',
    desc_LASQUINEI: 'LASQUINEI! (+1 Piece)',
    desc_CHORO_PENALTY: 'CHORO! Locked with higher count. Opponent gets 4 Pieces.',
    desc_CARA_DE_GATO: 'CARA DE GATO! 3 consecutive wins, opponent zeroed. (+2 Pieces)',
    desc_CONSECUTIVE_3: 'Completed 3 wins! Converted to +1 Piece.',
    desc_SIMPLE: 'Won round via {method}. (+{points} pts)',
    method_NORMAL_KNOCK: 'Normal Knock',
    method_LOCK: 'Lock',
    method_BUXADA: 'Buxada',
    method_LA_E_CA: 'Lá e Cá',
    method_LASQUINEI: 'Lasquinei',
    method_CHORO_PENALTY: 'Choro Penalty'
  },
  pt: {
    welcome: 'Bem-vindo ao Domino Baiano! Pressione Iniciar Partida.',
    newRound: 'Nova Rodada. Jogador {id} inicia.',
    waitTurn: 'Aguarde sua vez.',
    tileNoFit: 'Essa pedra não encaixa!',
    played: '{player} jogou {tile}',
    passed: '{player} passou.',
    roundOver: 'Fim da Rodada.',
    handEmpty: 'Mão Vazia',
    matchStatus: 'Status da Partida',
    streakOwner: 'Dono da Sequência',
    winsInRow: 'Contagem Consecutiva',
    simplePts: 'Pts Simples',
    simpleWins: 'Mãos Vencidas',
    startGame: 'NOVO JOGO',
    nextHand: 'PRÓXIMA MÃO',
    waitingFor: 'Aguardando Jogador {id}...',
    yourTurn: 'SUA VEZ',
    passTurn: 'PASSAR VEZ',
    chooseSide: 'Selecione o lado no tabuleiro',
    matchSide: 'Casar {val}',
    fitsBoth: 'Essa pedra serve nos dois lados!',
    teamWins: 'TIME {team} VENCE!',
    pieces: 'Peças',
    you: 'Você (A)',
    them: 'Eles (B)',
    bahiaRuleset: 'Regras da Bahia',
    forcedOneOne: 'Você é obrigado a sair com a buxa de 1 (1-1)!',
    selectOnBoard: 'SELECIONE O LADO NO TABULEIRO',
    passedPopup: '{name} PASSOU!',
    menu_newGame: 'NOVO JOGO',
    menu_rules: 'REGRAS',
    menu_options: 'OPÇÕES',
    menu_exit: 'SAIR',
    opt_tableColor: 'Cor da Mesa',
    opt_speed: 'Velocidade',
    opt_difficulty: 'Nível da IA',
    opt_sound: 'Efeitos Sonoros',
    diff_easy: 'Fácil',
    diff_hard: 'Difícil',
    speed_slow: 'Lento',
    speed_normal: 'Normal',
    speed_fast: 'Rápido',
    rules_title: 'Regras do Dominó Baiano',
    subtitle_edition: 'Edição Regras da Bahia',
    rules_obj_title: 'Objetivo:',
    rules_obj_text: 'Ser a primeira dupla a acumular Peças Globais.',
    rules_score_title: 'Sistema de Pontuação',
    rules_simple_term: 'Batida Simples:',
    rules_simple_def: '+3 pts para o placar.',
    rules_lock_term: 'Fechamento:',
    rules_lock_def: '+3 pts para o placar.',
    rules_conv_term: 'Conversão:',
    rules_conv_def: 'Atingir 3 vitórias/pontos geralmente converte em 1 Peça.',
    rules_special_title: 'Vitórias Especiais (Peças Diretas)',
    rules_bux_term: 'Buxada:',
    rules_bux_def: 'Bater com uma bucha (pedra dupla). (+2 Peças)',
    rules_laeca_term: 'Lá-e-Cá:',
    rules_laeca_def: 'Bater com uma pedra que cabe nas duas pontas (mesmo número). (+1 Peça)',
    rules_lasq_term: 'Lasquinei:',
    rules_lasq_def: 'Bater com uma pedra que cabe nas duas pontas (números diferentes). (+1 Peça)',
    rules_choro_term: 'Choro (Pênalti):',
    rules_choro_def: 'Fechar o jogo tendo mais pontos na mão que o oponente. Oponente ganha +4 Peças.',
    btn_close: 'Fechar',
    btn_done: 'Concluir',
    desc_BUXADA: 'BUXADA! com {tile}',
    desc_LA_E_CA: 'BUXADA LÁ E CÁ! (+1 Peça)',
    desc_LASQUINEI: 'LASQUINEI! (+1 Peça)',
    desc_CHORO_PENALTY: 'CHORO! Fechou com mais pontos. Oponente ganha 4 Peças.',
    desc_CARA_DE_GATO: 'CARA DE GATO! 3 vitórias seguidas, oponente zerado. (+2 Peças)',
    desc_CONSECUTIVE_3: 'Completou 3 vitórias! Converteu em +1 Peça.',
    desc_SIMPLE: 'Venceu via {method}. (+{points} pts)',
    method_NORMAL_KNOCK: 'Batida Simples',
    method_LOCK: 'Fechamento',
    method_BUXADA: 'Buxada',
    method_LA_E_CA: 'Lá e Cá',
    method_LASQUINEI: 'Lasquinei',
    method_CHORO_PENALTY: 'Pênalti (Choro)'
  }
};

const INITIAL_STATE: GameState = {
  currentTurnPlayerId: 0,
  boardTiles: { left: { left: 0, right: 0, id: '' }, right: null, sequence: [] },
  boardEnds: { left: -1, right: -1 },
  gameStatus: 'MENU',
  simpleScore: { A: 0, B: 0 },
  handWins: { A: 0, B: 0 },
  consecutiveWins: { team: null, count: 0 },
  globalPieces: { A: 0, B: 0 },
  lastActivePlayerId: -1,
  mustPlayDoubleOne: false,
  log: []
};

const INITIAL_SETTINGS: GameSettings = {
  tableColor: '#153e26',
  gameSpeed: 'NORMAL',
  difficulty: 'HARD',
  soundEnabled: true
};

const COLORS = [
  { name: 'Classic Green', value: '#153e26' },
  { name: 'Royal Blue', value: '#1e3a8a' },
  { name: 'Burgundy', value: '#7f1d1d' },
  { name: 'Slate Black', value: '#0f172a' }
];

interface RenderedTile extends Tile {
  x: number;
  y: number;
  vertical: boolean;
  rotation: number;
  w: number;
  h: number;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [players, setPlayers] = useState<Player[]>([]);
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(null);
  const [language, setLanguage] = useState<Language>('pt');
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [activeModal, setActiveModal] = useState<'RULES' | 'OPTIONS' | null>(null);
  const [pendingDecision, setPendingDecision] = useState<{ tile: Tile, playerId: number } | null>(null);
  const [passNotification, setPassNotification] = useState<{ name: string } | null>(null);
  const [boardLayout, setBoardLayout] = useState<RenderedTile[]>([]);
  const [boardScale, setBoardScale] = useState(1);
  const [boardOffset, setBoardOffset] = useState({ x: 0, y: 0 });
  const boardContainerRef = useRef<HTMLDivElement>(null);

  const t = (key: keyof typeof TRANSLATIONS['en'], params?: Record<string, string | number>) => {
    let str = TRANSLATIONS[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  const playSound = (key: keyof typeof SOUNDS) => {
    if (!settings.soundEnabled) return;
    const audio = new Audio(SOUNDS[key]);
    audio.play().catch(() => {});
  };

  const getMethodName = (method: string) => {
     const key = `method_${method}` as keyof typeof TRANSLATIONS['en'];
     return TRANSLATIONS[language][key] || method.replace('_', ' ');
  };

  const getSpeedDelay = () => {
     switch(settings.gameSpeed) {
       case 'SLOW': return 2000;
       case 'FAST': return 600;
       default: return 1200;
     }
  };

  const startGame = () => {
    playSound('shuffle');
    const deck = generateDeck();
    const newPlayers: Player[] = [
      { id: 0, name: 'You', team: 'A', hand: deck.slice(0, 7) },
      { id: 1, name: 'Player 2', team: 'B', hand: deck.slice(7, 14) },
      { id: 2, name: 'Player 3', team: 'A', hand: deck.slice(14, 21) },
      { id: 3, name: 'Player 4', team: 'B', hand: deck.slice(21, 28) },
    ];

    let starterId = 0;
    let enforceOneOne = false;

    const isFirstGame = gameState.globalPieces.A === 0 && gameState.globalPieces.B === 0 && !lastRoundResult;
    const pieceFormed = lastRoundResult && lastRoundResult.piecesAwarded > 0;

    if (isFirstGame || pieceFormed) {
        const pWith11 = newPlayers.find(p => p.hand.some(t => t.left === 1 && t.right === 1));
        if (pWith11) {
            starterId = pWith11.id;
            enforceOneOne = true;
        }
    } else if (lastRoundResult && typeof lastRoundResult.winnerPlayerId === 'number') {
        starterId = lastRoundResult.winnerPlayerId;
    }

    setPlayers(newPlayers);
    setGameState(prev => ({
      ...prev,
      gameStatus: 'PLAYING',
      boardTiles: { left: { left: 0, right: 0, id: '' }, right: null, sequence: [] },
      boardEnds: { left: -1, right: -1 },
      currentTurnPlayerId: starterId,
      lastActivePlayerId: -1,
      mustPlayDoubleOne: enforceOneOne,
      log: [t('newRound', { id: starterId + 1 })]
    }));
    setLastRoundResult(null);
    setPendingDecision(null);
    setPassNotification(null);
  };

  const addLog = (msg: string) => {
    setGameState(prev => ({ ...prev, log: [msg, ...prev.log].slice(0, 20) }));
  };

  useLayoutEffect(() => {
    const calculateLayout = () => {
      if (!boardContainerRef.current) return;
      
      const containerW = boardContainerRef.current.clientWidth;
      const containerH = boardContainerRef.current.clientHeight;

      const TILE_L = 96; 
      const TILE_S = 48; 
      const G = 4; // REDUCED GAP for tighter layout
      const ROW_H = TILE_L + G; 

      // Max tiles per row - adjusted for compact layout
      const maxTilesPerRow = Math.max(4, Math.floor((containerW * 1.5) / (TILE_L + G)));
      
      const sequence = gameState.boardTiles.sequence;
      const layoutData: RenderedTile[] = [];
      
      let cursorX = 0;
      let cursorY = 0;
      let hDir = 1; 
      let tilesInRow = 0;
      let mode: 'H' | 'V' = 'H';

      for (let i = 0; i < sequence.length; i++) {
        const tile = sequence[i];
        const isDouble = tile.left === tile.right;

        if (mode === 'H') {
          const isVert = isDouble;
          const w = isVert ? TILE_S : TILE_L;
          const h = isVert ? TILE_L : TILE_S;
          
          const top = cursorY + (TILE_L - h) / 2;
          let left = hDir === 1 ? cursorX : cursorX - w;
          
          layoutData.push({ 
            ...tile, 
            x: left, 
            y: top, 
            vertical: isVert, 
            w, h, 
            rotation: (hDir === -1 && !isVert) ? 180 : 0 
          });

          cursorX += (w + G) * hDir;
          tilesInRow++;

          if (tilesInRow >= maxTilesPerRow && i < sequence.length - 1) {
            mode = 'V';
            tilesInRow = 0;
          }
        } else if (mode === 'V') {
          const w = TILE_S;
          const h = TILE_L;
          
          let left = hDir === 1 ? cursorX - (w + G) : cursorX + G;
          let top = cursorY + ROW_H;
          
          layoutData.push({ 
            ...tile, 
            x: left, 
            y: top, 
            vertical: true, 
            w, h, 
            rotation: 0 
          });

          cursorY += ROW_H + G; 
          hDir *= -1;
          cursorX = hDir === 1 ? left : left + w;
          mode = 'H';
        }
      }

      if (layoutData.length > 0) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        layoutData.forEach(item => {
            if (item.x < minX) minX = item.x;
            if (item.x + item.w > maxX) maxX = item.x + item.w;
            if (item.y < minY) minY = item.y;
            if (item.y + item.h > maxY) maxY = item.y + item.h;
        });

        const totalW = (maxX - minX);
        const totalH = (maxY - minY);
        
        // AUTO-SCALE ZOOM OUT CALCULATION
        const padding = 60;
        const scaleX = (containerW - padding) / totalW;
        const scaleY = (containerH - padding) / totalH;
        
        // We want to see everything, so take the minimum scale
        const finalScale = Math.min(1.0, scaleX, scaleY); 

        setBoardScale(finalScale);
        
        // Offset to center the scaled bounding box in the container
        const centerX = (containerW / 2) - ((minX + totalW / 2) * finalScale);
        const centerY = (containerH / 2) - ((minY + totalH / 2) * finalScale);
        
        setBoardOffset({ x: centerX, y: centerY });
        setBoardLayout(layoutData);
      } else {
        setBoardLayout([]);
        setBoardScale(1);
        setBoardOffset({ x: 0, y: 0 });
      }
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [gameState.boardTiles.sequence]);

  const executeMove = (playerId: number, tile: Tile, side: 'left' | 'right') => {
    playSound('play');
    setPendingDecision(null);
    setPassNotification(null);
    setGameState(prev => {
        let newEnds = { ...prev.boardEnds };
        let newSequence = [...prev.boardTiles.sequence];
        let orientedTile = { ...tile };
        if (prev.boardEnds.left === -1) {
            newEnds = { left: tile.left, right: tile.right };
            newSequence = [tile];
        } else {
            if (side === 'left') {
                if (tile.left === prev.boardEnds.left) orientedTile = { left: tile.right, right: tile.left, id: tile.id };
                newEnds.left = orientedTile.left;
                newSequence.unshift(orientedTile);
            } else {
                if (tile.right === prev.boardEnds.right) orientedTile = { left: tile.right, right: tile.left, id: tile.id };
                newEnds.right = orientedTile.right;
                newSequence.push(orientedTile);
            }
        }
        return { ...prev, boardEnds: newEnds, boardTiles: { ...prev.boardTiles, sequence: newSequence }, lastActivePlayerId: playerId, mustPlayDoubleOne: false };
    });
    setPlayers(prev => {
      const next = [...prev];
      const idx = next.findIndex(p => p.id === playerId);
      next[idx].hand = next[idx].hand.filter(t => t.id !== tile.id);
      return next;
    });
    addLog(t('played', { player: players[playerId].name, tile: `${tile.left}-${tile.right}` }));
    if (players[playerId].hand.length === 1) { 
        handleRoundEnd(players[playerId].team, playerId, 'NORMAL_KNOCK', tile);
    } else {
        setGameState(prev => ({ ...prev, currentTurnPlayerId: (playerId + 1) % 4 }));
    }
  };

  const handlePass = (playerId: number) => {
      playSound('pass');
      setPassNotification({ name: players[playerId].name });
      setTimeout(() => setPassNotification(null), 1500);
      const allBlocked = players.every(p => !p.hand.some(t => isValidMove(t, gameState.boardEnds)));
      if (allBlocked) handleLock();
      else setGameState(prev => ({ ...prev, currentTurnPlayerId: (playerId + 1) % 4 }));
  };

  const handleLock = () => {
    const sums = players.map(p => ({ id: p.id, team: p.team, sum: calculateHandSum(p.hand) }));
    sums.sort((a, b) => a.sum - b.sum);
    handleRoundEnd(sums[0].team, sums[0].id, 'LOCK', null);
  };

  const handleRoundEnd = (winnerTeam: Team, winnerPlayerId: number, method: WinMethod, lastTile: Tile | null) => {
    playSound('win');
    const result = calculateRoundScore(winnerTeam, winnerPlayerId, method, lastTile, gameState.boardEnds, gameState.simpleScore, gameState.handWins, gameState.consecutiveWins);
    setLastRoundResult(result);
    setGameState(prev => {
        let nGlobal = { ...prev.globalPieces }, nSimple = { ...prev.simpleScore }, nHandWins = { ...prev.handWins }, nConsec = { ...prev.consecutiveWins };
        if (result.shouldResetSimpleScore) { nSimple = { A: 0, B: 0 }; nHandWins = { A: 0, B: 0 }; nConsec = { team: null, count: 0 }; }
        else { nSimple[winnerTeam] += result.pointsAwarded; if (result.piecesAwarded === 0) { nHandWins[winnerTeam]++; nConsec = nConsec.team === winnerTeam ? { team: winnerTeam, count: nConsec.count + 1 } : { team: winnerTeam, count: 1 }; } }
        if (result.piecesAwarded > 0) nGlobal[winnerTeam] += result.piecesAwarded;
        return { ...prev, gameStatus: 'ROUND_OVER', globalPieces: nGlobal, simpleScore: nSimple, handWins: nHandWins, consecutiveWins: nConsec };
    });
  };

  useEffect(() => {
    if (gameState.gameStatus === 'PLAYING' && gameState.currentTurnPlayerId !== 0) {
      const timer = setTimeout(() => {
        const p = players[gameState.currentTurnPlayerId];
        const valid = p.hand.filter(t => gameState.mustPlayDoubleOne ? (t.left === 1 && t.right === 1) : isValidMove(t, gameState.boardEnds));
        if (valid.length > 0) {
          const tile = valid.sort((a,b) => (settings.difficulty === 'HARD' ? (b.left + b.right) - (a.left + a.right) : 0))[0];
          const mLeft = tile.left === gameState.boardEnds.left || tile.right === gameState.boardEnds.left;
          const mRight = tile.left === gameState.boardEnds.right || tile.right === gameState.boardEnds.right;
          executeMove(p.id, tile, (mLeft && mRight) ? (Math.random() > 0.5 ? 'left' : 'right') : (mRight ? 'right' : 'left'));
        } else handlePass(p.id);
      }, getSpeedDelay());
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurnPlayerId, gameState.gameStatus]);

  if (gameState.gameStatus === 'MENU') {
     return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
             <div className="max-w-md w-full mx-4 z-10 text-center">
                 <div className="mb-12">
                     <div className="inline-block bg-yellow-500 p-4 rounded-2xl shadow-2xl mb-6 transform rotate-3"><Trophy size={64} className="text-slate-900" /></div>
                     <h1 className="text-5xl font-black text-white tracking-tighter mb-2">DOMINO <span className="text-yellow-500">BAIANO</span></h1>
                     <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">{t('subtitle_edition')}</p>
                 </div>
                 <div className="space-y-4">
                     <button onClick={startGame} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95"><Play size={24} /> {t('menu_newGame')}</button>
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => { playSound('click'); setActiveModal('RULES'); }} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"><BookOpen size={20} /> {t('menu_rules')}</button>
                        <button onClick={() => { playSound('click'); setActiveModal('OPTIONS'); }} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"><Settings size={20} /> {t('menu_options')}</button>
                     </div>
                 </div>
                 <div className="mt-12 flex justify-center gap-4">
                    <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-lg font-bold text-sm ${language === 'en' ? 'bg-white/20 text-white' : 'text-slate-500 hover:text-white'}`}>English</button>
                    <button onClick={() => setLanguage('pt')} className={`px-4 py-2 rounded-lg font-bold text-sm ${language === 'pt' ? 'bg-white/20 text-white' : 'text-slate-500 hover:text-white'}`}>Português</button>
                 </div>
             </div>
             {activeModal === 'RULES' && (
                 <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                     <div className="bg-slate-800 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
                         <div className="p-6 border-b border-slate-700 flex justify-between items-center"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen size={24} className="text-yellow-500"/> {t('rules_title')}</h2><button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24}/></button></div>
                         <div className="p-6 overflow-y-auto text-slate-300 space-y-4 text-sm leading-relaxed"><p><strong className="text-white">{t('rules_obj_title')}</strong> {t('rules_obj_text')}</p>
                             <div className="space-y-2"><h3 className="text-yellow-400 font-bold uppercase text-xs">{t('rules_score_title')}</h3><ul className="list-disc pl-5 space-y-1"><li><strong className="text-white">{t('rules_simple_term')}</strong> {t('rules_simple_def')}</li><li><strong className="text-white">{t('rules_lock_term')}</strong> {t('rules_lock_def')}</li><li><strong className="text-white">{t('rules_conv_term')}</strong> {t('rules_conv_def')}</li></ul></div>
                             <div className="space-y-2"><h3 className="text-yellow-400 font-bold uppercase text-xs">{t('rules_special_title')}</h3><ul className="list-disc pl-5 space-y-1"><li><strong className="text-white">{t('rules_bux_term')}</strong> {t('rules_bux_def')}</li><li><strong className="text-white">{t('rules_laeca_term')}</strong> {t('rules_laeca_def')}</li><li><strong className="text-white">{t('rules_lasq_term')}</strong> {t('rules_lasq_def')}</li><li><strong className="text-white">{t('rules_choro_term')}</strong> {t('rules_choro_def')}</li></ul></div>
                         </div>
                         <div className="p-4 border-t border-slate-700"><button onClick={() => setActiveModal(null)} className="w-full bg-slate-700 py-3 rounded-lg font-bold hover:bg-slate-600 transition-colors">{t('btn_close')}</button></div>
                     </div>
                 </div>
             )}
             {activeModal === 'OPTIONS' && (
                 <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                     <div className="bg-slate-800 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl">
                         <div className="p-6 border-b border-slate-700 flex justify-between items-center"><h2 className="text-2xl font-bold text-white flex items-center gap-2"><Settings size={24} className="text-yellow-500"/> {t('menu_options')}</h2><button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24}/></button></div>
                         <div className="p-6 space-y-6">
                             <div><label className="block text-slate-400 text-xs font-bold uppercase mb-3">{t('opt_tableColor')}</label><div className="flex gap-3">{COLORS.map(c => (<button key={c.value} onClick={() => { playSound('click'); setSettings(s => ({...s, tableColor: c.value})); }} className={`w-10 h-10 rounded-full border-2 transition-transform ${settings.tableColor === c.value ? 'border-white scale-110' : 'border-transparent opacity-70'}`} style={{ backgroundColor: c.value }}>{settings.tableColor === c.value && <Check size={16} className="text-white mx-auto"/>}</button>))}</div></div>
                             <div><label className="block text-slate-400 text-xs font-bold uppercase mb-3">{t('opt_sound')}</label><button onClick={() => { setSettings(s => ({...s, soundEnabled: !s.soundEnabled})); if(!settings.soundEnabled) playSound('click'); }} className={`w-full flex items-center justify-between p-3 rounded-lg border ${settings.soundEnabled ? 'bg-green-600/20 border-green-600 text-green-400' : 'bg-red-600/20 border-red-600 text-red-400'}`}><span>{settings.soundEnabled ? 'Enabled' : 'Disabled'}</span>{settings.soundEnabled ? <Volume2 size={20}/> : <VolumeX size={20}/>}</button></div>
                             <div><label className="block text-slate-400 text-xs font-bold uppercase mb-3">{t('opt_speed')}</label><div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-1 rounded-lg">{['SLOW', 'NORMAL', 'FAST'].map(spd => (<button key={spd} onClick={() => { playSound('click'); setSettings(s => ({...s, gameSpeed: spd as any})); }} className={`py-2 rounded text-xs font-bold transition-colors ${settings.gameSpeed === spd ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>{t(`speed_${spd.toLowerCase()}` as any)}</button>))}</div></div>
                             <div><label className="block text-slate-400 text-xs font-bold uppercase mb-3">{t('opt_difficulty')}</label><div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-lg">{['EASY', 'HARD'].map(d => (<button key={d} onClick={() => { playSound('click'); setSettings(s => ({...s, difficulty: d as any})); }} className={`py-2 rounded text-xs font-bold transition-colors ${settings.difficulty === d ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>{t(`diff_${d.toLowerCase()}` as any)}</button>))}</div></div>
                         </div>
                         <div className="p-4 border-t border-slate-700"><button onClick={() => setActiveModal(null)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-500 transition-colors">{t('btn_done')}</button></div>
                     </div>
                 </div>
             )}
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
      <header className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center shadow-md z-20">
        <div className="flex items-center gap-3"><div className="bg-yellow-500 p-2 rounded text-slate-900"><Trophy size={20} /></div><div><h1 className="text-xl font-black tracking-tight text-white">DOMINO <span className="text-yellow-500">BAIANO</span></h1><p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{t('subtitle_edition')}</p></div></div>
        <div className="flex items-center gap-4"><button onClick={() => { playSound('click'); setGameState(INITIAL_STATE); }} className="flex items-center gap-2 bg-red-900/30 text-red-200 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-bold uppercase"><LogOut size={14} /> {t('menu_exit')}</button>
           <div className="flex items-center bg-slate-900/50 rounded-lg p-1 border border-white/5"><div className={`px-4 py-1 rounded flex flex-col items-center ${gameState.consecutiveWins.team === 'A' ? 'bg-blue-900/30' : ''}`}><span className="text-[10px] font-bold text-blue-400 uppercase">{t('you')}</span><span className="text-2xl font-bold leading-none">{gameState.globalPieces.A}</span></div><div className="h-8 w-px bg-white/10 mx-2"></div><div className={`px-4 py-1 rounded flex flex-col items-center ${gameState.consecutiveWins.team === 'B' ? 'bg-red-900/30' : ''}`}><span className="text-[10px] font-bold text-red-400 uppercase">{t('them')}</span><span className="text-2xl font-bold leading-none">{gameState.globalPieces.B}</span></div></div>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden relative">
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col z-10 hidden md:flex">
           <div className="p-4 bg-slate-800 border-b border-slate-700"><h3 className="text-xs font-bold text-slate-500 uppercase mb-2">{t('matchStatus')}</h3><div className="space-y-3 bg-slate-900/50 p-3 rounded-md text-sm">
               <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded"><div className="flex flex-col items-center"><span className="text-blue-400 font-bold text-lg">{gameState.simpleScore.A}</span><span className="text-[9px] text-slate-500 uppercase">{t('simplePts')} A</span></div><div className="text-slate-600 font-thin text-xl">x</div><div className="flex flex-col items-center"><span className="text-red-400 font-bold text-lg">{gameState.simpleScore.B}</span><span className="text-[9px] text-slate-500 uppercase">{t('simplePts')} B</span></div></div>
               <div className="flex justify-between items-center"><div className="text-xs text-slate-400">{t('simpleWins')}</div><div className="flex gap-2 text-xs"><span className={`px-2 py-0.5 rounded ${gameState.handWins.A > 0 ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-500'}`}>{gameState.handWins.A}/3</span><span className={`px-2 py-0.5 rounded ${gameState.handWins.B > 0 ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-500'}`}>{gameState.handWins.B}/3</span></div></div>
               <div className="h-px bg-white/5 my-1"></div>
               <div className="flex justify-between"><span className="text-slate-400 text-xs">{t('streakOwner')}</span><span className={`font-bold text-xs ${gameState.consecutiveWins.team === 'A' ? 'text-blue-400' : gameState.consecutiveWins.team === 'B' ? 'text-red-400' : 'text-slate-600'}`}>{gameState.consecutiveWins.team ? `Team ${gameState.consecutiveWins.team}` : '-'}</span></div>
               <div className="flex justify-between"><span className="text-slate-400 text-xs">{t('winsInRow')}</span><span className="text-white font-mono text-xs">{gameState.consecutiveWins.count}</span></div>
           </div></div>
           <div className="flex-1 overflow-y-auto p-4 space-y-1">{gameState.log.map((msg, idx) => (<div key={idx} className="text-xs text-slate-300 border-b border-dashed border-slate-700 pb-1 mb-1 font-mono">{msg}</div>))}</div>
           <div className="p-4 border-t border-slate-700">{gameState.gameStatus === 'ROUND_OVER' && (<button onClick={startGame} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded shadow-lg flex items-center justify-center gap-2"><FastForward size={18} /> {t('nextHand')}</button>)}</div>
        </div>
        <div className="flex-1 relative flex overflow-hidden" style={{ backgroundColor: settings.tableColor }}>
           <div ref={boardContainerRef} className="w-full h-full relative overflow-hidden">
              <div 
                className="absolute transition-transform duration-500 ease-out origin-top-left" 
                style={{ 
                  transform: `translate(${boardOffset.x}px, ${boardOffset.y}px) scale(${boardScale})`,
                  width: '100%',
                  height: '100%'
                }}
              >
                  {gameState.boardTiles.sequence.length === 0 && gameState.gameStatus === 'PLAYING' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40 font-bold text-2xl animate-pulse whitespace-nowrap">
                      {t('waitingFor', { id: gameState.currentTurnPlayerId + 1 })}
                    </div>
                  )}
                  {boardLayout.map((tile, index) => {
                      const isLeftEnd = index === 0;
                      const isRightEnd = index === boardLayout.length - 1;
                      return (
                        <div 
                          key={tile.id} 
                          style={{ 
                            position: 'absolute', 
                            left: tile.x, 
                            top: tile.y, 
                            transform: `rotate(${tile.rotation}deg)`, 
                            transition: 'all 0.5s',
                            zIndex: 10 + index
                          }}
                        >
                          <DominoTile tile={tile} size="md" vertical={tile.vertical} />
                          {pendingDecision && isLeftEnd && (
                            <div 
                              onClick={() => executeMove(pendingDecision.playerId, pendingDecision.tile, 'left')} 
                              className="absolute inset-0 z-50 cursor-pointer flex items-center justify-center bg-yellow-500/80 rounded-md animate-pulse"
                            >
                              <Target size={24} />
                            </div>
                          )}
                          {pendingDecision && isRightEnd && (
                            <div 
                              onClick={() => executeMove(pendingDecision.playerId, pendingDecision.tile, 'right')} 
                              className="absolute inset-0 z-50 cursor-pointer flex items-center justify-center bg-yellow-500/80 rounded-md animate-pulse"
                            >
                              <Target size={24} />
                            </div>
                          )}
                        </div>
                      )
                  })}
              </div>
           </div>
           
           <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-30">
             <div className="flex flex-col items-center">
               <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center bg-slate-800 text-blue-200 font-bold mb-2 ${gameState.currentTurnPlayerId === 2 ? 'border-yellow-400' : 'border-blue-700'}`}>P3</div>
               <div className="flex -space-x-4">{players[2]?.hand.map((t, i) => (<div key={i} className="transform scale-75"><DominoTile tile={t} size="sm" vertical hidden /></div>))}</div>
             </div>
           </div>

           <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-30">
             <div className="flex flex-col items-center">
               <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center bg-slate-800 text-red-200 font-bold mb-2 ${gameState.currentTurnPlayerId === 1 ? 'border-yellow-400' : 'border-red-700'}`}>P2</div>
               <div className="flex flex-col -space-y-8">{players[1]?.hand.map((t, i) => (<div key={i} className="transform scale-75 rotate-90"><DominoTile tile={t} size="sm" vertical hidden /></div>))}</div>
             </div>
           </div>

           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-30">
             <div className="flex flex-col items-center">
               <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center bg-slate-800 text-red-200 font-bold mb-2 ${gameState.currentTurnPlayerId === 3 ? 'border-yellow-400' : 'border-red-700'}`}>P4</div>
               <div className="flex flex-col -space-y-8">{players[3]?.hand.map((t, i) => (<div key={i} className="transform scale-75 -rotate-90"><DominoTile tile={t} size="sm" vertical hidden /></div>))}</div>
             </div>
           </div>

           <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent z-40">
             <div className="max-w-4xl mx-auto flex flex-col items-center">
                  <div className="mb-4 h-12 flex items-center justify-center">
                    {gameState.currentTurnPlayerId === 0 ? (
                      <div className="flex gap-4">
                        {pendingDecision ? (
                          <div className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold animate-pulse">{t('selectOnBoard')}</div>
                        ) : (
                          <div className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold">{t('yourTurn')}</div>
                        )}
                        {!players[0]?.hand.some(t => isValidMove(t, gameState.boardEnds)) && gameState.gameStatus === 'PLAYING' && !pendingDecision && (
                          <button onClick={() => handlePass(0)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2">
                            <SkipForward size={18} /> {t('passTurn')}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-white/50 font-bold bg-black/40 px-4 py-1 rounded-full">{t('waitingFor', { id: gameState.currentTurnPlayerId + 1 })}</div>
                    )}
                  </div>
                  <div className="flex justify-center items-end gap-2 p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
                    {players[0]?.hand.map((tile) => {
                          const valid = gameState.currentTurnPlayerId === 0 && (gameState.mustPlayDoubleOne ? (tile.left === 1 && tile.right === 1) : isValidMove(tile, gameState.boardEnds));
                          return (
                            <div key={tile.id} className={`transition-all ${valid ? 'hover:-translate-y-4 cursor-pointer' : 'opacity-40 grayscale scale-95'}`}>
                              <DominoTile 
                                tile={tile} size="lg" vertical highlight={valid} 
                                onClick={() => { 
                                  if(valid) { 
                                    const mLeft = tile.left === gameState.boardEnds.left || tile.right === gameState.boardEnds.left; 
                                    const mRight = tile.left === gameState.boardEnds.right || tile.right === gameState.boardEnds.right; 
                                    if(mLeft && mRight && gameState.boardEnds.left !== gameState.boardEnds.right) setPendingDecision({ tile, playerId: 0 }); 
                                    else executeMove(0, tile, mRight ? 'right' : 'left'); 
                                  } 
                                }} 
                              />
                            </div>
                          )
                      })}
                  </div>
             </div>
           </div>

           {passNotification && (
             <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
               <div className="bg-red-600/90 text-white px-8 py-4 rounded-xl shadow-2xl animate-bounce">
                 <h2 className="text-3xl font-black uppercase flex items-center gap-3"><Ban size={32} />{t('passedPopup', { name: passNotification.name })}</h2>
               </div>
             </div>
           )}

           {lastRoundResult && (
             <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
               <div className="bg-slate-800 p-8 rounded-2xl border border-slate-600 shadow-2xl text-center max-w-md w-full">
                 <div className="mb-6 flex justify-center"><div className="bg-yellow-500 p-4 rounded-full"><Trophy size={48} className="text-slate-900" /></div></div>
                 <h2 className="text-3xl font-black text-white mb-2">{t('teamWins', { team: lastRoundResult.winnerTeam })}</h2>
                 <div className="bg-slate-900/80 rounded-lg p-2 mb-6 inline-block px-4"><span className="text-yellow-400 font-bold">{getMethodName(lastRoundResult.method)}</span></div>
                 <div className="bg-slate-700/50 p-6 rounded-xl mb-8">
                   <p className="text-lg text-slate-200">{t(lastRoundResult.descriptionKey as any, { tile: lastRoundResult.winningTile ? `${lastRoundResult.winningTile.left}-${lastRoundResult.winningTile.right}` : '', method: getMethodName(lastRoundResult.method), points: lastRoundResult.pointsAwarded })}</p>
                   <div className="h-px bg-white/10 my-4"></div>
                   <div className="flex justify-center items-center gap-2 font-bold text-xl">
                     {lastRoundResult.piecesAwarded > 0 ? (
                       <><span className="text-yellow-400">+{lastRoundResult.piecesAwarded}</span><span className="text-slate-400 text-sm uppercase">{t('pieces')}</span></>
                     ) : (
                       <><span className="text-blue-400">+{lastRoundResult.pointsAwarded}</span><span className="text-slate-400 text-sm uppercase">{t('simplePts')}</span></>
                     )}
                   </div>
                 </div>
                 <button onClick={startGame} className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3"><RefreshCw size={24} /> <span>{t('startGame')}</span></button>
               </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default App;