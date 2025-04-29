import React from 'react';
import styles from './ImageCards.module.css';

export default function ImageCards({ num, children }) {
  // 根据传入的num属性限制显示的卡片数量
  const cards = React.Children.toArray(children).slice(0, num);

  return (
    <div className={styles.container}>
      {cards.map((card, index) => (
        <div key={index} className={styles.cardWrapper}>
          {card}
        </div>
      ))}
    </div>
  );
}

function Card({ arrow, title, href, children }) {
  return (
    <a 
      href={href} 
      className={styles.card}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.imageContainer}>
        {children}
      </div>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>{title}</h3>
          {arrow && <span className={styles.arrow}>→</span>}
        </div>
      </div>
    </a>
  );
}

ImageCards.Card = Card;
