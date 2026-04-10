interface LoaderProps {
  message?: string;
}

export function Loader({ message }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-10 h-10 border-3 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
      {message && <p className="text-sm text-text-secondary">{message}</p>}
    </div>
  );
}
