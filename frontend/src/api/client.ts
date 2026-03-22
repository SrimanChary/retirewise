import axios from 'axios'

const BASE_URL = 'https://retirewise-backend.onrender.com/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
}

export const accountApi = {
  list: () => api.get('/accounts'),
  get: (id: string) => api.get(`/accounts/${id}`),
  create: (data: { type: string; name: string; initialBalance?: number }) =>
    api.post('/accounts', data),
  updateAllocations: (id: string, allocations: Array<{ assetClass: string; percentage: number }>) =>
    api.put(`/accounts/${id}/allocations`, { allocations }),
  reconcile: (id: string) => api.get(`/accounts/${id}/reconcile`),
}

export const transactionApi = {
  list: (accountId: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/accounts/${accountId}/transactions`, { params }),
  create: (accountId: string, data: { type: string; amount: number; description?: string; idempotencyKey?: string }) =>
    api.post(`/accounts/${accountId}/transactions`, data),
}

export const portfolioApi = {
  summary: () => api.get('/portfolio/summary'),
  projection: (data: { currentBalance: number; monthlyContribution: number; annualReturnRate: number; currentAge: number; retirementAge: number }) =>
    api.post('/portfolio/projection', data),
}

export const advisorApi = {
  getAdvice: (data: { age: number; retirementAge: number; salary: number; monthlyContribution: number }) =>
    api.post('/advisor/advice', data),
}

export default api
