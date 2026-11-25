const STORAGE_KEYS = {
  user: 'gear_user',
  token: 'gear_token',
  users: 'gear_users'
}

export const DEFAULT_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin1234',
    name: 'หัวหน้าดูแลระบบวง/ชมรม',
    role: 'admin',
    position: 'Gear Admin',
    avatar: '',
    phone: '',
    contact: '',
    bio: ''
  },
  {
    id: 3,
    username: 'member',
    password: 'mem1234',
    name: 'สมาชิกวง / สมาชิกชมรม',
    role: 'member',
    position: 'Band Member',
    avatar: '',
    phone: '',
    contact: '',
    bio: ''
  }
]

function normalizeUsers(list) {
  const source = Array.isArray(list) && list.length > 0 ? list : DEFAULT_USERS
  return source
    .filter((u) => u.username !== 'leader' && u.role !== 'leader')
    .map((u) => ({
      ...u,
      password: u.password || (u.username === 'admin' ? 'admin1234' : 'mem1234'),
      role: u.role === 'admin' ? 'admin' : 'member'
    }))
}

export const authService = {
  USERS_KEY: STORAGE_KEYS.users,

  getSession() {
    try {
      const user = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.user) || 'null')
      const token = sessionStorage.getItem(STORAGE_KEYS.token) || ''
      return { user, token }
    } catch {
      return { user: null, token: '' }
    }
  },

  saveSession(user, token) {
    sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
    sessionStorage.setItem(STORAGE_KEYS.token, token)
  },

  clearSession() {
    sessionStorage.removeItem(STORAGE_KEYS.user)
    sessionStorage.removeItem(STORAGE_KEYS.token)
  },
  getUsers() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || 'null')
      return normalizeUsers(saved)
    } catch {
      return normalizeUsers(DEFAULT_USERS)
    }
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(normalizeUsers(users)))
  }
}