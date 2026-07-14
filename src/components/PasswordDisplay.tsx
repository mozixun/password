import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import CopyButton from './CopyButton';

interface PasswordDisplayProps {
  password: string;
}

// 根据字符类型获取颜色类名
function getCharClass(char: string): string {
  if (/[a-z]/.test(char)) return 'char-lower';
  if (/[A-Z]/.test(char)) return 'char-upper';
  if (/[0-9]/.test(char)) return 'char-digit';
  return 'char-symbol';
}

export default function PasswordDisplay({ password }: PasswordDisplayProps) {
  const [visible, setVisible] = useState(false);

  // 生成遮罩圆点
  const maskedPassword = '•'.repeat(password.length);

  return (
    <div className="flex items-center gap-1.5 group">
      {/* 密码显示区域 */}
      <div className="flex-1 font-mono text-sm break-all">
        {visible ? (
          // 显示真实密码，按字符类型着色
          <span>
            {password.split('').map((char, index) => (
              <span key={index} className={getCharClass(char)}>
                {char}
              </span>
            ))}
          </span>
        ) : (
          // 遮罩显示
          <span className="text-vault-text-secondary tracking-wider">{maskedPassword}</span>
        )}
      </div>

      {/* 显示/隐藏按钮 */}
      <button
        onClick={() => setVisible(!visible)}
        className="p-1 rounded text-vault-text-muted hover:text-vault-text hover:bg-vault-hover transition-colors shrink-0"
        title={visible ? '隐藏密码' : '显示密码'}
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>

      {/* 复制按钮 */}
      <CopyButton value={password} />
    </div>
  );
}
