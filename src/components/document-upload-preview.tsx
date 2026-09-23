"use client";
import { FileText, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatFileSize } from "@/components/shared-states";
export type DocumentUploadPreviewProps = {
  label?: string;
  currentDocumentUrl?: string | null;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  maxSizeMb?: number;
  onFileSelect: (file: File | null) => void;
  onDeleteCurrentDocument?: () => Promise<void> | void;
  isDeleting?: boolean;
  helperText?: string;
};
export function DocumentUploadPreview({
  label = "Document",
  currentDocumentUrl,
  required,
  disabled,
  accept = "application/pdf",
  maxSizeMb = 10,
  onFileSelect,
  onDeleteCurrentDocument,
  isDeleting,
  helperText,
}: DocumentUploadPreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  function choose(next: File | null) {
    if (!next) return;
    if (
      next.type !== "application/pdf" &&
      !next.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Choose a PDF document.");
      return;
    }
    if (next.size > maxSizeMb * 1024 * 1024) {
      setError(`Document must be smaller than ${maxSizeMb} MB.`);
      return;
    }
    setError(null);
    setFile(next);
    onFileSelect(next);
  }
  function clear() {
    setFile(null);
    setError(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  }
  return (
    <div className="flex flex-col gap-3">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start gap-3">
            <FileText
              className="mt-0.5 size-6 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {file?.name ??
                  (currentDocumentUrl
                    ? "Current PDF document"
                    : "No document selected")}
              </p>
              {file && (
                <p className="text-sm text-muted-foreground">
                  PDF · {formatFileSize(file.size)}
                </p>
              )}
              {helperText && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {helperText}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              className="sr-only"
              type="file"
              accept={accept}
              disabled={disabled}
              onChange={(event) => choose(event.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              {file || currentDocumentUrl ? "Replace document" : "Choose PDF"}
            </Button>
            {file && (
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                onClick={clear}
              >
                <X data-icon="inline-start" />
                Clear selection
              </Button>
            )}
            {currentDocumentUrl && (
              <Button type="button" variant="ghost" asChild>
                <a href={currentDocumentUrl} target="_blank" rel="noreferrer">
                  View current document
                </a>
              </Button>
            )}
            {currentDocumentUrl && onDeleteCurrentDocument && (
              <Button
                type="button"
                variant="ghost"
                disabled={disabled || isDeleting}
                onClick={() => void onDeleteCurrentDocument()}
              >
                {isDeleting ? "Deleting..." : "Delete document"}
              </Button>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
