import React, { useState, useRef, useEffect } from 'react';
import { FLOWER_THEMES } from '../constants';
import { FlowerTheme } from '../types';

interface FlowerWheelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: FlowerTheme) => void;
}

const FlowerWheel: React.FC<FlowerWheelProps> = ({ isOpen, onClose, onSelectTheme }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  if (!isOpen) return null;

  const segmentAngle = 360 / FLOWER_THEMES.length;

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    // Random spins between 5 and 10 full rotations plus a random segment
    const randomOffset = Math.floor(Math.random() * 360);
    const totalRotation = rotation + (360 * 8) + randomOffset;
    
    setRotation(totalRotation);

    // Calculate which segment we land on
    // The pointer is usually at the top (270deg or -90deg visually), 
    // but let's assume pointer is at 0deg (right) for simplicity in math, 
    // then adjust visual pointer to match.
    // CSS Transform rotates clockwise.
    // Winning index calculation:
    const normalizedRotation = totalRotation % 360;
    // We need to map the final rotation to the specific index.
    // This is an approximation for visual effect.
    setTimeout(() => {
       setIsSpinning(false);
       const winningIndex = Math.floor(((360 - (normalizedRotation % 360)) % 360) / segmentAngle);
       const selectedTheme = FLOWER_THEMES[winningIndex];
       if (selectedTheme) {
           onSelectTheme(selectedTheme);
       }
    }, 4000); // 4s matches CSS transition
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Pick Your Style</h2>
        
        <div className="relative w-80 h-80 mb-8">
            {/* Pointer */}
            <div className="absolute top-1/2 -right-4 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[20px] border-r-red-600 z-10 -translate-y-1/2 rotate-180"></div>

            {/* Wheel */}
            <div 
                ref={wheelRef}
                className="w-full h-full rounded-full border-4 border-gray-200 shadow-xl overflow-hidden wheel-spin relative"
                style={{ 
                    transform: `rotate(${rotation}deg)`,
                    background: `conic-gradient(
                        ${FLOWER_THEMES.map((theme, i) => 
                            `${theme.primaryColor} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`
                        ).join(', ')}
                    )`
                }}
            >
               {/* Inner lines/segments decoration could go here */}
            </div>
        </div>

        <div className="flex space-x-4">
             <button 
                onClick={spin}
                disabled={isSpinning}
                className={`px-8 py-3 rounded-full text-white font-bold text-lg shadow-lg transition-transform ${isSpinning ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 active:scale-95'}`}
             >
                {isSpinning ? 'Spinning...' : 'SPIN!'}
             </button>
             <button 
                onClick={onClose}
                disabled={isSpinning}
                className="px-6 py-3 rounded-full text-gray-600 dark:text-gray-300 font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
             >
                Close
             </button>
        </div>
      </div>
    </div>
  );
};

export default FlowerWheel;