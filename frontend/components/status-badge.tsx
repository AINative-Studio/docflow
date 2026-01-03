'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { DocumentStatus } from '@/lib/supabase/types';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      status: {
        received: 'bg-blue-100 text-blue-800',
        in_review: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        expired: 'bg-slate-100 text-slate-800',
        on_hold: 'bg-purple-100 text-purple-800',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      status: 'received',
      size: 'default',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  /** The document status to display */
  status: DocumentStatus;
  /** Whether to show the status label or use custom children */
  showLabel?: boolean;
}

const statusLabels: Record<DocumentStatus, string> = {
  received: 'Received',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  expired: 'Expired',
  on_hold: 'On Hold',
};

/**
 * StatusBadge - Displays document status with appropriate styling
 *
 * @example
 * ```tsx
 * <StatusBadge status="approved" />
 * <StatusBadge status="in_review" size="lg" />
 * <StatusBadge status="rejected" showLabel={false}>Custom Label</StatusBadge>
 * ```
 */
export function StatusBadge({
  className,
  status,
  size,
  showLabel = true,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`Status: ${statusLabels[status]}`}
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {showLabel ? statusLabels[status] : children}
    </span>
  );
}

export { statusBadgeVariants, statusLabels };
