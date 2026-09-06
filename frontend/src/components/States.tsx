import { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  className?: string;
}

export default function LoadingSpinner({ className = '' }: Props) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}

export function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <div className="text-4xl mb-2">&#x1F4CB;</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
      {message}
    </div>
  );
}
