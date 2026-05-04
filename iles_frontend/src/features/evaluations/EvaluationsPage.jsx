import { useEffect, useState } from 'react'
import { createEvaluation, fetchEvaluations, fetchWeights } from '../../api/evaluations'
import { fetchLogs } from '../../api/logs'
import { errorMessage } from '../../api/client'
import { Button, Card, DataTable, SelectField, TextAreaField, TextField } from '../../components/ui'
import { useNotify } from '../../hooks/useNotify'
import { useAuthStore } from '../../auth/store'
import { canApprove, STATUSES } from '../../utils/constants'
import { formatDateTime } from '../../utils/date'

export default function EvaluationsPage() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState({ results: [] })
  const [weights, setWeights] = useState(null)
  const [error, setError] = useState('')

  const reload = () => fetchEvaluations().then(setData).catch((e) => setError(errorMessage(e)))

  useEffect(() => {
    reload()
    fetchWeights().then(setWeights).catch(() => {})
  }, [])

  const columns = [
    { key: 'week_number', label: 'Week' },
    { key: 'student_name', label: 'Student' },
    { key: 'evaluator_name', label: 'Evaluator' },
    { key: 'technical_skills', label: 'Tech' },
    { key: 'communication', label: 'Comm' },
    { key: 'professionalism', label: 'Prof' },
    { key: 'total_score', label: 'Total', render: (r) => Number(r.total_score).toFixed(2) },
    { key: 'created_at', label: 'When', render: (r) => formatDateTime(r.created_at) },
  ]

  return (
    <div className="grid">
      {weights && (
        <Card title="Scoring formula (from server)">
          <p style={{ margin: 0 }}>
            <strong>Total = Tech × {weights.technical_skills}
            + Comm × {weights.communication}
            + Prof × {weights.professionalism}</strong>
            <span className="muted">  (each input 0–100)</span>
          </p>
        </Card>
      )}

      {canApprove(user) && <NewEvaluationForm onCreated={reload} />}

      <Card title="Evaluations">
        {error && <div className="alert">{error}</div>}
        <DataTable columns={columns} rows={data.results} empty="No evaluations recorded yet." />
      </Card>
    </div>
  )
}

function NewEvaluationForm({ onCreated }) {
  const notify = useNotify()
  const [approvedLogs, setApprovedLogs] = useState([])
  const [form, setForm] = useState({
    weekly_log: '', technical_skills: 80, communication: 80, professionalism: 80, remarks: '',
  })
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchLogs({ status: STATUSES.APPROVED, page_size: 100 })
      .then((d) => setApprovedLogs(d.results || []))
      .catch(() => {})
  }, [])

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!form.weekly_log) found.weekly_log = 'Pick an approved log.'
    for (const f of ['technical_skills', 'communication', 'professionalism']) {
      const v = Number(form[f])
      if (!Number.isFinite(v) || v < 0 || v > 100) found[f] = 'Score must be 0–100.'
    }
    setErrors(found)
    if (Object.keys(found).length) return

    setBusy(true)
    try {
      await createEvaluation({
        weekly_log: Number(form.weekly_log),
        technical_skills: Number(form.technical_skills),
        communication: Number(form.communication),
        professionalism: Number(form.professionalism),
        remarks: form.remarks,
      })
      notify.success('Evaluation recorded.')
      setForm({ weekly_log: '', technical_skills: 80, communication: 80, professionalism: 80, remarks: '' })
      onCreated()
    } catch (err) {
      const fields = err?.response?.data?.error?.fields
      if (fields) setErrors(fields)
      else notify.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="New evaluation">
      <form onSubmit={onSubmit}>
        <SelectField
          label="Approved log"
          name="weekly_log"
          value={form.weekly_log}
          onChange={onChange}
          error={errors.weekly_log}
          options={[
            { value: '', label: '— Select an approved log —' },
            ...approvedLogs.map((l) => ({
              value: l.id,
              label: `Week ${l.week_number} · ${l.student_name} · ${l.title}`,
            })),
          ]}
        />
        <div className="grid grid-3">
          <TextField label="Technical skills (0–100)" name="technical_skills" type="number"
                    min={0} max={100} value={form.technical_skills}
                    onChange={onChange} error={errors.technical_skills} />
          <TextField label="Communication (0–100)" name="communication" type="number"
                    min={0} max={100} value={form.communication}
                    onChange={onChange} error={errors.communication} />
          <TextField label="Professionalism (0–100)" name="professionalism" type="number"
                    min={0} max={100} value={form.professionalism}
                    onChange={onChange} error={errors.professionalism} />
        </div>
        <TextAreaField label="Remarks" name="remarks" rows={3}
                      value={form.remarks} onChange={onChange} />
        <Button type="submit" loading={busy}>Save evaluation</Button>
      </form>
    </Card>
  )
}
