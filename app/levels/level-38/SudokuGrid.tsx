"use client";

import { cn } from "@/lib/utils";

interface SudokuGridProps {
  grid: number[][];
  initialGrid: number[][];
  selectedCell: { row: number; col: number } | null;
  conflicts: boolean[][];
  onCellSelect: (row: number, col: number) => void;
}

export default function SudokuGrid({ 
  grid, 
  initialGrid, 
  selectedCell, 
  conflicts, 
  onCellSelect 
}: SudokuGridProps) {
  
  const getCellClassName = (row: number, col: number) => {
    const isPreFilled = initialGrid[row][col] !== 0;
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const hasConflict = conflicts[row][col];
    const isEmpty = grid[row][col] === 0;
    
    return cn(
      "w-12 h-12 border border-gray-300 flex items-center justify-center text-lg font-bold cursor-pointer transition-all",
      "hover:bg-gray-50",
      
      // Pre-filled cells styling
      isPreFilled && "bg-gray-100 text-gray-800 font-extrabold",
      
      // User-filled cells styling
      !isPreFilled && !isEmpty && "bg-blue-50 text-blue-700",
      
      // Selected cell styling
      isSelected && "bg-indigo-200 border-indigo-500 border-2",
      
      // Conflict styling
      hasConflict && "bg-red-100 text-red-700 border-red-300",
      
      // Empty cell styling
      isEmpty && !isPreFilled && "bg-white hover:bg-gray-50",
      
      // 3x3 box borders - thick borders to separate boxes
      // Top border
      row % 3 === 0 && "border-t-2 border-t-black",
      
      // Bottom border
      (row + 1) % 3 === 0 && "border-b-2 border-b-black",
      
      // Left border
      col % 3 === 0 && "border-l-2 border-l-black",
      
      // Right border
      (col + 1) % 3 === 0 && "border-r-2 border-r-black",
      
      // Disable pointer events for pre-filled cells
      isPreFilled && "cursor-not-allowed"
    );
  };

  return (
    <div className="inline-block bg-black p-1 rounded-lg shadow-lg">
      <div className="grid grid-cols-9 gap-0 bg-white rounded">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex)}
              onClick={() => onCellSelect(rowIndex, colIndex)}
            >
              {cell !== 0 ? cell : ''}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
