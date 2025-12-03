import { useCallback } from 'react';
import { StatCard, Timeline } from '../components';
import { useApi } from '../hooks';
import { fetchProjects, fetchSnapshots, type Snapshot } from '../api';

export function Dashboard(): JSX.Element {
  const fetchProjectsFn = useCallback(() => fetchProjects(), []);
  const fetchSnapshotsFn = useCallback(() => fetchSnapshots(), []);

  const { data: projects, loading: projectsLoading } = useApi(fetchProjectsFn);
  const { data: snapshotsData, loading: snapshotsLoading } = useApi(fetchSnapshotsFn);

  const loading = projectsLoading || snapshotsLoading;
  const snapshots = snapshotsData?.items || [];
  const totalSnapshots = snapshotsData?.total || 0;

  const handleSnapshotClick = (snapshot: Snapshot): void => {
    // eslint-disable-next-line no-console
    console.log('Snapshot clicked:', snapshot.id);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <StatCard value={loading ? '...' : projects?.length || 0} label="Total Projects" />
        <StatCard value={loading ? '...' : totalSnapshots} label="Total Snapshots" />
        <StatCard value={loading ? '...' : snapshots[0]?.version || 'N/A'} label="Latest Version" />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activity</h2>
        </div>
        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : (
          <Timeline snapshots={snapshots.slice(0, 10)} onSnapshotClick={handleSnapshotClick} />
        )}
      </div>
    </div>
  );
}
