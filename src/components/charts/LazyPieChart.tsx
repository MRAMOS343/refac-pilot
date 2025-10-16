import { lazy, Suspense } from 'react';
import { ChartSkeleton } from '@/components/ui/chart-skeleton';

const PieChart = lazy(() => import('recharts').then(mod => ({ default: mod.PieChart })));
const Pie = lazy(() => import('recharts').then(mod => ({ default: mod.Pie })));
const Cell = lazy(() => import('recharts').then(mod => ({ default: mod.Cell })));
const Tooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));

interface LazyPieChartProps {
  children?: React.ReactNode;
  height?: number;
  [key: string]: any;
}

export function LazyPieChart({ children, height = 320, ...props }: LazyPieChartProps) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart {...props}>
          {children}
        </PieChart>
      </ResponsiveContainer>
    </Suspense>
  );
}

export { Pie, Cell, Tooltip, ResponsiveContainer };
