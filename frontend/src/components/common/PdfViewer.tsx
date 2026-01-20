"use client";

import { useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface PdfViewerProps {
  fileUrl: string;
  fileName?: string;
  className?: string;
}

export default function PdfViewer({
  fileUrl,
  fileName,
  className = "",
}: PdfViewerProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
        <p className="text-red-500 dark:text-red-400 mb-4">
          Unable to display PDF
        </p>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download PDF
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <iframe
        src={fileUrl}
        title={fileName || "PDF Viewer"}
        className="w-full min-h-[600px] border border-gray-300 dark:border-gray-600 rounded-lg"
        onError={() => setError(true)}
      />
    </div>
  );
}
