import { Card, Spin } from "antd";

interface LoadingFallbackProps {
  message?: string;
}

export default function LoadingFallback({
  message = "Loading...",
}: LoadingFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <Card className="p-8">
        <Spin size="large" />
        <p className="mt-4 text-theme-secondary">{message}</p>
      </Card>
    </div>
  );
}
