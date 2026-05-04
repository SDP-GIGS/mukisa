import { api } from './client'

export const fetchEvaluations = (params = {}) =>
  api.get('/evaluations/', { params }).then((r) => r.data)

export const fetchEvaluation = (id) =>
  api.get(`/evaluations/${id}/`).then((r) => r.data)

export const createEvaluation = (payload) =>
  api.post('/evaluations/', payload).then((r) => r.data)

export const fetchWeights = () =>
  api.get('/evaluations/weights/').then((r) => r.data)

export const fetchCriteria = () =>
  api.get('/evaluations/criteria/').then((r) => r.data)
