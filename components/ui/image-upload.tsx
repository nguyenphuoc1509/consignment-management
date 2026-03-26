"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadToCloudinary, validateImageFile } from "@/lib/cloudinary";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  error?: string;
  /** "auto" (mặc định 22rem) hoặc "full" để trải rộng toàn khung. */
  maxWidth?: "auto" | "full";
}

export function ImageUpload({ value, onChange, error, maxWidth = "auto" }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      setIsOverLimit(false);

      const validationError = validateImageFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      setIsUploading(true);
      try {
        const result = await uploadToCloudinary(file);
        onChange(result.url);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload thất bại.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(undefined);
    setUploadError(null);
    setIsOverLimit(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={cn(
      "w-full",
      maxWidth === "full" ? "max-w-full" : "max-w-[min(100%,22rem)]"
    )}>
      <div className={cn(
        "relative w-full rounded-2xl overflow-hidden shadow-sm group",
        maxWidth === "full" ? "aspect-[4/3]" : "aspect-[3/4]"
      )}>
        {value ? (
          <>
            <Image    
              src={value}
              alt="Ảnh sản phẩm"
              fill
              sizes={maxWidth === "full"
              ? "(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 40vw"
              : "(max-width: 384px) 100vw, 352px"}
              className="object-contain"
            />
            <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 text-zinc-800 text-sm font-medium rounded-xl shadow-md hover:bg-white transition-colors cursor-pointer"
              >
                <Upload className="size-4" />
                Thay ảnh
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 text-red-500 text-sm font-medium rounded-xl shadow-md hover:bg-white transition-colors cursor-pointer"
              >
                <X className="size-4" />
                Xóa
              </button>
            </div>
          </>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => !isUploading && inputRef.current?.click()}
            onKeyDown={(e) =>
              e.key === "Enter" && !isUploading && inputRef.current?.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 select-none",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border/70 hover:border-primary/60 hover:bg-muted/30",
              (isUploading || isOverLimit) && "pointer-events-none opacity-50"
            )}
          >
            {isUploading ? (
              <>
                {/* Spinner */}
                <div className="relative size-12">
                  <div className="absolute inset-0 rounded-full border-[3px] border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
                </div>
                <div className="text-center space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Đang tải lên...</p>
                  <p className="text-xs text-muted-foreground">Vui lòng chờ</p>
                </div>
              </>
            ) : (
              <>
                {/* Icon wrapper */}
                <div
                  className={cn(
                    "relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200",
                    isDragging
                      ? "bg-primary/10 scale-110"
                      : "bg-muted group-hover:bg-primary/10 group-hover:scale-105"
                  )}
                >
                  <ImageIcon
                    className={cn(
                      "size-6 transition-colors duration-200",
                      isDragging
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary/70"
                    )}
                  />
                  {/* Upload badge */}
                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Upload className="size-3" />
                  </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-1 px-4">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {isDragging ? "Thả ảnh tại đây" : "Kéo thả ảnh hoặc"}
                    {!isDragging && (
                      <>
                        {" "}
                        <span className="text-primary underline underline-offset-2 cursor-pointer hover:text-primary/80 transition-colors">
                          chọn file
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP, GIF — tối đa 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />

      {/* Error message */}
      {(error || uploadError) && (
        <p className="text-xs text-destructive mt-2 px-1">{error ?? uploadError}</p>
      )}
    </div>
  );
}
