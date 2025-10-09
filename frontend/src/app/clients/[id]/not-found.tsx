import ErrorFallback from "@/components/common/ErrorFallback";

export default function NotFound() {
  return (
    <ErrorFallback
      title="Patient Not Found"
      message="The patient you are looking for does not exist or has been removed."
    />
  );
}
