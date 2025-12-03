import type { Snapshot } from '../api';

interface TimelineProps {
  snapshots: Snapshot[];
  onSnapshotClick?: (snapshot: Snapshot) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Timeline({ snapshots, onSnapshotClick }: TimelineProps): JSX.Element {
  if (snapshots.length === 0) {
    return (
      <div className="empty-state">
        <h3>No snapshots yet</h3>
        <p>Capture your first snapshot using the Chronicle agent</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {snapshots.map((snapshot) => (
        <div
          key={snapshot.id}
          className="timeline-item"
          onClick={() => onSnapshotClick?.(snapshot)}
          style={{ cursor: onSnapshotClick ? 'pointer' : 'default' }}
        >
          <div className="timeline-time">{formatDate(snapshot.createdAt)}</div>
          <div className="timeline-content">
            <div className="timeline-title">
              v{snapshot.version}
              {snapshot.metadata?.tags?.map((tag) => (
                <span key={tag} className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="timeline-meta">
              {snapshot.metadata?.message && <p>{snapshot.metadata.message}</p>}
              {snapshot.metadata?.gitCommit && (
                <p>
                  <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {snapshot.metadata.gitCommit.substring(0, 7)}
                  </code>
                  {snapshot.metadata?.author && ` by ${snapshot.metadata.author}`}
                </p>
              )}
              {snapshot.artifacts && <p>{snapshot.artifacts.length} artifact(s)</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
