'use client'
import React from 'react';
import styles from './ImageWithCaption.module.css';
import Image from 'next/image';

const ImageWithCaption = ({ src, alt, caption, href, width, height }) => {
  const handleClick = () => {
    if (href) {
      window.open(href, '_blank');
    }
  };

  return (
    <div className={styles.card}>
      <div 
        className={styles.imageContainer}
        onClick={handleClick}
        style={{ cursor: href ? 'pointer' : 'default' }}
      >
        <Image
          src={src} 
          alt={alt || caption} 
          className={styles.image}
          width={width}
          height={height}
        />
      </div>
      {caption && (
        <div className={styles.captionContainer}>
          <p className={styles.caption}>{caption}</p>
        </div>
      )}
    </div>
  );
};

export default ImageWithCaption;