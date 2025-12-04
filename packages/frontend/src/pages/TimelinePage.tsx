import { useCallback } from 'react';
import { Timeline } from '../components';
import { useApi } from '../hooks';
import { fetchSnapshots, type Snapshot } from '../api';

export function TimelinePage(): JSX.Element {
  const fetchSnapshotsFn = useCallback(() => fetchSnapshots(undefined, 100), []);
  const { data: snapshotsData, loading, error } = useApi(fetchSnapshotsFn);

  const snapshots = snapshotsData?.items || [];

  const handleSnapshotClick = (snapshot: Snapshot): void => {
    // eslint-disable-next-line no-console
    console.log('Snapshot clicked:', snapshot.id);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Timeline</h1>

      {error && (
        <div className="card" style={{ color: 'var(--error)', marginBottom: '1rem' }}>
          Error loading timeline: {error.message}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : (
          <Timeline snapshots={snapshots} onSnapshotClick={handleSnapshotClick} />
        )}
      </div>
    </div>
  );
}
