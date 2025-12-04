import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks';
import { fetchProjects, createProject, deleteProject, type Project } from '../api';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function Projects(): JSX.Element {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', repository: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProjectsFn = useCallback(() => fetchProjects(), []);
  const { data: projects, loading, error, refetch } = useApi(fetchProjectsFn);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormError(null);

    try {
      await createProject({
        name: formData.name,
        description: formData.description || undefined,
        repository: formData.repository || undefined,
      });
      setFormData({ name: '', description: '', repository: '' });
      setShowForm(false);
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleDelete = async (project: Project): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    try {
      await deleteProject(project.id);
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  return (
    <div className="container">
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create New Project</h3>
          {formError && (
            <div
              style={{
                color: 'var(--error)',
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.375rem',
              }}
            >
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Name *
              </label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <input
                id="description"
                type="text"
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="repository">
                Repository URL
              </label>
              <input
                id="repository"
                type="url"
                className="form-input"
                value={formData.repository}
                onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Create Project
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="card" style={{ color: 'var(--error)' }}>
          Error loading projects: {error.message}
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner" />
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <Link to={`/projects/${project.id}`}>{project.name}</Link>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{project.description || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(project.createdAt)}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      onClick={() => handleDelete(project)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Create your first project to start tracking versions</p>
        </div>
      )}
    </div>
  );
}
