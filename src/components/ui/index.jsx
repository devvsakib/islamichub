import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as SelectPrimitive from '@radix-ui/react-select';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';

// ──── TABS ────
export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <TabsPrimitive.List
      className={`flex gap-1 bg-black/5 dark:bg-white/5 rounded-xl p-1 ${className}`}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ value, children, className = '' }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all
        text-black/50 dark:text-white/50
        data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white
        data-[state=active]:shadow-sm
        ${className}`}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ value, children, className = '' }) {
  return (
    <TabsPrimitive.Content value={value} className={className}>
      {children}
    </TabsPrimitive.Content>
  );
}

// ──── SWITCH ────
export function Switch({ checked, onCheckedChange, id, disabled }) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      id={id}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors focus-visible:outline-none
        bg-black/15 dark:bg-white/15
        data-[state=checked]:bg-[var(--color-primary)]
        disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <SwitchPrimitive.Thumb
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md
          transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0`}
      />
    </SwitchPrimitive.Root>
  );
}

// ──── SELECT ────
export function Select({ value, onValueChange, children }) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      {children}
    </SelectPrimitive.Root>
  );
}

export function SelectTrigger({ children, className = '', placeholder }) {
  return (
    <SelectPrimitive.Trigger
      className={`flex items-center justify-between w-full px-3 py-2 text-sm 
        rounded-xl border border-black/10 dark:border-white/10 
        bg-white dark:bg-white/5
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30
        ${className}`}
    >
      <SelectPrimitive.Value placeholder={placeholder} />
      <SelectPrimitive.Icon>
        <IconChevronDown size={16} className="opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ children }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className="z-[100] overflow-hidden rounded-xl bg-white dark:bg-[var(--color-dark-card)] shadow-2xl border border-black/5 dark:border-white/10"
        position="popper"
        sideOffset={4}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ value, children }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className="relative flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer
        outline-none select-none
        data-[highlighted]:bg-[var(--color-primary)]/10 data-[highlighted]:text-[var(--color-primary)]
        dark:data-[highlighted]:bg-[var(--color-accent)]/10 dark:data-[highlighted]:text-[var(--color-accent)]"
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-auto">
        <IconCheck size={14} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
