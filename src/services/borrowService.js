const STORAGE_KEY = 'gear_borrow_requests'

export const borrowService = {
  STORAGE_KEY,

  getRequests() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  },

  saveRequests(requests) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
  }
}