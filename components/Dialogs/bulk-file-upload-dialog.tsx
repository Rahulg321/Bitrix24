"use client";

import type React from "react";

import { useState, useCallback, useRef, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FilesIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileIcon, formatFileSize } from "@/lib/utils";
import { FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  preview?: string;
}

interface BulkFileUploadDialogProps {
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  children?: React.ReactNode;
}

export function BulkFileUploadDialog({
  acceptedTypes = ["*/*"],
  maxFileSize = 50,
  maxFiles = 10,
  children,
}: BulkFileUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      // Filter out files that exceed size limit
      const validFiles = fileArray.filter((file) => {
        if (file.size > maxFileSize * 1024 * 1024) {
          console.warn(
            `File ${file.name} exceeds size limit of ${maxFileSize}MB`,
          );
          return false;
        }
        return true;
      });

      // Limit total number of files
      const remainingSlots = maxFiles - files.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);

      const uploadFiles: UploadFile[] = await Promise.all(
        filesToAdd.map(async (file) => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: "pending" as const,
          preview: await createFilePreview(file),
        })),
      );

      setFiles((prev) => [...prev, ...uploadFiles]);
    },
    [files.length, maxFileSize, maxFiles],
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    startTransition(async () => {
      try {
        console.log(files);

        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file.file);
        });

        const response = await fetch("/api/bulk-upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        console.log(data);
        toast({
          title: "Files uploaded successfully",
          description: "The files have been uploaded to the server.",
        });

        setFiles([]);
        setIsOpen(false);
      } catch (error) {
        console.error("Upload failed:", error);
        setFiles((prev) => prev.map((f) => ({ ...f, status: "error" })));
        toast({
          title: "Upload failed",
          description: "The files could not be uploaded. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const totalProgress =
    files.length > 0
      ? files.reduce((sum, file) => sum + file.progress, 0) / files.length
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto">
          <div
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-all",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground hover:bg-muted/30",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 text-sm text-foreground">
              Drop files or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Up to {maxFiles} files · {maxFileSize}MB max
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {files.length} selected
                </span>
                {!isPending && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiles([])}
                    className="h-8 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto">
                {files.map((uploadFile) => {
                  const FileIcon = getFileIcon(uploadFile.file.type);

                  return (
                    <div
                      key={uploadFile.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
                    >
                      {uploadFile.preview ? (
                        <img
                          src={uploadFile.preview || "/placeholder.svg"}
                          alt={uploadFile.file.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-muted">
                          <FilesIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </p>

                        {uploadFile.status === "uploading" && (
                          <Progress
                            value={uploadFile.progress}
                            className="mt-2 h-1"
                          />
                        )}
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        {uploadFile.status === "uploading" && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(uploadFile.progress)}%
                          </span>
                        )}
                        {uploadFile.status === "completed" && (
                          <span className="text-xs text-primary">✓</span>
                        )}
                        {uploadFile.status === "error" && (
                          <span className="text-xs text-destructive">✕</span>
                        )}

                        {!isPending && uploadFile.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                            className="h-7 w-7 p-0 hover:bg-destructive/10"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading</span>
                <span>{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-1.5" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isPending}
          >
            {isPending ? (
              <>
                <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Uploading
              </>
            ) : (
              <>Upload</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
