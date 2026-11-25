import { api } from '@/boot/axios'

const STORAGE_KEY = 'gear_items'

export const equipmentService = {
  STORAGE_KEY,

  getLocal() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  },

  saveLocal(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  },

  async fetchAll() {
    const localItems = this.getLocal()
    const localMap = new Map(localItems.map((item) => [String(item.id), item]))

    try {
      const { data } = await api.get('/equipments')
      if (Array.isArray(data) && data.length > 0) {
        const merged = data.map((remoteItem) => {
          const localItem = localMap.get(String(remoteItem.id))
          return {
            ...remoteItem,
            image: remoteItem.image || localItem?.image || ''
          }
        })
        this.saveLocal(merged)
        return merged
      }
    } catch {
    }

    return localItems
  },

  async create(record) {
    try {
      const payloadForApi = {
        ...record,
        image: (record.image || '').startsWith('data:') ? '' : (record.image || '')
      }
      const { data } = await api.post('/equipments', payloadForApi)
      if (data?.id) {
        return { ...record, id: String(data.id) }
      }
    } catch {
    }
    return record
  },

  async update(id, updatedRecord) {
    try {
      const payloadForApi = {
        ...updatedRecord,
        image: (updatedRecord.image || '').startsWith('data:') ? '' : (updatedRecord.image || '')
      }
      await api.put(`/equipments/${id}`, payloadForApi)
    } catch {
    }
    return updatedRecord
  },

  async remove(id) {
    try {
      await api.delete(`/equipments/${id}`)
    } catch {
    }
  }
}