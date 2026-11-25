import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { borrowService } from '@/services/borrowService'
import { useAuthStore } from '@/stores/authStore'
import { useEquipmentStore } from '@/stores/equipmentStore'

export const useBorrowStore = defineStore('borrow', () => {
  const authStore = useAuthStore()
  const equipmentStore = useEquipmentStore()

  const requests = ref(borrowService.getRequests())

  function persistRequests() {
    borrowService.saveRequests(requests.value)
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === borrowService.STORAGE_KEY && event.newValue) {
        requests.value = borrowService.getRequests()
      }
    })
  }
  const visibleRequests = computed(() => {
    if (authStore.canManageGear) return requests.value
    const currentUser = (authStore.user?.username || '').toLowerCase()
    if (!currentUser) return []
    return requests.value.filter(
      (r) => (r.borrowerUsername || '').toLowerCase() === currentUser
    )
  })

  function getPendingCountByEquipment(equipmentId) {
    return requests.value.filter(
      (r) => String(r.equipmentId) === String(equipmentId) && r.status === 'Pending'
    ).length
  }

  async function requestBorrow(input, legacyNote = '') {
    if (!authStore.user) {
      return { ok: false, message: 'กรุณาเข้าสู่ระบบก่อนส่งคำขอ' }
    }

    const isObj = typeof input === 'object' && input !== null
    const equipmentId = isObj ? input.equipmentId : input
    const returnDate = isObj ? (input.returnDate || '').trim() : ''
    const purpose = isObj ? (input.purpose || '').trim() : (legacyNote || '').trim()

    if (!equipmentId || !returnDate || !purpose) {
      return {
        ok: false,
        message: 'กรุณาระบุให้ครบทั้ง 3 อย่าง: ว่าจะยืมอะไร, คืนตอนไหน และเอาไปทำอะไร'
      }
    }

    const target = equipmentStore.equipments.find(
      (item) => String(item.id) === String(equipmentId)
    )
    if (!target || target.status !== 'Available') {
      return { ok: false, message: 'อุปกรณ์นี้ไม่ว่างหรือถูกยืมไปแล้ว' }
    }

    const alreadyPending = requests.value.some(
      (r) =>
        String(r.equipmentId) === String(equipmentId) &&
        (r.borrowerUsername || '').toLowerCase() === authStore.user.username.toLowerCase() &&
        r.status === 'Pending'
    )
    if (alreadyPending) {
      return { ok: false, message: 'คุณมีคำขอที่รออนุมัติสำหรับอุปกรณ์ชิ้นนี้อยู่แล้ว' }
    }

    const newRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      equipmentId: String(target.id),
      equipmentName: target.name,
      category: target.category || '',
      borrowerUsername: authStore.user.username,
      borrowerName: authStore.user.name,
      returnDate,
      purpose,
      status: 'Pending',
      note: '',
      createdAt: new Date().toISOString()
    }

    requests.value.unshift(newRequest)
    persistRequests()

    return { ok: true, request: newRequest }
  }

  async function approve(requestId) {
    if (!authStore.canManageGear) {
      return { ok: false, message: 'ไม่มีสิทธิ์อนุมัติคำขอ' }
    }

    const reqIdx = requests.value.findIndex((r) => String(r.id) === String(requestId))
    if (reqIdx === -1) {
      return { ok: false, message: 'ไม่พบคำขอยืม' }
    }

    const chosen = requests.value[reqIdx]
    const eq = equipmentStore.equipments.find(
      (item) => String(item.id) === String(chosen.equipmentId)
    )

    if (!eq || eq.status !== 'Available') {
      return { ok: false, message: 'อุปกรณ์ชิ้นนี้ไม่อยู่ในสถานะพร้อมให้ยืมแล้ว' }
    }

    requests.value[reqIdx] = {
      ...chosen,
      status: 'Approved',
      note: `อนุมัติโดย ${authStore.user?.name || authStore.user?.username}`
    }

    requests.value = requests.value.map((r) => {
      if (
        String(r.id) !== String(chosen.id) &&
        String(r.equipmentId) === String(chosen.equipmentId) &&
        r.status === 'Pending'
      ) {
        return {
          ...r,
          status: 'Rejected',
          note: 'อุปกรณ์ถูกอนุมัติให้ผู้ใช้อื่นแล้ว'
        }
      }
      return r
    })

    persistRequests()

    await equipmentStore.updateEquipment(chosen.equipmentId, {
      status: 'Borrowed',
      borrowerUsername: chosen.borrowerUsername,
      borrowerName: chosen.borrowerName,
      returnDate: chosen.returnDate,
      purpose: chosen.purpose,
      note: `ยืมโดย ${chosen.borrowerName} (คืน ${chosen.returnDate})`
    })

    return { ok: true }
  }

  async function reject(requestId, reason = 'คำขอยืมไม่ได้รับการอนุมัติ') {
    const idx = requests.value.findIndex((r) => String(r.id) === String(requestId))
    if (idx === -1) return { ok: false, message: 'ไม่พบคำขอยืม' }

    requests.value[idx] = {
      ...requests.value[idx],
      status: 'Rejected',
      note: reason
    }
    persistRequests()
    return { ok: true }
  }

  async function returnOrCancel(requestId, actionLabel = 'ยกเลิกคำขอ') {
    const idx = requests.value.findIndex((r) => String(r.id) === String(requestId))
    if (idx === -1) return { ok: false, message: 'ไม่พบรายการ' }

    const current = requests.value[idx]

    if (current.status === 'Pending') {
      requests.value[idx] = {
        ...current,
        status: 'Cancelled',
        note: `${actionLabel}โดย ${authStore.user?.name || authStore.user?.username}`
      }
      persistRequests()
      return { ok: true }
    }

    if (current.status === 'Approved') {
      requests.value[idx] = {
        ...current,
        status: 'Returned',
        note: `ส่งคืนโดย ${authStore.user?.name || authStore.user?.username}`
      }
      persistRequests()

      await equipmentStore.updateEquipment(current.equipmentId, {
        status: 'Available',
        borrowerUsername: '',
        borrowerName: '',
        returnDate: '',
        purpose: '',
        note: `ส่งคืนโดย ${authStore.user?.name || authStore.user?.username}`
      })
      return { ok: true }
    }

    return { ok: false, message: 'ไม่สามารถดำเนินการในสถานะนี้ได้' }
  }

  return {
    requests,
    visibleRequests,
    getPendingCountByEquipment,
    requestBorrow,
    approve,
    reject,
    returnOrCancel
  }
})