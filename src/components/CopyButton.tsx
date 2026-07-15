import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { secureCopy } from '@/utils/clipboard';
import { useItems } from '@/store';

interface CopyButtonProps {
  value: string;
  itemId?: string;
  className?: string;
}

export default function CopyButton({ value, itemId, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { incrementUsage } = useItems();

  const handleCopy = useCallback(async () => {
    const success = await secureCopy(value);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (itemId) {
        incrementUsage(itemId);
      }
    }
  }, [value, itemId, incrementUsage]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'p-1 rounded transition-colors',
        copied
          ? 'text-vault-accent'
          : 'text-vault-text-muted hover:text-vault-text hover:bg-vault-hover',
        className,
      )}
      title={copied ? '已复制' : '复制'}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}
