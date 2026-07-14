import { useEffect, useState } from 'react';

interface SecurityScoreProps {
  score: number;
}

export default function SecurityScore({ score }: SecurityScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // 挂载时动画效果
  useEffect(() => {
    const duration = 1000; // 动画持续1秒
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // 缓动函数
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // 根据分数确定颜色
  const getColor = (s: number) => {
    if (s >= 80) return '#00D4AA';
    if (s >= 50) return '#FF9F43';
    return '#FF6B6B';
  };

  const color = getColor(score);

  // SVG 圆环参数
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* 背景圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1E3A5F"
            strokeWidth={strokeWidth}
          />
          {/* 进度圆环 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-300"
          />
        </svg>
        {/* 中心分数 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-bold text-2xl"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="text-[10px] text-vault-text-muted">安全评分</span>
        </div>
      </div>
    </div>
  );
}
