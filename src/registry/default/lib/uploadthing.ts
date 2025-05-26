import React from 'react';
import { toast } from 'sonner';

export interface UploadedFile {
  key: string;
  url: string;
  name: string;
  size: number;
  type: string;
  // Additional metadata can be added as needed
}

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile | null>(null);
  const [uploadingFile, setUploadingFile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setUploadingFile(file);

    try {
      // Create FormData and append the file.
      const formData = new FormData();
      formData.append('file', file);

      // Optionally, if you need to track progress, consider using XMLHttpRequest.
      // For simplicity, we'll use fetch here, which doesn't support progress natively.
      const response = await fetch('/api/supabase-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      // Expect the endpoint to return JSON with file details.
      const data = await response.json();

      // Assuming the endpoint returns a structure like: { file: UploadedFile }
      const uploaded: UploadedFile = data.file;

      setUploadedFile(uploaded);
      onUploadComplete?.(uploaded);

      return uploaded;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
      onUploadError?.(error);
      return null;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(null);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
  };
}
