import { useState, useRef } from 'react';

interface Props {
  imageUrl: string;
  focalPoint: string; // "50% 50%"
  onChange: (fp: string) => void;
  className?: string;
}

export default function FocalPointPicker({ imageUrl, focalPoint, onChange, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const [x, y] = focalPoint.split(' ').map(v => parseFloat(v) || 50);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const py = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onChange(`${Math.max(0, Math.min(100, px))}% ${Math.max(0, Math.min(100, py))}%`);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        className="relative cursor-crosshair overflow-hidden rounded border"
        onClick={handleClick}
      >
        <img
          src={imageUrl}
          alt=""
          className="w-full h-40 object-cover"
          style={{ objectPosition: focalPoint }}
          draggable={false}
        />
        {/* Crosshair indicator */}
        <div
          className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-lg pointer-events-none"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            background: 'rgba(37,99,235,0.6)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Klicka på bilden för att välja fokuspunkt ({x}%, {y}%)
      </p>
    </div>
  );
}
