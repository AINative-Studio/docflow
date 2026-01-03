'use client';

import * as React from 'react';
import { useCallback, useState } from 'react';
import { Upload, X, FileIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

export interface UploadedFile {
  file: FileWithPreview;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export interface FileUploaderProps {
  /** Accepted file types (e.g., '.pdf,image/*') */
  accept?: string;
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number;
  /** Maximum number of files (default: 10) */
  maxFiles?: number;
  /** Whether multiple files can be selected */
  multiple?: boolean;
  /** Whether the uploader is disabled */
  disabled?: boolean;
  /** Callback when files are added */
  onFilesAdded?: (files: FileWithPreview[]) => void;
  /** Callback when a file is removed */
  onFileRemoved?: (file: FileWithPreview, index: number) => void;
  /** Callback when upload starts */
  onUploadStart?: (files: FileWithPreview[]) => void;
  /** Custom upload handler (if not provided, files are just collected) */
  onUpload?: (file: FileWithPreview) => Promise<void>;
  /** Custom validation function */
  validate?: (file: File) => string | null;
  /** Custom class name */
  className?: string;
  /** Show file previews */
  showPreviews?: boolean;
  /** Current files (controlled mode) */
  files?: UploadedFile[];
  /** Set files (controlled mode) */
  setFiles?: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_MAX_FILES = 10;
const DEFAULT_ACCEPT = '.pdf,image/*';

/**
 * FileUploader - Drag-and-drop file upload component with progress tracking
 *
 * @example
 * ```tsx
 * <FileUploader
 *   accept=".pdf,image/*"
 *   maxSize={10 * 1024 * 1024}
 *   multiple
 *   onFilesAdded={(files) => console.log(files)}
 * />
 * ```
 */
export function FileUploader({
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  maxFiles = DEFAULT_MAX_FILES,
  multiple = true,
  disabled = false,
  onFilesAdded,
  onFileRemoved,
  onUploadStart,
  onUpload,
  validate,
  className,
  showPreviews = true,
  files: controlledFiles,
  setFiles: setControlledFiles,
}: FileUploaderProps) {
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use controlled or uncontrolled mode
  const files = controlledFiles ?? internalFiles;
  const setFiles = setControlledFiles ?? setInternalFiles;

  const inputRef = React.useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check custom validation first
      if (validate) {
        const customError = validate(file);
        if (customError) return customError;
      }

      // Check file type
      const acceptedTypes = accept.split(',').map((t) => t.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return `File type not accepted. Please use: ${accept}`;
      }

      // Check file size
      if (file.size > maxSize) {
        return `File too large. Maximum size is ${formatFileSize(maxSize)}`;
      }

      return null;
    },
    [accept, maxSize, validate]
  );

  const processFiles = useCallback(
    (newFiles: File[]) => {
      setError(null);

      // Check max files limit
      if (files.length + newFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      newFiles.forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
        } else {
          const fileWithPreview = file as FileWithPreview;
          fileWithPreview.id = crypto.randomUUID();
          if (file.type.startsWith('image/')) {
            fileWithPreview.preview = URL.createObjectURL(file);
          }
          validFiles.push(fileWithPreview);
        }
      });

      if (errors.length > 0) {
        setError(errors.join('\n'));
      }

      if (validFiles.length > 0) {
        const uploadedFiles: UploadedFile[] = validFiles.map((file) => ({
          file,
          progress: 0,
          status: 'pending' as const,
        }));

        setFiles((prev) => [...prev, ...uploadedFiles]);
        onFilesAdded?.(validFiles);

        if (onUpload) {
          onUploadStart?.(validFiles);
          // Start uploads
          uploadedFiles.forEach(async (uploadedFile, index) => {
            const fileIndex = files.length + index;
            setFiles((prev) =>
              prev.map((f, i) =>
                i === fileIndex ? { ...f, status: 'uploading' as const, progress: 0 } : f
              )
            );

            try {
              await onUpload(uploadedFile.file);
              setFiles((prev) =>
                prev.map((f, i) =>
                  i === fileIndex ? { ...f, status: 'complete' as const, progress: 100 } : f
                )
              );
            } catch (err) {
              setFiles((prev) =>
                prev.map((f, i) =>
                  i === fileIndex
                    ? {
                        ...f,
                        status: 'error' as const,
                        error: err instanceof Error ? err.message : 'Upload failed',
                      }
                    : f
                )
              );
            }
          });
        }
      }
    },
    [files.length, maxFiles, validateFile, setFiles, onFilesAdded, onUpload, onUploadStart]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [disabled, processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);
        // Reset input
        e.target.value = '';
      }
    },
    [processFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const file = files[index];
      if (file.file.preview) {
        URL.revokeObjectURL(file.file.preview);
      }
      setFiles((prev) => prev.filter((_, i) => i !== index));
      onFileRemoved?.(file.file, index);
    },
    [files, setFiles, onFileRemoved]
  );

  const handleBrowseClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBrowseClick();
      }
    },
    [handleBrowseClick]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files by dropping them here or clicking to browse"
        aria-disabled={disabled}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 md:p-12 text-center transition-colors cursor-pointer',
          isDragging && !disabled
            ? 'border-blue-600 bg-blue-50'
            : 'border-slate-300 hover:border-blue-600',
          disabled && 'opacity-50 cursor-not-allowed hover:border-slate-300'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        onKeyDown={handleKeyDown}
      >
        <Upload
          className={cn(
            'h-12 w-12 mx-auto mb-4',
            isDragging ? 'text-blue-600' : 'text-slate-400'
          )}
          aria-hidden="true"
        />
        <p className="text-lg font-medium text-slate-900 mb-2">
          {isDragging ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p className="text-sm text-slate-600 mb-4">or click to browse from your device</p>
        <Input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          id="file-upload"
          aria-describedby="file-upload-description"
        />
        <Label htmlFor="file-upload" className="sr-only">
          Choose files to upload
        </Label>
        <Button type="button" variant="outline" disabled={disabled} asChild>
          <span>Browse Files</span>
        </Button>
        <p id="file-upload-description" className="text-xs text-slate-500 mt-4">
          Supports {accept.replace(/,/g, ', ')} up to {formatFileSize(maxSize)} each
          {multiple && ` (max ${maxFiles} files)`}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span className="whitespace-pre-line">{error}</span>
        </div>
      )}

      {/* File list */}
      {showPreviews && files.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files ({files.length})</Label>
          <ul className="space-y-2" role="list" aria-label="Selected files">
            {files.map((uploadedFile, index) => (
              <li
                key={uploadedFile.file.id || index}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
              >
                {/* Preview or icon */}
                {uploadedFile.file.preview ? (
                  <img
                    src={uploadedFile.file.preview}
                    alt={`Preview of ${uploadedFile.file.name}`}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div
                    className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <FileIcon className="h-6 w-6 text-slate-500" />
                  </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>

                  {/* Progress bar */}
                  {uploadedFile.status === 'uploading' && (
                    <Progress
                      value={uploadedFile.progress}
                      className="h-1 mt-2"
                      aria-label={`Upload progress: ${uploadedFile.progress}%`}
                    />
                  )}

                  {/* Error message */}
                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                  )}
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  {uploadedFile.status === 'uploading' && (
                    <Loader2
                      className="h-5 w-5 text-blue-600 animate-spin"
                      aria-label="Uploading"
                    />
                  )}
                  {uploadedFile.status === 'complete' && (
                    <CheckCircle className="h-5 w-5 text-green-600" aria-label="Upload complete" />
                  )}
                  {uploadedFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" aria-label="Upload failed" />
                  )}

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploadedFile.status === 'uploading'}
                    aria-label={`Remove ${uploadedFile.file.name}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
