import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { equipmentService } from '@/services/equipmentService'
import { useAuthStore } from '@/stores/authStore'
import { useBorrowStore } from '@/stores/borrowStore'

export const useEquipmentStore = defineStore('equipment', () => {
  const authStore = useAuthStore()
  const borrowStore = useBorrowStore()

  const equipments = ref(equipmentService.getLocal())
  const selectedBorrower = ref('ALL')
  const loading = ref(false)
  const error = ref('')

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === equipmentService.STORAGE_KEY && event.newValue) {
        equipments.value = equipmentService.getLocal()
      }
    })
  }

  const availableEquipments = computed(() =>
    equipments.value.filter((item) => item.status === 'Available')
  )

  const myEquipments = computed(() => {
    const currentUser = (authStore.user?.username || '').toLowerCase()
    if (!currentUser) return []
    return equipments.value.filter(
      (item) => (item.borrowerUsername || '').toLowerCase() === currentUser
    )
  })

  const visibleEquipments = computed(() => {
    if (authStore.role === 'member') {
      return myEquipments.value
    }

    if (selectedBorrower.value && selectedBorrower.value !== 'ALL') {
      if (selectedBorrower.value === 'UNASSIGNED') {
        return equipments.value.filter((item) => !item.borrowerUsername)
      }
      return equipments.value.filter(
        (item) => (item.borrowerUsername || '').toLowerCase() === selectedBorrower.value.toLowerCase()
      )
    }

    return equipments.value
  })

  const summaryByPerson = computed(() => {
    const map = {}

    const ensureRow = (username, name) => {
      const key = username || 'UNASSIGNED'
      if (!map[key]) {
        map[key] = {
          borrowerUsername: username || '',
          borrowerName: name || 'คลังกลาง / ยังไม่ระบุผู้ยืม',
          total: 0,
          pending: 0,
          borrowed: 0,
          available: 0
        }
      }
      return map[key]
    }

    for (const item of equipments.value) {
      const row = ensureRow(item.borrowerUsername, item.borrowerName)
      row.total += 1
      if (item.status === 'Borrowed') row.borrowed += 1
      if (item.status === 'Available') row.available += 1
    }

    for (const req of borrowStore.requests) {
      if (req.status === 'Pending' && req.borrowerUsername) {
        const row = ensureRow(req.borrowerUsername, req.borrowerName)
        row.pending += 1
      }
    }

    return Object.values(map)
  })

  const summaryStats = computed(() => ({
    total: visibleEquipments.value.length,
    pending: borrowStore.visibleRequests.filter((r) => r.status === 'Pending').length,
    borrowed: visibleEquipments.value.filter((i) => i.status === 'Borrowed').length,
    available: availableEquipments.value.length
  }))

  async function fetchEquipments() {
    loading.value = true
    error.value = ''
    try {
      equipments.value = await equipmentService.fetchAll()
    } catch {
      equipments.value = equipmentService.getLocal()
    } finally {
      loading.value = false
    }
  }

  async function addEquipment(payload) {
    const targetUser = authStore.usersList.find(
      (u) => u.username.toLowerCase() === (payload.borrowerUsername || '').toLowerCase()
    )

    const record = {
      id: String(Date.now()),
      name: (payload.name || '').trim(),
      category: (payload.category || '').trim() || 'General Gear',
      image: (payload.image || '').trim(),
      status: payload.status || (payload.borrowerUsername ? 'Borrowed' : 'Available'),
      borrowerUsername: payload.borrowerUsername || '',
      borrowerName: targetUser?.name || payload.borrowerUsername || '',
      returnDate: payload.returnDate || '',
      purpose: (payload.purpose || '').trim(),
      note: (payload.note || '').trim()
    }

    equipments.value.unshift(record)
    equipmentService.saveLocal(equipments.value)

    const saved = await equipmentService.create(record)
    if (saved.id !== record.id) {
      record.id = saved.id
      equipmentService.saveLocal(equipments.value)
    }

    return { ok: true }
  }

  async function updateEquipment(id, patch) {
    const idx = equipments.value.findIndex((item) => String(item.id) === String(id))
    if (idx === -1) {
      return { ok: false, message: 'ไม่พบรายการอุปกรณ์' }
    }

    const nextPatch = { ...patch }
    if (Object.prototype.hasOwnProperty.call(nextPatch, 'borrowerUsername')) {
      const targetUser = authStore.usersList.find(
        (u) => u.username.toLowerCase() === (nextPatch.borrowerUsername || '').toLowerCase()
      )
      nextPatch.borrowerName = nextPatch.borrowerUsername
        ? targetUser?.name || nextPatch.borrowerUsername
        : ''
    }

    const updated = { ...equipments.value[idx], ...nextPatch }
    equipments.value[idx] = updated
    equipmentService.saveLocal(equipments.value)

    await equipmentService.update(id, updated)
    return { ok: true }
  }

  async function deleteEquipment(id) {
    equipments.value = equipments.value.filter((item) => String(item.id) !== String(id))
    equipmentService.saveLocal(equipments.value)
    await equipmentService.remove(id)
    return { ok: true }
  }

  return {
    equipments,
    selectedBorrower,
    loading,
    error,
    availableEquipments,
    myEquipments,
    visibleEquipments,
    summaryByPerson,
    summaryStats,
    fetchEquipments,
    addEquipment,
    updateEquipment,
    deleteEquipment
  }
})