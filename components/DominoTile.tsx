import React from 'react';
import { Tile } from '../types';

interface DominoTileProps {
  tile: Tile;
  size?: 'sm' | 'md' | 'lg';
  vertical?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  highlight?: boolean;
  hidden?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const DominoTile: React.FC<DominoTileProps> = ({ 
  tile, 
  size = 'md', 
  vertical = false, 
  onClick, 
  disabled = false,
  highlight = false,
  hidden = false,
  style,
  className = ''
}) => {
  // Size mapping
  const sizeStyles = {
    sm: { w: 'w-8', h: 'h-16', dot: 'w-1 h-1' },
    md: { w: 'w-12', h: 'h-24', dot: 'w-2 h-2' },
    lg: { w: 'w-16', h: 'h-32', dot: 'w-2.5 h-2.5' }
  };
  
  const currentSize = sizeStyles[size];

  // Base container styles
  // Flex direction changes based on vertical prop
  const containerClass = `
    relative flex ${vertical ? 'flex-col w-' + currentSize.w.replace('w-', '') + ' ' + currentSize.h : 'flex-row w-' + currentSize.h.replace('h-', '') + ' ' + currentSize.w}
    bg-white border border-gray-300 rounded-md shadow-[2px_2px_0px_rgba(0,0,0,0.3)] 
    select-none transition-transform
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
    ${highlight ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#1a472a]' : ''}
    ${className}
  `;

  // Dot Pattern Generator (3x3 Grid)
  const renderHalf = (num: number) => {
    // 3x3 grid positions: 0-8
    const dots: number[] = [];
    if (num === 1) dots.push(4);
    if (num === 2) dots.push(2, 6);
    if (num === 3) dots.push(2, 4, 6);
    if (num === 4) dots.push(0, 2, 6, 8);
    if (num === 5) dots.push(0, 2, 4, 6, 8);
    if (num === 6) dots.push(0, 2, 3, 5, 6, 8);

    return (
      <div className={`flex-1 p-1 grid grid-cols-3 grid-rows-3 gap-0.5 ${vertical ? '' : ''}`}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots.includes(i) && (
              <div className={`${currentSize.dot} bg-black rounded-full shadow-sm`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (hidden) {
    return (
      <div 
        className={`
          ${vertical ? currentSize.w + ' ' + currentSize.h : currentSize.h + ' ' + currentSize.w}
          bg-blue-900 border-2 border-blue-300 rounded-md shadow-md flex items-center justify-center
          ${vertical ? '' : 'rotate-90'}
          ${className}
        `}
        style={style}
      >
        <div className="w-6 h-6 rounded-full border-4 border-blue-400/50"></div>
      </div>
    );
  }

  return (
    <div className={containerClass} onClick={!disabled ? onClick : undefined} style={style}>
      {renderHalf(tile.left)}
      {/* Divider */}
      <div className={`${vertical ? 'h-[1px] w-[90%] mx-auto' : 'w-[1px] h-[90%] my-auto'} bg-gray-400`}></div>
      {renderHalf(tile.right)}
    </div>
  );
};

export default DominoTile;