'use client'
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './ImageMagnifier.module.css';

interface ImageMagnifierProps {
  src: string;
  width?: string;
  height?: string;
  zoomLevel?: number;
}

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  width = '100%',
  height = 'auto',
  zoomLevel = 2,
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { left, top, width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // 确保位置在容器范围内
    const boundedX = Math.max(0, Math.min(x, containerWidth));
    const boundedY = Math.max(0, Math.min(y, containerHeight));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ width, height }}
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      <Image
        src={src}
        alt="magnified"
        className={styles.image}
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
      />
      {showMagnifier && containerRef.current && (
        <div
          className={styles.magnifier}
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${(position.x / containerRef.current.clientWidth * 100)}% ${(position.y / containerRef.current.clientHeight * 100)}%`,
            backgroundSize: `${zoomLevel * 100}%`,
            left: position.x,
            top: position.y,
          }}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;
