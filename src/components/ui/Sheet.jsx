import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';

export function Sheet({ open, onOpenChange, children }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function SheetTrigger({ children, asChild }) {
  return <DialogPrimitive.Trigger asChild={asChild}>{children}</DialogPrimitive.Trigger>;
}

export function SheetContent({ children, title, side = 'bottom', className = '' }) {
  const variants = {
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
  };

  const positionClasses = {
    bottom: 'bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] rounded-t-3xl max-h-[85vh]',
    right: 'right-0 top-0 h-full w-[85vw] max-w-[360px] rounded-l-3xl',
  };

  return (
    <DialogPrimitive.Portal>
      <AnimatePresence>
        <DialogPrimitive.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content asChild>
          <motion.div
            initial={variants[side].initial}
            animate={variants[side].animate}
            exit={variants[side].exit}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed z-50 bg-[var(--color-parchment)] dark:bg-[var(--color-dark-card)] shadow-2xl overflow-y-auto ${positionClasses[side]} ${className}`}
          >
            {side === 'bottom' && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20" />
              </div>
            )}
            {title && (
              <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-black/5 dark:border-white/10">
                <h2 className="font-bold text-base">{title}</h2>
                <DialogPrimitive.Close className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <IconX size={18} />
                </DialogPrimitive.Close>
              </div>
            )}
            <div className={title ? 'p-5' : 'px-5 pb-8 pt-2'}>
              {children}
            </div>
          </motion.div>
        </DialogPrimitive.Content>
      </AnimatePresence>
    </DialogPrimitive.Portal>
  );
}
