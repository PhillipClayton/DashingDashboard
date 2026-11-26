export default function SlideUpdatedAt({
  updatedAt,
  stale = false,
}: {
  updatedAt?: string;
  stale?: boolean;
}) {
  if (!updatedAt) return null;

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;

  return (
    <p className="slide__meta">
      Updated {new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)}
      {stale && ' · Showing stale data'}
    </p>
  );
}
