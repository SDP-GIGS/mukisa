import { api } from './client'

export const fetchUsers = (params = {}) =>
  api.get('/users/', { params }).then((r) => r.data)

export const createUser = (payload) =>
  api.post('/users/', payload).then((r) => r.data)

export const updateUser = (id, payload) =>
  api.patch(`/users/${id}/`, payload).then((r) => r.data)

export const fetchDashboard = () =>
  api.get('/dashboard/').then((r) => r.data)
