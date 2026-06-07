import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-[#0A0C10] border border-white/5 rounded-xl overflow-hidden shadow-sm", className)}>
    {children}
  </div>
);

export const MetricCard = ({ 
  label, 
  value, 
  trend, 
  trendValue, 
  prefix = '', 
  suffix = '' 
}: { 
  label: string, 
  value: string | number, 
  trend?: 'up' | 'down' | 'neutral', 
  trendValue?: string | number,
  prefix?: string,
  suffix?: string
}) => (
  <Card className="p-4">
    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">{label}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold tracking-tight">
        {prefix}{value}{suffix}
      </h3>
      {trend && trendValue !== undefined && (
        <span className={cn(
          "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
          trend === 'up' ? "text-blue-400 bg-blue-400/10" : 
          trend === 'down' ? "text-red-400 bg-red-400/10" : 
          "text-gray-400 bg-gray-400/10"
        )}>
          {trend === 'up' ? '+' : ''}{trendValue}%
        </span>
      )}
    </div>
  </Card>
);
