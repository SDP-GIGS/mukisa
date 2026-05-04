import { useEffect, useState } from 'react'
import { fetchPlacements } from '../../api/placements'
import { errorMessage } from '../../api/client'
import { Card, DataTable } from '../../components/ui'
import { formatDate } from '../../utils/date'

export default function PlacementsPage() {
  const [data, setData] = useState({ results: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlacements()
      .then(setData)
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { key: 'student_name', label: 'Student' },
    { key: 'company_name', label: 'Company' },
    { key: 'workplace_supervisor_name', label: 'Workplace supervisor' },
    { key: 'academic_supervisor_name', label: 'Academic supervisor' },
    { key: 'start_date', label: 'Start', render: (r) => formatDate(r.start_date) },
    { key: 'end_date', label: 'End', render: (r) => formatDate(r.end_date) },
    { key: 'status', label: 'Status' },
  ]

  return (
    <Card title="Placements">
      {error && <div className="alert">{error}</div>}
      {loading
        ? <p className="muted">Loading…</p>
        : <DataTable columns={columns} rows={data.results} empty="No placements found." />
      }
    </Card>
  )
}
