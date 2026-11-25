<template>
  <q-page padding>
    <div class="text-h5 text-weight-bold q-mb-md">
      {{ authStore.role === 'member' ? 'สรุปรายการคำขอและอุปกรณ์ของฉัน' : 'สรุปอุปกรณ์และคำขอแยกตามรายบุคคล' }}
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">
              {{ authStore.role === 'member' ? 'อุปกรณ์ที่ฉันถือครอง' : 'อุปกรณ์ทั้งหมดในคลัง' }}
            </div>
            <div class="text-h4 text-weight-bold">{{ equipmentStore.summaryStats.total }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">รออนุมัติ (Pending)</div>
            <div class="text-h4 text-weight-bold text-orange-8">{{ equipmentStore.summaryStats.pending }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">กำลังยืม (Borrowed)</div>
            <div class="text-h4 text-weight-bold text-blue-8">{{ equipmentStore.summaryStats.borrowed }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-3">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-caption text-grey-7">พร้อมใช้ในคลัง (Available)</div>
            <div class="text-h4 text-weight-bold text-positive">{{ equipmentStore.summaryStats.available }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <template v-if="authStore.isAdmin">
      <div class="text-subtitle1 text-weight-bold q-mb-sm">แยกตามผู้ยืม / ผู้รับผิดชอบรายคน</div>
      <q-table :rows="equipmentStore.summaryByPerson" :columns="personColumns" row-key="borrowerUsername" flat bordered>
        <template #body-cell-person="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.borrowerName }}</div>
            <div v-if="props.row.borrowerUsername" class="text-caption text-grey-7">
              @{{ props.row.borrowerUsername }}
            </div>
          </q-td>
        </template>

        <template #body-cell-manage="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              color="deep-orange-7"
              label="จัดการของคนนี้"
              @click="goManagePerson(props.row.borrowerUsername)"
            />
          </q-td>
        </template>
      </q-table>
    </template>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useEquipmentStore } from '@/stores/equipmentStore'

const router = useRouter()
const authStore = useAuthStore()
const equipmentStore = useEquipmentStore()

onMounted(() => {
  if (equipmentStore.equipments.length === 0) {
    equipmentStore.fetchEquipments()
  }
})

const personColumns = [
  { name: 'person', label: 'ผู้ใช้งาน / รายบุคคล', field: 'borrowerName', align: 'left' },
  { name: 'total', label: 'ถือครอง/ในคลัง', field: 'total', align: 'center' },
  { name: 'pending', label: 'รออนุมัติ', field: 'pending', align: 'center' },
  { name: 'borrowed', label: 'ยืมอยู่', field: 'borrowed', align: 'center' },
  { name: 'available', label: 'ว่าง', field: 'available', align: 'center' },
  { name: 'manage', label: 'จัดการรายคน', field: 'manage', align: 'center' }
]

function goManagePerson(username) {
  equipmentStore.selectedBorrower = username || 'UNASSIGNED'
  router.push('/equipments')
}
</script>