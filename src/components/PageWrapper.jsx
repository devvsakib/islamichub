import { motion } from 'framer-motion';
import OfflineStatus from './OfflineStatus';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.22,
};

export default function PageWrapper({ children, className = '' }) {
  return (
    <div className="flex flex-col h-full w-full">
      <OfflineStatus />
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className={`flex-1 overflow-y-auto page-content ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

