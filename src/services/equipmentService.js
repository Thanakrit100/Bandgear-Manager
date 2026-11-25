import { api } from '@/boot/axios'

const STORAGE_KEY = 'gear_items'

const DEFAULT_EQUIPMENTS = [
  {
    id: 'eq-1',
    name: 'Jazz Bass',
    category: 'Bass',
    status: 'Available',
    borrower: null,
    returnDate: null,
    purpose: '',
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=400'
  },
  {
    id: 'eq-2',
    name: 'Bass Amplifier',
    category: 'Amp',
    status: 'Available',
    borrower: null,
    returnDate: null,
    purpose: '',
    image: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=400'
  },
  {
    id: 'eq-3',
    name: 'Dynamic Vocal Mic',
    category: 'Microphone',
    status: 'Available',
    borrower: null,
    returnDate: null,
    purpose: '',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400'
  },
  {
    id: 'eq-4',
    name: 'Digital Audio Mixer',
    category: 'Mixer',
    status: 'Available',
    borrower: null,
    returnDate: null,
    purpose: '',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400'
  }
]

export const equipmentService = {
  STORAGE_KEY,

  getLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === null) {
        this.saveLocal(DEFAULT_EQUIPMENTS)
        return [...DEFAULT_EQUIPMENTS]
      }
      return JSON.parse(raw)
    } catch {
      return [...DEFAULT_EQUIPMENTS]
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