import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ArrowLeft, Zap, Pause, Play, Trophy, RotateCw, Flame } from 'lucide-react';
import { soundManager } from '../../utils/soundManager';

interface BlockPuzzleProps {
  onGameEnd: (score: number, coins: number, xp: number) => void;
  onBack: () => void;
}

const GRID_SIZE = 8;

type Shape = boolean[][];

interface BlockTrayItem {
  id: string;
  shape: Shape;
  color: string;
}

const COLOR_PALETTE = [
  'from-emerald-500 to-teal-400 border-emerald-300',
  'from-cyan-500 to-blue-500 border-cyan-300',
  'from-amber-400 to-orange-500 border-amber-300',
  'from-purple-500 to-pink-500 border-purple-300',
  'from-rose-500 to-red-500 border-rose-300',
];

const SHAPE_TEMPLATES: Shape[] = [
  [[true]], // 1x1
  [[true, true]], // 1x2
  [[true], [true]], // 2x1
  [[true, true, true]], // 1x3
  [[true], [true], [true]], // 3x1
  [[true, true, true, true]], // 1x4
  [[true, true], [true, true]], // 2x2
  [[true, true, true], [true, true, true], [true, true, true]], // 3x3
  [[true, false], [true, false], [true, true]], // L shape
  [[true, true, true], [false, true, false]], // T shape
  [[true, true, false], [false, true, true]], // Z shape
  [[true, true], [true, false]], // Corner
];

