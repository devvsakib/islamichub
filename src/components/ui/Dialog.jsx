import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogTrigger({ children, asChild }) {
  return <DialogPrimitive.Trigger asChild={asChild}>{children}</DialogPrimitive.Trigger>;
}

export function DialogContent({ children, title, description, className = '' }) {
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[400px] max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[var(--color-parchment)] dark:bg-[var(--color-dark-card)] p-5 shadow-2xl ${className}`}
          >
            <DialogPrimitive.Close className="absolute right-4 top-4 p-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors">
              <IconX size={16} />
            </DialogPrimitive.Close>
            {title && (
              <DialogPrimitive.Title className="text-base font-bold mb-1 text-[var(--color-primary)] dark:text-[var(--color-accent)]">
                {title}
              </DialogPrimitive.Title>
            )}
            {description && (
              <DialogPrimitive.Description className="text-xs text-black/50 dark:text-white/50 mb-3">
                {description}
              </DialogPrimitive.Description>
            )}
            {children}
          </motion.div>
        </DialogPrimitive.Content>
      </AnimatePresence>
    </DialogPrimitive.Portal>
  );
}
