export function EntityListCard({
  row,
  fields,
  idKey,
  onEdit,
  onDelete,
}: {
  row: any;
  fields: { name: string; label: string }[];
  idKey: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
      <div className="text-xs text-neutral-500 mb-1">ID: {row[idKey]}</div>
      <div className="space-y-1 mb-3">
        {fields.map((f) => (
          <div key={f.name} className="text-sm">
            <span className="text-neutral-500">{f.label}: </span>
            <span>{String(row[f.name] ?? "")}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="btn" onClick={onEdit}>
          Edit
        </button>
        <button className="btn" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
