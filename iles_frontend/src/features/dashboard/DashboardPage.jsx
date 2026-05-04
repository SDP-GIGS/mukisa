import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboard } from '../../api/users'
import { errorMessage } from '../../api/client'
import { Card, Stat, StatusBadge } from '../../components/ui'
import { useAuthStore } from '../../auth/store'
import { ROLE_LABELS, STATUS_LABELS } from '../../utils/constants'
import { formatDate, formatDateTime } from '../../utils/date'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard().then(setData).catch((e) => setError(errorMessage(e)))
  }, [])

  if (error) return <div className="alert">{error}</div>
  if (!data) return <Card><p className="muted">Loading…</p></Card>

  return (
    <div className="grid" style={{ gap: '1rem' }}>
      <div>
        <h2>Welcome, {user?.full_name?.split(' ')[0] || 'there'}</h2>
        <p className="muted">{ROLE_LABELS[user?.role]} dashboard</p>
      </div>
      {data.role === 'student' && <StudentBoard data={data} />}
      {data.role === 'workplace_supervisor' && <WorkplaceBoard data={data} />}
      {data.role === 'academic_supervisor' && <AcademicBoard data={data} />}
      {data.role === 'admin' && <AdminBoard data={data} />}
    </div>
  )
}

// --- Student ---

function StudentBoard({ data }) {
  return (
    <>
      <div className="grid grid-3">
        <Stat label="Total logs" value={data.total_logs} />
        <Stat label="Approved" value={data.log_counts.approved} />
        <Stat label="Awaiting review" value={data.log_counts.submitted} />
        <Stat label="Drafts" value={data.log_counts.draft} />
        <Stat label="Average score" value={data.average_score?.toFixed(1) ?? '—'} />
        <Stat label="Placement" value={data.has_placement ? 'Active' : 'None'} />
      </div>
      <Card title="Recent logs" actions={<Link to="/logs">View all →</Link>}>
        {data.recent_logs.length === 0
          ? <p className="muted">You have no logs yet. Create your first one.</p>
          : <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
              {data.recent_logs.map((l) => (
                <li key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                  <Link to={`/logs/${l.id}`}>Week {l.week_number} — {l.title}</Link>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
        }
      </Card>
    </>
  )
}

// --- Workplace supervisor ---

function WorkplaceBoard({ data }) {
  return (
    <>
      <div className="grid grid-3">
        <Stat label="Students supervised" value={data.students_supervised} />
        <Stat label="Awaiting review" value={data.awaiting_review} />
        <Stat label="Reviewed" value={data.log_counts.reviewed} />
        <Stat label="Approved" value={data.log_counts.approved} />
      </div>
      <Card title="Recent submissions awaiting review" actions={<Link to="/logs">All logs →</Link>}>
        {data.recent_submissions.length === 0
          ? <p className="muted">No logs need your review right now.</p>
          : <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
              {data.recent_submissions.map((l) => (
                <li key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                  <Link to={`/logs/${l.id}`}>Week {l.week_number} — {l.student__full_name}</Link>
                  <span className="muted">{formatDateTime(l.submitted_at)}</span>
                </li>
              ))}
            </ul>
        }
      </Card>
    </>
  )
}

// --- Academic supervisor ---

function AcademicBoard({ data }) {
  return (
    <>
      <div className="grid grid-3">
        <Stat label="Students supervised" value={data.students_supervised} />
        <Stat label="Awaiting approval" value={data.awaiting_approval} />
        <Stat label="Evaluations given" value={data.evaluations_given} />
        <Stat label="Avg score" value={data.average_score_given?.toFixed(1) ?? '—'} />
      </div>
      <Card title="Logs awaiting approval" actions={<Link to="/logs">All logs →</Link>}>
        {data.to_approve.length === 0
          ? <p className="muted">All caught up.</p>
          : <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
              {data.to_approve.map((l) => (
                <li key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                  <Link to={`/logs/${l.id}`}>Week {l.week_number} — {l.student__full_name}</Link>
                  <span className="muted">reviewed {formatDateTime(l.reviewed_at)}</span>
                </li>
              ))}
            </ul>
        }
      </Card>
    </>
  )
}

// --- Admin ---

function AdminBoard({ data }) {
  return (
    <>
      <div className="grid grid-3">
        {Object.entries(data.user_counts).map(([role, n]) => (
          <Stat key={role} label={`${ROLE_LABELS[role] || role}s`} value={n} />
        ))}
      </div>
      <div className="grid grid-3">
        <Stat label="Active placements" value={data.active_placements} />
        <Stat label="Total placements" value={data.total_placements} />
        <Stat label="Average score" value={data.average_score?.toFixed(1) ?? '—'} />
        <Stat label="Overdue submissions" value={data.overdue_submissions} />
      </div>
      <Card title="Log status breakdown">
        <div className="grid grid-3">
          {Object.entries(data.log_counts).map(([status, n]) => (
            <div key={status} className="row between" style={{ padding: '0.4rem 0' }}>
              <StatusBadge status={status} />
              <strong>{n}</strong>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
