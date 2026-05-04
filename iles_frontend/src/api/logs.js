import { api } from './client'

export const fetchLogs = (params = {}) =>
  api.get('/logs/', { params }).then((r) => r.data)

export const fetchLog = (id) =>
  api.get(`/logs/${id}/`).then((r) => r.data)

export const createLog = (payload) =>
  api.post('/logs/', payload).then((r) => r.data)

export const updateLog = (id, payload) =>
  api.patch(`/logs/${id}/`, payload).then((r) => r.data)

export const submitLog = (id) =>
  api.post(`/logs/${id}/submit/`).then((r) => r.data)

export const reviewLog = (id, feedback) =>
  api.post(`/logs/${id}/review/`, { feedback }).then((r) => r.data)

export const approveLog = (id) =>
  api.post(`/logs/${id}/approve/`).then((r) => r.data)

export const rejectLog = (id, reason) =>
  api.post(`/logs/${id}/reject/`, { reason }).then((r) => r.data)

export const requestRevision = (id, message) =>
  api.post(`/logs/${id}/request-revision/`, { message }).then((r) => r.data)