export const BlockPuzzleGame: React.FC<BlockPuzzleProps> = ({ onGameEnd, onBack }) => {
  const [grid, setGrid] = useState<string[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''))
  );
  const [tray, setTray] = useState<BlockTrayItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Generate 3 random tray items
  const generateTray = () => {
    const newItems: BlockTrayItem[] = [];
    for (let i = 0; i < 3; i++) {
      const template = SHAPE_TEMPLATES[Math.floor(Math.random() * SHAPE_TEMPLATES.length)];
      const color = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
      newItems.push({
        id: `block-${Date.now()}-${i}-${Math.random()}`,
        shape: template,
        color,
      });
    }
    return newItems;
  };

  const initGame = () => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('')));
    setScore(0);
    setCombo(0);
    setIsPaused(false);
    setIsGameOver(false);
    setSelectedBlockId(null);
    setTray(generateTray());
  };

  useEffect(() => {
    initGame();
  }, []);

  // Helper to rotate a shape
  const rotateShape = (shape: Shape): Shape => {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated: Shape = Array(cols).fill(null).map(() => Array(rows).fill(false));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[c][rows - 1 - r] = shape[r][c];
      }
    }
    return rotated;
  };

  const handleRotateSelected = () => {
    if (!selectedBlockId) return;
    soundManager.playClick();
    setTray((prev) =>
      prev.map((item) =>
        item.id === selectedBlockId ? { ...item, shape: rotateShape(item.shape) } : item
      )
    );
  };

  // Check if shape can be placed at row, col
  const canPlaceShape = (currentGrid: string[][], shape: Shape, startR: number, startC: number): boolean => {
    const rows = shape.length;
    const cols = shape[0].length;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (shape[r][c]) {
          const gr = startR + r;
          const gc = startC + c;
          if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
          if (currentGrid[gr][gc] !== '') return false;
        }
      }
    }
    return true;
  };

  // Check if any block in tray can fit ANYWHERE on grid
  const checkGameOver = (currentGrid: string[][], currentTray: BlockTrayItem[]): boolean => {
    if (currentTray.length === 0) return false;
    for (const item of currentTray) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (canPlaceShape(currentGrid, item.shape, r, c)) {
            return false; // Found a valid placement!
          }
        }
      }
    }
    return true; // No valid placement found!
  };

  const handleGridCellClick = (startR: number, startC: number) => {
    if (isGameOver || isPaused || !selectedBlockId) return;

    const block = tray.find((b) => b.id === selectedBlockId);
    if (!block) return;

    if (!canPlaceShape(grid, block.shape, startR, startC)) {
      return;
    }

    soundManager.playClick();

    // Place shape
    const newGrid = grid.map((row) => [...row]);
    const shape = block.shape;
    let placedBlocksCount = 0;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[0].length; c++) {
        if (shape[r][c]) {
          newGrid[startR + r][startC + c] = block.color;
          placedBlocksCount++;
        }
      }
    }

    // Check full rows and columns simultaneously
    const fullRows: number[] = [];
    const fullCols: number[] = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r].every((cell) => cell !== '')) fullRows.push(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      let isFull = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][c] === '') {
          isFull = false;
          break;
        }
      }
      if (isFull) fullCols.push(c);
    }

    const linesCleared = fullRows.length + fullCols.length;

    // Clear filled rows & cols
    fullRows.forEach((r) => {
      newGrid[r] = Array(GRID_SIZE).fill('');
    });
    fullCols.forEach((c) => {
      for (let r = 0; r < GRID_SIZE; r++) {
        newGrid[r][c] = '';
      }
    });

    // Score & combos
    let addedScore = placedBlocksCount * 10;
    let nextCombo = combo;

    if (linesCleared > 0) {
      soundManager.playMatch();
      nextCombo += 1;
      addedScore += linesCleared * 100 * nextCombo;
    } else {
      nextCombo = 0;
    }

    const nextScore = score + addedScore;
    setScore(nextScore);
    setCombo(nextCombo);
    setGrid(newGrid);

    // Remove block from tray
    const remainingTray = tray.filter((b) => b.id !== selectedBlockId);
    let updatedTray = remainingTray;

    if (remainingTray.length === 0) {
      updatedTray = generateTray();
    }

    setTray(updatedTray);
    setSelectedBlockId(null);

    // Check game over
    if (checkGameOver(newGrid, updatedTray)) {
      setIsGameOver(true);
      soundManager.playLose();
    }
  };

  const handleFinish = () => {
    const coins = Math.round(score / 5);
    onGameEnd(score, coins, score);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto animate-fade-in relative">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-white">Block Blast Puzzle</h2>
          <p className="text-[10px] text-slate-400">Place shapes to complete rows & columns!</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-slate-800 text-amber-400 cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={initGame}
            className="p-2 rounded-xl bg-slate-800 text-emerald-400 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl text-xs font-mono font-bold shadow-lg">
        <div className="text-amber-400 flex items-center gap-1">
          <Zap className="w-4 h-4 fill-amber-400" /> Score: {score}
        </div>
        {combo > 0 && (
          <div className="text-orange-400 font-extrabold flex items-center gap-1 animate-bounce">
            <Flame className="w-4 h-4" /> {combo}x COMBO!
          </div>
        )}
        <button
          onClick={handleFinish}
          className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black cursor-pointer"
        >
          Claim Score
        </button>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-8 gap-1 p-2 bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl">
        {grid.map((row, r) =>
          row.map((color, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleGridCellClick(r, c)}
              className={`aspect-square rounded-lg transition cursor-pointer border select-none ${
                color
                  ? `bg-gradient-to-tr ${color} shadow-md scale-95`
                  : 'bg-slate-900 border-slate-800/80 hover:bg-slate-800'
              }`}
            />
          ))
        )}
      </div>

      {/* Tray Selection & Rotate Controls */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
          <span>Select Block to Place:</span>
          {selectedBlockId && (
            <button
              onClick={handleRotateSelected}
              className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" /> Rotate Block
            </button>
          )}
        </div>

        <div className="flex items-center justify-around gap-2">
          {tray.map((item) => {
            const isSelected = selectedBlockId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedBlockId(item.id);
                }}
                className={`p-2 rounded-2xl border transition flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-400 ring-2 ring-emerald-400 scale-105 shadow-xl'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="grid gap-0.5">
                  {item.shape.map((sRow, sr) => (
                    <div key={sr} className="flex gap-0.5">
                      {sRow.map((cell, sc) => (
                        <div
                          key={sc}
                          className={`w-4 h-4 rounded-xs ${
                            cell ? `bg-gradient-to-tr ${item.color}` : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pause Modal */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-6 space-y-4">
          <Pause className="w-12 h-12 text-amber-400 animate-pulse" />
          <h3 className="text-xl font-black text-white">Game Paused</h3>
          <button
            onClick={() => setIsPaused(false)}
            className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-2xl text-xs cursor-pointer shadow-xl"
          >
            Resume Game
          </button>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl z-40 flex flex-col items-center justify-center p-6 space-y-4 text-center border border-red-500/40">
          <Trophy className="w-16 h-16 text-amber-400" />
          <div>
            <h3 className="text-2xl font-black text-white">No Valid Moves Left!</h3>
            <p className="text-xs text-slate-400 mt-1">Great attempt! You ran out of grid space.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-mono text-xs space-y-1 w-full max-w-xs">
            <div className="text-amber-400 font-bold">Final Score: {score} Pts</div>
            <div className="text-emerald-400 font-bold">+ {Math.round(score / 5)} Coins</div>
            <div className="text-teal-300 font-bold">+ {score} XP</div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={initGame}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              Play Again
            </button>
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer"
            >
              Claim Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
