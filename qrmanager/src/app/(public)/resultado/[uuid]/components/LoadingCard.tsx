// src/app/resultado/[uuid]/components/LoadingCard.tsx
import styles from "./LoadingCard.module.css";

export function LoadingCard() {
  return (
    <div className={styles.card}>
      <div className={`${styles.skeleton} ${styles.headerSkeleton}`} />
      
      <div className={styles.content}>
        {/* Avatar skeleton */}
        <div className={styles.avatarSection}>
          <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
          <div className={styles.textSkeletonGroup}>
            <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} />
          </div>
        </div>

        {/* Data grid skeleton */}
        <div className={styles.gridSkeleton}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${styles.skeleton} ${styles.cellSkeleton}`} />
          ))}
        </div>

        {/* Vigencia bar skeleton */}
        <div className={`${styles.skeleton} ${styles.vigenciaSkeleton}`} />

        {/* UUID box skeleton */}
        <div className={`${styles.skeleton} ${styles.uuidSkeleton}`} />
      </div>
    </div>
  );
}