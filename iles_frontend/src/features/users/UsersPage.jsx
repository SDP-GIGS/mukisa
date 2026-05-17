import { useEffect, useState } from 'react'
import { createUser, fetchUsers } from '../../api/users'
import { errorMessage } from '../../api/client'
import { Button, Card, DataTable, SelectField, TextField } from '../../components/ui'
import { useNotify } from '../../hooks/useNotify'
import { ROLE_LABELS, ROLES } from '../../utils/constants'

export default function UsersPage() {
  const [data, setData] = useState({ results: [] })
  const [error, setError] = useState('')
  const reload = () => fetchUsers().then(setData).catch((e) => setError(errorMessage(e)))
  useEffect(() => { reload() }, [])

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role_label', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
  ]

  return (
    <div className="grid">
      <NewUserForm onCreated={reload} />
      <Card title="Users">
        {error && <div className="alert">{error}</div>}
        <DataTable columns={columns} rows={data.results} empty="No users found." />
      </Card>
    </div>
  )
}

function NewUserForm({ onCreated }) {
  const notify = useNotify()
  const [form, setForm] = useState({
    email: '', full_name: '', role: ROLES.STUDENT,
    student_number: '', staff_number: '', department: '',
    password: '', phone: '',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await createUser(form)
      notify.success('User created.')
      setForm({ email: '', full_name: '', role: ROLES.STUDENT,
                student_number: '', staff_number: '', department: '',
                password: '', phone: '' })
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
    <Card title="Create user">
      <form onSubmit={onSubmit}>
        <div className="grid grid-2">
          <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
          <TextField label="Full name" name="full_name" value={form.full_name} onChange={onChange} error={errors.full_name} />
          <SelectField
            label="Role" name="role" value={form.role} onChange={onChange}
            options={Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          />
          <TextField label="Department" name="department" value={form.department} onChange={onChange} />
          <TextField label="Student number" name="student_number" value={form.student_number}
                    onChange={onChange} error={errors.student_number} />
          <TextField label="Staff number" name="staff_number" value={form.staff_number}
                    onChange={onChange} error={errors.staff_number} />
          <TextField label="Phone" name="phone" value={form.phone} onChange={onChange} />
          <TextField label="Initial password" name="password" type="password"
                    value={form.password} onChange={onChange} error={errors.password} />
        </div>
        <Button type="submit" loading={busy}>Create user</Button>
      </form>
    </Card>
  )
}
