'use client';

import * as React from 'react';
import Link from 'next/link';
import { FileText, Calendar, User, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import type { Document, DocumentWithEmployee } from '@/lib/supabase/types';

export interface DocumentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The document data to display */
  document: Document | DocumentWithEmployee;
  /** Link to view document details */
  href?: string;
  /** Whether to show the employee name (if available) */
  showEmployee?: boolean;
  /** Whether to show download button */
  showDownload?: boolean;
  /** Callback when download is clicked */
  onDownload?: (document: Document | DocumentWithEmployee) => void;
  /** Whether the card is in a loading state */
  isLoading?: boolean;
  /** Compact mode for list views */
  compact?: boolean;
}

/**
 * DocumentCard - Displays document information in a card format
 *
 * @example
 * ```tsx
 * <DocumentCard
 *   document={doc}
 *   href={`/hr/documents/${doc.id}`}
 *   showEmployee
 * />
 * ```
 */
export function DocumentCard({
  className,
  document,
  href,
  showEmployee = false,
  showDownload = false,
  onDownload,
  isLoading = false,
  compact = false,
  ...props
}: DocumentCardProps) {
  const employee = 'employee' in document ? document.employee : null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)} {...props}>
        <CardHeader className={compact ? 'pb-2' : undefined}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        </CardHeader>
        {!compact && (
          <CardContent>
            <div className="h-3 bg-slate-200 rounded w-full" />
          </CardContent>
        )}
      </Card>
    );
  }

  const cardContent = (
    <>
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-slate-900 truncate">
                {document.type || 'Document'}
              </h3>
              <p className="text-sm text-slate-500 truncate">
                {document.file_name}
              </p>
            </div>
          </div>
          <StatusBadge status={document.status} />
        </div>
      </CardHeader>

      {!compact && (
        <CardContent className="space-y-2">
          {showEmployee && employee && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4" aria-hidden="true" />
              <span>{employee.name}</span>
              {employee.email && (
                <span className="text-slate-400">({employee.email})</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{formatDate(document.created_at)}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span>{formatFileSize(document.file_size)}</span>
            <span className="text-slate-300">|</span>
            <span className="capitalize">{document.source}</span>
          </div>
          {document.notes && (
            <p className="text-sm text-slate-600 line-clamp-2">
              {document.notes}
            </p>
          )}
        </CardContent>
      )}

      {showDownload && (
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDownload?.(document);
            }}
            aria-label={`Download ${document.file_name}`}
          >
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            Download
          </Button>
        </CardFooter>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <Card
          className={cn(
            'hover:border-blue-600 transition-colors cursor-pointer',
            className
          )}
          {...props}
        >
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className={className} {...props}>
      {cardContent}
    </Card>
  );
}

/**
 * DocumentCardSkeleton - Loading skeleton for DocumentCard
 */
export function DocumentCardSkeleton({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return <DocumentCard document={{} as Document} isLoading className={className} compact={compact} />;
}
