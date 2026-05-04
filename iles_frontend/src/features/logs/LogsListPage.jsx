import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchLogs } from '../../api/logs'
import { errorMessage } from '../../api/client'
import { Button, Card, DataTable, SelectField, StatusBadge, TextField } from '../../components/ui'
import { useAuthStore } from '../../auth/store'
import { isStudent, STATUS_LABELS, STATUSES } from '../../utils/constants'
import { formatDate } from '../../utils/date'

export default function LogsListPage() {
  const user = useAuthStore((s) => s.user)
  const nav = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [data, setData] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (status) params.status = status
    fetchLogs(params)
      .then(setData)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, [search, status])

  const columns = [
    { key: 'week_number', label: 'Week', render: (r) => `#${r.week_number}` },
    { key: 'title', label: 'Title', render: (r) => <Link to={`/logs/${r.id}`}>{r.title}</Link> },
    { key: 'student_name', label: 'Student' },
    { key: 'company_name', label: 'Company' },
    {
      key: 'submission_deadline', label: 'Deadline',
      render: (r) => formatDate(r.submission_deadline),
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div className="grid">
      <Card
        title="Weekly logs"
        actions={
          isStudent(user) && (
            <Button onClick={() => nav('/logs/new')}>+ New log</Button>
          )
        }
      >
        <div className="row">
          <TextField
            label="Search" name="q" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, student, or company"
          />
          <SelectField
            label="Status" name="status" value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[{ value: '', label: 'All statuses' }, ...Object.values(STATUSES).map((s) => ({ value: s, label: STATUS_LABELS[s] }))]}
          />
        </div>
        {error && <div className="alert">{error}</div>}
        {loading
          ? <p className="muted">Loading…</p>
          : <DataTable columns={columns} rows={data.results} empty="No logs match your filters." />
        }
        {!loading && data.count > 0 && (
          <p className="muted" style={{ fontSize: '0.85rem' }}>{data.count} log{data.count === 1 ? '' : 's'} total</p>
        )}
      </Card>
    </div>
  )
}
