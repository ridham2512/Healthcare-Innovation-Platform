import React from "react";
import Modal from "./Modal";
import { IconLoader2, IconCheck, IconAlertCircle } from "@tabler/icons-react";

const FileUploadModal = ({
  isOpen,
  onClose,
  onFileChange,
  onFileUpload,
  uploading,
  uploadSuccess,
  uploadError,
  filename,
}) => {
  return (
    <Modal
      title="Upload Medical Report"
      isOpen={isOpen}
      onClose={onClose}
      onAction={onFileUpload}
      actionLabel={
        uploading ? (
          <span className="flex items-center gap-2">
            <IconLoader2 size={15} className="animate-spin" />
            Analyzing…
          </span>
        ) : (
          "Upload & Analyze"
        )
      }
      disabled={uploading}
    >
      {/* Drop zone */}
      <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 transition hover:border-blue-300 hover:bg-blue-50">
        <div className="rounded-full bg-white p-3 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="currentColor"
            className="h-10 w-10 text-blue-400"
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="text-center">
          <label
            htmlFor="fileInputDragDrop"
            className="cursor-pointer text-sm font-semibold text-blue-600 hover:underline"
          >
            <input
              id="fileInputDragDrop"
              type="file"
              className="sr-only"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,application/pdf"
              onChange={onFileChange}
            />
            Browse files
          </label>
          <span className="text-sm text-gray-400"> or drag and drop</span>
        </div>

        <p className="text-xs text-gray-400">
          PNG, JPEG, WebP, GIF, PDF — Max 10MB
        </p>
      </div>

      {/* Selected file */}
      {filename && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="text-sm text-blue-700 font-medium truncate">{filename}</span>
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5">
          <IconAlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{uploadError}</span>
        </div>
      )}

      {/* Success */}
      {uploadSuccess && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-3 py-2">
          <IconCheck size={16} className="text-green-500 flex-shrink-0" />
          <span className="text-sm text-green-700 font-medium">
            Upload & analysis successful!
          </span>
        </div>
      )}
    </Modal>
  );
};

export default FileUploadModal;
