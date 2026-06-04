'use client';

import styles from './styles.module.css'

export default function ComingSoon() {
  return (
    <div className={styles.comingSoonContainer}>
      <p className="text-primary-blue text-4xl sm:text-8xl font-bold">COMING SOON<span className='text-primary-yellow'>!</span></p>
    </div>
  );
}