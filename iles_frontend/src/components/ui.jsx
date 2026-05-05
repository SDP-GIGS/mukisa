/**
 * Small set of reusable UI primitives. Kept deliberately tiny — this
 * file is the entire design system for the project.
 */
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../auth/store'
import { ROLE_LABELS, isAdmin, isStudent, isSupervisor, STATUS_LABELS } from '../utils/constants'

// ---- Buttons ----

export function Button({ children, variant = 'primary', size, type = 'button', disabled, loading, ...rest }) {
  const cls = ['btn']
  if (variant === 'secondary') cls.push('btn-secondary')
  else if (variant === 'danger') cls.push('btn-danger')
  else if (variant === 'success') cls.push('btn-success')
  if (size === 'sm') cls.push('btn-sm')
  return (
    <button type={type} className={cls.join(' ')} disabled={disabled || loading} {...rest}>
      {loading && <span className="spinner" />}
      {children}
    </button>
  )
}

// ---- Form fields ----

export function TextField({ label, name, error, ...rest }) {
  return (
    <div className="field">
      {label && <label htmlFor={name}>{label}</label>}
      <input id={name} name={name} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export function TextAreaField({ label, name, error, rows = 4, ...rest }) {
  return (
    <div className="field">
      {label && <label htmlFor={name}>{label}</label>}
      <textarea id={name} name={name} rows={rows} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

export function SelectField({ label, name, options = [], error, ...rest }) {
  return (
    <div className="field">
      {label && <label htmlFor={name}>{label}</label>}
      <select id={name} name={name} {...rest}>
        {options.map((opt) =>
          typeof opt === 'string'
            ? <option key={opt} value={opt}>{opt}</option>
            : <option key={opt.value} value={opt.value}>{opt.label}</option>,
        )}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

// ---- Cards ----

export function Card({ title, actions, children }) {
  return (
    <section className="card">
      {(title || actions) && (
        <header className="row between card-title">
          {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          {actions}
        </header>
      )}
      <div className="card-body">{children}</div>
    </section>
  )
}

export function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}

// ---- Status badge ----

export function StatusBadge({ status }) {
  if (!status) return null
  return <span className={`badge badge-${status}`}>{STATUS_LABELS[status] || status}</span>
}

// ---- Table ----

export function DataTable({ columns, rows, empty = 'No records.' }) {
  if (!rows?.length) return <div className="table-empty">{empty}</div>
  return (
    <table className="table">
      <thead>
        <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.id ?? i}>
            {columns.map((c) => (
              <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '—'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ---- Layout / navbar ----

export function Layout({ children }) {
  const user = useAuthStore((s) => s.user)
  const clear = useAuthStore((s) => s.clear)
  const nav = useNavigate()

  const handleLogout = () => {
    clear()
    nav('/login', { replace: true })
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <span className="navbar-brand">ILES</span>
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Dashboard</NavLink>
          <NavLink to="/logs" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Weekly Logs</NavLink>
          <NavLink to="/placements" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Placements</NavLink>
          {(isSupervisor(user) || isStudent(user)) && (
            <NavLink to="/evaluations" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Evaluations</NavLink>
          )}
          {isAdmin(user) && (
            <NavLink to="/users" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Users</NavLink>
          )}
        </div>
        <div className="navbar-user">
          <span className="muted">{user?.full_name} · {ROLE_LABELS[user?.role]}</span>
          <Button variant="secondary" size="sm" onClick={handleLogout}>Sign out</Button>
        </div>
      </nav>
      <main className="main">{children}</main>
    </div>
  )
}
