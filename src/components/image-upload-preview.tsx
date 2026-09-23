"use client";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AvatarWithFallback } from "@/components/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatFileSize } from "@/components/shared-states";

export type ImageUploadPreviewProps = {
  label?: string;
  currentImageUrl?: string | null;
  fallbackName?: string;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  shape?: "circle" | "square";
  onFileSelect: (file: File | null) => void;
  onDeleteCurrentImage?: () => Promise<void> | void;
  isDeleting?: boolean;
  helperText?: string;
};
export function ImageUploadPreview({
  label = "Image",
  currentImageUrl,
  fallbackName,
  accept = "image/*",
  maxSizeMb = 5,
  disabled,
  shape = "circle",
  onFileSelect,
  onDeleteCurrentImage,
  isDeleting,
  helperText,
}: ImageUploadPreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function choose(next: File | null) {
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (next.size > maxSizeMb * 1024 * 1024) {
      setError(`Image must be smaller than ${maxSizeMb} MB.`);
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
      <Label>{label}</Label>
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div
            className={
              shape === "circle"
                ? "overflow-hidden rounded-full"
                : "overflow-hidden rounded-xl"
            }
          >
            {preview ? (
              <img
                src={preview}
                alt="New image preview"
                className="size-28 object-cover"
              />
            ) : (
              <AvatarWithFallback
                name={fallbackName}
                imageUrl={currentImageUrl}
                size="lg"
                className="size-28"
              />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-sm font-medium">
              {preview
                ? "New image preview"
                : currentImageUrl
                  ? "Current image"
                  : "No image selected"}
            </p>
            {file && (
              <p className="text-sm text-muted-foreground">
                {file.name} · {file.type} · {formatFileSize(file.size)}
              </p>
            )}
            {helperText && (
              <p className="text-sm text-muted-foreground">{helperText}</p>
            )}
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
                <ImagePlus data-icon="inline-start" />
                {preview || currentImageUrl ? "Replace image" : "Choose image"}
              </Button>
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={disabled}
                  onClick={clear}
                >
                  <X data-icon="inline-start" />
                  Remove selection
                </Button>
              )}
              {currentImageUrl && onDeleteCurrentImage && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={disabled || isDeleting}
                  onClick={() => void onDeleteCurrentImage()}
                >
                  {isDeleting ? "Deleting..." : "Delete saved image"}
                </Button>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
