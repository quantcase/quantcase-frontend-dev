import { Plugin, CATEGORY_LABELS } from "./types";

interface Props {
  plugins: Plugin[];
  selectedPluginId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
}

export function PluginSidebar({ plugins, selectedPluginId, loading, onSelect }: Props) {
  return (
    <aside className="w-56 shrink-0 border-r border-hair overflow-y-auto bg-card">
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-3 px-3 mb-2">
          Pipelines
        </p>

        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 rounded-md bg-secondary animate-pulse" />
            ))}
          </div>
        ) : plugins.length === 0 ? (
          <p className="text-xs text-ink-3 px-3">No plugins found</p>
        ) : (
          <nav className="space-y-0.5">
            {plugins.map((plugin) => {
              const active = plugin.id === selectedPluginId;
              return (
                <button
                  key={plugin.id}
                  onClick={() => onSelect(plugin.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-secondary text-ink font-medium"
                      : "text-ink-3 hover:bg-secondary hover:text-ink"
                  }`}
                >
                  <span className="block font-medium capitalize">{plugin.name}</span>
                  <span className="block text-[10px] text-ink-3 mt-0.5 uppercase tracking-wide">
                    {CATEGORY_LABELS[plugin.category] ?? plugin.category}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}
