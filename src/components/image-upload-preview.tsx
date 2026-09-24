"use client";

import Image from "next/image";
import {
  Eye,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

type ImageUploadPreviewProps = {
  label?: string;
  fallbackName?: string | null;
  currentImageUrl?: string | null;
  shape?: "square" | "circle";
  disabled?: boolean;
  isDeleting?: boolean;
  helperText?: string;
  onFileSelect: (file: File) => void;
  onDeleteCurrentImage?: () => void;
};

export function ImageUploadPreview({
  label = "Image",
  fallbackName,
  currentImageUrl,
  shape = "square",
  disabled = false,
  isDeleting = false,
  helperText = "PNG, JPG, or WEBP up to 5 MB.",
  onFileSelect,
  onDeleteCurrentImage,
}: ImageUploadPreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl ?? null,
  );

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentImageUrl ?? null);
  }, [currentImageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Unsupported image format", {
        description: "Use PNG, JPG, or WEBP.",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image is too large", {
        description: "The image must be smaller than 5 MB.",
      });
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);

    setPreviewUrl((previous) => {
      if (previous?.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return nextPreviewUrl;
    });

    onFileSelect(file);
  }

  function handleRemove() {
    if (!onDeleteCurrentImage || disabled) return;

    onDeleteCurrentImage();
  }

  const hasImage = Boolean(previewUrl);

  const displayName = fallbackName?.trim() || label;
  const initials = getInitials(displayName);

  const imageShape =
    shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <>
      <div className="space-y-4">
        {/* Image preview */}
        <div className="relative overflow-hidden rounded-2xl border bg-muted/20">
          <div className="flex min-h-64 items-center justify-center p-6 sm:min-h-72">
            {hasImage ? (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                disabled={disabled}
                className={`group relative size-56 overflow-hidden border bg-background shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-64 ${imageShape}`}
                aria-label={`Preview ${label}`}
              >
                <Image
                  src={previewUrl!}
                  alt={label}
                  fill
                  sizes="256px"
                  className="object-contain p-3"
                  unoptimized={previewUrl?.startsWith("blob:")}
                />

                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-full bg-background/95 px-3 py-2 text-xs font-medium shadow-sm">
                    <Eye className="size-4" />
                    View
                  </span>
                </span>
              </button>
            ) : (
              <div
                className={`flex size-56 items-center justify-center border bg-muted/40 text-3xl font-semibold text-muted-foreground shadow-sm sm:size-64 ${imageShape}`}
              >
                {fallbackName ? (
                  initials
                ) : (
                  <ImagePlus className="size-10" />
                )}
              </div>
            )}

            {isDeleting && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-sm">
                  <Loader2 className="size-4 animate-spin" />
                  Removing...
                </div>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="flex items-center justify-between border-t bg-background/80 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {hasImage ? `${label} uploaded` : `No ${label.toLowerCase()} yet`}
              </p>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {hasImage
                  ? "Click the image to preview"
                  : "Upload an image to get started"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {hasImage && onDeleteCurrentImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || isDeleting}
                  onClick={handleRemove}
                  aria-label={`Remove ${label}`}
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mr-2 size-4" />
                {hasImage ? "Change" : "Upload"}
              </Button>
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />

        <p className="text-xs leading-5 text-muted-foreground">
          {helperText}
        </p>
      </div>

      {/* Full image preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{label} preview</DialogTitle>
            <DialogDescription>
              Full size preview of the uploaded {label.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex min-h-[60vh] items-center justify-center bg-muted/20 p-6 sm:p-10">
            {previewUrl && (
              <div className="relative max-h-[75vh] max-w-full">
                <Image
                  src={previewUrl}
                  alt={`${label} preview`}
                  width={900}
                  height={900}
                  className={
                    shape === "circle"
                      ? "max-h-[70vh] w-auto rounded-full object-contain"
                      : "max-h-[70vh] w-auto rounded-xl object-contain"
                  }
                  unoptimized={previewUrl.startsWith("blob:")}
                />
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-4 top-4 rounded-full shadow-sm"
              onClick={() => setPreviewOpen(false)}
              aria-label="Close preview"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "O";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}