interface PageEmptyStateProps {
  children: React.ReactNode;
}

export function PageEmptyState({ children }: PageEmptyStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-sm">{children}</div>
    </div>
  );
}
