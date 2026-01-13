'use client';

interface ConfidenceIndicatorProps {
  confidence?: number;
  fieldName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceIndicator({ confidence, fieldName, size = 'sm' }: ConfidenceIndicatorProps) {
  if (!confidence && confidence !== 0) {
    return null;
  }

  const percentage = Math.round(confidence * 100);
  const percentageExact = (confidence * 100).toFixed(2);
  const isLowConfidence = confidence < 0.7;
  
  const sizeStyles = {
    sm: 'h-1.5 text-xs',
    md: 'h-2 text-sm',
    lg: 'h-3 text-base',
  };

  const getBgColor = () => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-blue-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLabel = () => {
    if (confidence >= 0.9) return 'Highly confident';
    if (confidence >= 0.7) return 'Confident';
    if (confidence >= 0.5) return 'Low confidence';
    return 'Very low confidence';
  };

  return (
    <div className={`group relative inline-block ${size === 'sm' ? 'cursor-help' : ''}`}>
      <div className="flex items-center gap-2">
        <div className={`w-20 bg-slate-200 rounded-full overflow-hidden ${sizeStyles[size]}`}>
          <div
            className={`${getBgColor()} ${sizeStyles[size]} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`font-medium ${isLowConfidence ? 'text-orange-600' : 'text-slate-600'}`}>
          {percentageExact}%
        </span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        <div className="font-semibold">{getLabel()}</div>
        <div className="text-slate-300">{fieldName && `${fieldName}: `}{percentageExact}% confident</div>
        {isLowConfidence && (
          <div className="text-yellow-300 mt-1">⚠️ May require review</div>
        )}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}
