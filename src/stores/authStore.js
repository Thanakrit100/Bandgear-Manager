import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const initialSession = authService.getSession()
  const user = ref(initialSession.user)
  const token = ref(initialSession.token)
  const usersList = ref(authService.getUsers())

  const isAuthenticated = computed(() => Boolean(token.value && user.value))
  const role = computed(() => user.value?.role || 'guest')
  const isAdmin = computed(() => role.value === 'admin')
  const canManageGear = computed(() => isAdmin.value)
  const canDeleteGear = computed(() => isAdmin.value)

  function saveUsers() {
    authService.saveUsers(usersList.value)
    usersList.value = authService.getUsers()
  }

  function syncSession(nextUser, nextToken = token.value) {
    user.value = nextUser
    token.value = nextToken
    if (nextUser && nextToken) {
      authService.saveSession(nextUser, nextToken)
    } else {
      authService.clearSession()
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === authService.USERS_KEY && event.newValue) {
        usersList.value = authService.getUsers()
        if (user.value) {
          const latestMe = usersList.value.find((u) => u.id === user.value.id)
          if (latestMe) {
            const { password: _ignored, ...safeUser } = latestMe
            syncSession(safeUser)
          }
        }
      }
    })
  }

  function login({ username, password }) {
    const cleanUser = (username || '').trim().toLowerCase()
    const cleanPass = (password || '').trim()

    if (!cleanUser || !cleanPass) {
      return { ok: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }
    }

    const matched = usersList.value.find(
      (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
    )

    if (!matched) {
      return { ok: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }
    }

    const { password: _ignored, ...safeUser } = matched
    const nextToken = `gear-${safeUser.role}-${Date.now()}`
    syncSession(safeUser, nextToken)

    return { ok: true, user: safeUser }
  }

  function register({ username, password, name, position }) {
    const cleanUser = (username || '').trim().toLowerCase()
    const cleanPass = (password || '').trim()
    const cleanName = (name || '').trim()

    if (!cleanUser || !cleanPass || !cleanName) {
      return { ok: false, message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' }
    }

    if (cleanPass.length < 4) {
      return { ok: false, message: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' }
    }

    const exists = usersList.value.some((u) => u.username.toLowerCase() === cleanUser)
    if (exists) {
      return { ok: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น' }
    }

    usersList.value.push({
      id: Date.now(),
      username: cleanUser,
      password: cleanPass,
      name: cleanName,
      role: 'member',
      position: (position || '').trim() || 'Band Member',
      avatar: '',
      phone: '',
      contact: '',
      bio: ''
    })
    saveUsers()

    return { ok: true }
  }

  function updateProfile(payload) {
    if (!user.value) {
      return { ok: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    const idx = usersList.value.findIndex((u) => u.id === user.value.id)
    if (idx === -1) {
      return { ok: false, message: 'ไม่พบบัญชีผู้ใช้ในระบบ' }
    }

    const updatedAccount = {
      ...usersList.value[idx],
      name: (payload.name || '').trim() || usersList.value[idx].name,
      position: (payload.position || '').trim() || usersList.value[idx].position,
      avatar: (payload.avatar || '').trim(),
      phone: (payload.phone || '').trim(),
      contact: (payload.contact || '').trim(),
      bio: (payload.bio || '').trim()
    }

    usersList.value[idx] = updatedAccount
    saveUsers()

    const { password: _ignored, ...safeUser } = updatedAccount
    syncSession(safeUser)

    return { ok: true, user: safeUser }
  }

  function logout() {
    syncSession(null, '')
  }

  async function checkAuth() {
    if (!token.value || !user.value) {
      logout()
      return false
    }
    return true
  }

  function addUser(payload) {
    if (!isAdmin.value) return { ok: false, message: 'ไม่มีสิทธิ์ดำเนินการ' }

    const cleanUser = (payload.username || '').trim().toLowerCase()
    const cleanPass = (payload.password || '').trim() || '1234'
    const cleanName = (payload.name || '').trim()

    if (!cleanUser || !cleanName) {
      return { ok: false, message: 'กรุณากรอก Username และชื่อ-นามสกุล' }
    }

    if (usersList.value.some((u) => u.username.toLowerCase() === cleanUser)) {
      return { ok: false, message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' }
    }

    usersList.value.push({
      id: Date.now(),
      username: cleanUser,
      password: cleanPass,
      name: cleanName,
      role: payload.role === 'admin' ? 'admin' : 'member',
      position: (payload.position || '').trim() || 'Member',
      avatar: '',
      phone: (payload.phone || '').trim(),
      contact: (payload.contact || '').trim(),
      bio: ''
    })
    saveUsers()
    return { ok: true }
  }

  function changeUserRole(id, nextRole) {
    if (!isAdmin.value) return
    const target = usersList.value.find((u) => u.id === id)
    if (target) {
      target.role = nextRole === 'admin' ? 'admin' : 'member'
      saveUsers()
    }
  }

  function deleteUser(id) {
    if (!isAdmin.value) return
    usersList.value = usersList.value.filter((u) => u.id !== id)
    saveUsers()
  }

  return {
    user,
    token,
    usersList,
    isAuthenticated,
    role,
    isAdmin,
    canManageGear,
    canDeleteGear,
    login,
    register,
    updateProfile,
    logout,
    checkAuth,
    addUser,
    changeUserRole,
    deleteUser
  }
})