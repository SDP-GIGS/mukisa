import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  approveLog, fetchLog, rejectLog, requestRevision, reviewLog, submitLog, updateLog,
} from '../../api/logs'
import { errorMessage } from '../../api/client'
import {
  Button, Card, StatusBadge, TextAreaField, TextField,
} from '../../components/ui'
import { useNotify } from '../../hooks/useNotify'
import { useAuthStore } from '../../auth/store'
import {
  availableLogActions, ROLE_LABELS, STATUS_LABELS, STATUSES,
} from '../../utils/constants'
import { formatDate, formatDateTime } from '../../utils/date'

export default function LogDetailPage() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const notify = useNotify()
  const nav = useNavigate()

  const [log, setLog] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  // Inputs for the workflow modals
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [revisionMessage, setRevisionMessage] = useState('')

  useEffect(() => { reload() }, [id])

  async function reload() {
    try { setLog(await fetchLog(id)) }
    catch (e) { setError(errorMessage(e)) }
  }

  async function action(label, fn) {
    setBusy(true)
    try {
      const updated = await fn()
      setLog(updated)
      notify.success(label)
    } catch (e) {
      notify.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (error) return <div className="alert">{error}</div>
  if (!log) return <Card><p className="muted">Loading…</p></Card>

  const actions = availableLogActions(user, log)

  return (
    <div className="grid">
      <Card
        title={`Week ${log.week_number} — ${log.title}`}
        actions={<StatusBadge status={log.status} />}
      >
        <div className="grid grid-2">
          <Field label="Student" value={log.student_name} />
          <Field label="Company" value={log.company_name} />
          <Field label="Period" value={`${formatDate(log.week_start)} → ${formatDate(log.week_end)}`} />
          <Field label="Submission deadline" value={formatDate(log.submission_deadline)} />
          <Field label="Submitted" value={formatDateTime(log.submitted_at)} />
          <Field label="Reviewed" value={
            log.reviewed_at
              ? `${formatDateTime(log.reviewed_at)} by ${log.reviewed_by_name}`
              : '—'
          } />
          <Field label="Approved" value={
            log.approved_at
              ? `${formatDateTime(log.approved_at)} by ${log.approved_by_name}`
              : '—'
          } />
          <Field label="Rejected" value={formatDateTime(log.rejected_at)} />
        </div>

        <Section label="Activities">{log.activities}</Section>
        {log.challenges && <Section label="Challenges">{log.challenges}</Section>}
        {log.lessons_learned && <Section label="Lessons learned">{log.lessons_learned}</Section>}
        {log.review_feedback && <Section label="Review feedback">{log.review_feedback}</Section>}
        {log.rejection_reason && <Section label="Rejection reason">{log.rejection_reason}</Section>}
        {log.revision_request && <Section label="Revision request">{log.revision_request}</Section>}
      </Card>

      {editing && (
        <EditCard
          log={log} onCancel={() => setEditing(false)}
          onSaved={(updated) => { setLog(updated); setEditing(false); notify.success('Draft saved.') }}
        />
      )}

      {actions.length > 0 && !editing && (
        <Card title="Actions">
          <div className="row">
            {actions.includes('edit') && (
              <Button variant="secondary" onClick={() => setEditing(true)}>Edit draft</Button>
            )}
            {actions.includes('submit') && (
              <Button onClick={() => action('Log submitted for review.', () => submitLog(log.id))} loading={busy}>
                Submit for review
              </Button>
            )}
            {actions.includes('approve') && (
              <Button variant="success"
                      onClick={() => action('Log approved.', () => approveLog(log.id))} loading={busy}>
                Approve
              </Button>
            )}
            {actions.includes('review') && (
              <ReviewBlock
                feedback={reviewFeedback} setFeedback={setReviewFeedback} busy={busy}
                onSubmit={() => action('Review saved.', () =>
                  reviewLog(log.id, reviewFeedback).then((u) => { setReviewFeedback(''); return u })
                )}
              />
            )}
            {actions.includes('reject') && (
              <RejectBlock
                reason={rejectReason} setReason={setRejectReason} busy={busy}
                onSubmit={() => action('Log rejected.', () =>
                  rejectLog(log.id, rejectReason).then((u) => { setRejectReason(''); return u })
                )}
              />
            )}
            {actions.includes('request-revision') && (
              <RevisionBlock
                message={revisionMessage} setMessage={setRevisionMessage} busy={busy}
                onSubmit={() => action('Revision requested.', () =>
                  requestRevision(log.id, revisionMessage).then((u) => { setRevisionMessage(''); return u })
                )}
              />
            )}
          </div>
        </Card>
      )}

      <Button variant="secondary" onClick={() => nav('/logs')}>← Back to logs</Button>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{label}</div>
      <div>{value || '—'}</div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginTop: '0.75rem' }}>
      <h4 style={{ marginBottom: '0.25rem' }}>{label}</h4>
      <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{children}</p>
    </div>
  )
}

function EditCard({ log, onCancel, onSaved }) {
  const [form, setForm] = useState({
    title: log.title, activities: log.activities,
    challenges: log.challenges || '', lessons_learned: log.lessons_learned || '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const updated = await updateLog(log.id, form)
      onSaved(updated)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Card title="Edit draft">
      <form onSubmit={onSubmit}>
        {error && <div className="alert">{error}</div>}
        <TextField label="Title" name="title" value={form.title} onChange={onChange} />
        <TextAreaField label="Activities" name="activities" rows={5} value={form.activities} onChange={onChange} />
        <TextAreaField label="Challenges" name="challenges" rows={3} value={form.challenges} onChange={onChange} />
        <TextAreaField label="Lessons learned" name="lessons_learned" rows={3} value={form.lessons_learned} onChange={onChange} />
        <div className="row">
          <Button type="submit" loading={busy}>Save</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

function ReviewBlock({ feedback, setFeedback, busy, onSubmit }) {
  return (
    <div style={{ flex: '1 1 240px' }}>
      <TextAreaField label="Review feedback" name="feedback" rows={3}
                    value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      <Button onClick={onSubmit} loading={busy}>Mark reviewed</Button>
    </div>
  )
}

function RejectBlock({ reason, setReason, busy, onSubmit }) {
  return (
    <div style={{ flex: '1 1 240px' }}>
      <TextAreaField label="Rejection reason (required)" name="reason" rows={3}
                    value={reason} onChange={(e) => setReason(e.target.value)} />
      <Button variant="danger" onClick={onSubmit} loading={busy} disabled={(reason || '').length < 5}>
        Reject
      </Button>
    </div>
  )
}

function RevisionBlock({ message, setMessage, busy, onSubmit }) {
  return (
    <div style={{ flex: '1 1 240px' }}>
      <TextAreaField label="Revision request" name="message" rows={3}
                    value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button variant="secondary" onClick={onSubmit} loading={busy} disabled={(message || '').length < 5}>
        Request revision
      </Button>
    </div>
  )
}
