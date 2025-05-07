'use client'
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './ImageMagnifier.module.css';
import { Button } from "@/components/ui/button";

interface ImageMagnifierProps {
  src: string;
  srcEn?: string;
  width?: string;
  height?: string;
  zoomLevel?: number;
  minWidth?: string;
  canvasPadding?: string;
}

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  srcEn,
  width = '100%',
  height = 'auto',
  zoomLevel = 2,
  minWidth = '300px',
  canvasPadding = '50px',
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierEnabled, setMagnifierEnabled] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isChinese, setIsChinese] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { left, top, width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    const boundedX = Math.max(0, Math.min(x, containerWidth));
    const boundedY = Math.max(0, Math.min(y, containerHeight));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const toggleMagnifier = () => {
    setMagnifierEnabled(!magnifierEnabled);
    if (!magnifierEnabled) {
      setShowMagnifier(false);
    }
  };

  const toggleLanguage = () => {
    setIsChinese(!isChinese);
  };

  const currentSrc = isChinese ? src : srcEn || src;

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Button 
          onClick={toggleMagnifier}
          variant="default"
          size="default"
        >
          {magnifierEnabled ? '关闭放大镜' : '开启放大镜'}
        </Button>
        {srcEn && (
          <Button
            onClick={toggleLanguage}
            variant="outline"
            size="default"
          >
            {isChinese ? '切换英文' : 'Switch to Chinese'}
          </Button>
        )}
      </div>
      <div
        style={{
          padding: canvasPadding,
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          display: 'inline-block',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <div
          ref={containerRef}
          className={styles.container}
          style={{ 
            width, 
            height,
            minWidth,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'visible',
          }}
          onMouseEnter={() => magnifierEnabled && setShowMagnifier(true)}
          onMouseLeave={() => magnifierEnabled && setShowMagnifier(false)}
          onMouseMove={magnifierEnabled ? handleMouseMove : undefined}
        >
          <Image
            src={currentSrc}
            alt="magnified"
            className={styles.image}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
          />
          {showMagnifier && containerRef.current && magnifierEnabled && (
            <div
              className={styles.magnifier}
              style={{
                backgroundImage: `url(${currentSrc})`,
                backgroundPosition: `${((position.x / containerRef.current.clientWidth) * 100)}% ${((position.y / containerRef.current.clientHeight) * 100)}%`,
                backgroundSize: `${zoomLevel * 100}%`,
                left: position.x,
                top: position.y,
                width: '200px',
                height: '200px',
                position: 'absolute',
                zIndex: 10,
                pointerEvents: 'none',
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageMagnifier;
