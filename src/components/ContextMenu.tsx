import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const enabledItems = items.filter((item) => !item.disabled && !item.divider);

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < enabledItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : enabledItems.length - 1
          );
          break;
        case 'Enter': {
          e.preventDefault();
          const currentItem = enabledItems[selectedIndex];
          if (currentItem) {
            currentItem.onClick();
            onClose();
          }
          break;
        }
      }
    },
    [items, onClose, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    const enabledItems = items.filter((item) => !item.disabled && !item.divider);
    if (selectedIndex >= enabledItems.length) {
      setSelectedIndex(0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClickOutside, handleKeyDown, items, selectedIndex]);

  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;

      let adjustedX = position.x;
      let adjustedY = position.y;

      if (adjustedX + rect.width > innerWidth) {
        adjustedX = innerWidth - rect.width - 16;
      }
      if (adjustedY + rect.height > innerHeight) {
        adjustedY = innerHeight - rect.height - 16;
      }

      menu.style.left = `${Math.max(16, adjustedX)}px`;
      menu.style.top = `${Math.max(16, adjustedY)}px`;
    }
  }, [position]);

  const enabledItems = items.filter((item) => !item.disabled && !item.divider);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={menuRef}
        className="fixed z-50 w-56 bg-vault-surface border border-vault-border rounded-lg shadow-xl py-1 animate-fade-in"
        style={{ position: 'fixed' }}
      >
        {items.map((item) => {
          if (item.divider) {
            return (
              <div key={item.id} className="h-px bg-vault-border my-1" />
            );
          }

          const isEnabled = !item.disabled;
          const isSelected =
            isEnabled && enabledItems.indexOf(item) === selectedIndex;

          return (
            <button
              key={item.id}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                isSelected && 'bg-vault-accent/10 text-vault-accent',
                !isSelected && isEnabled && 'text-vault-text hover:bg-vault-hover',
                !isEnabled && 'text-vault-text-muted cursor-not-allowed',
                item.danger && !isSelected && 'text-vault-warn hover:text-vault-warn hover:bg-vault-warn/10'
              )}
              onClick={() => {
                if (isEnabled) {
                  item.onClick();
                  onClose();
                }
              }}
              disabled={!isEnabled}
            >
              {item.icon && (
                <span className={cn('shrink-0', item.danger && 'text-vault-warn')}>
                  {item.icon}
                </span>
              )}
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}