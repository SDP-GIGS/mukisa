import { api } from './client'

export const fetchPlacements = (params = {}) =>
  api.get('/placements/', { params }).then((r) => r.data)
export const fetchPlacement = (id) =>
  api.get(`/placements/${id}/`).then((r) => r.data)
export const createPlacement = (payload) =>
  api.post('/placements/', payload).then((r) => r.data)
export const updatePlacement = (id, payload) =>
  api.patch(`/placements/${id}/`, payload).then((r) => r.data)
