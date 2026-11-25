<template>
  <q-page padding>
    <template v-if="authStore.role === 'member'">
      <div class="q-mb-sm">
        <div class="text-h5 text-weight-bold">คลังอุปกรณ์ที่พร้อมให้ยืม</div>
        <div class="text-caption text-grey-7">
          กดปุ่ม "ส่งคำขอยืม" บนอุปกรณ์ที่ต้องการ เพื่อระบุกำหนดคืนและวัตถุประสงค์
        </div>
      </div>

      <EquipmentInventoryTable
        mode="available"
        :rows="equipmentStore.availableEquipments"
        :pending-count-fn="borrowStore.getPendingCountByEquipment"
        no-data-label="ไม่มีอุปกรณ์ว่างในคลัง"
        class="q-mb-xl"
        @preview="openPreview"
        @request="openRequest"
      />
    </template>

    <BorrowQueueTable
      :rows="borrowStore.visibleRequests"
      :is-member="authStore.role === 'member'"
      :is-admin="authStore.isAdmin"
      @approve="handleApprove"
      @reject="borrowStore.reject"
      @cancel-or-return="borrowStore.returnOrCancel"
    />

    <div class="row items-center justify-between q-mb-md q-gutter-sm">
      <div class="text-h5 text-weight-bold">
        {{ authStore.role === 'member' ? 'อุปกรณ์ที่ฉันกำลังถือครอง' : 'จัดการคลังอุปกรณ์ทั้งหมด' }}
      </div>

      <div v-if="authStore.isAdmin" class="row q-gutter-sm">
        <q-select
          v-model="equipmentStore.selectedBorrower"
          :options="filterOptions"
          emit-value
          map-options
          outlined
          dense
          label="กรองผู้ถือครอง / สถานะ"
          style="min-width: 230px"
        />
        <q-btn unelevated color="deep-orange-7" icon="add" label="เพิ่มอุปกรณ์" @click="openCreate()" />
      </div>
    </div>

    <EquipmentInventoryTable
      mode="main"
      :rows="equipmentStore.visibleEquipments"
      :is-admin="authStore.isAdmin"
      :loading="equipmentStore.loading"
      @preview="openPreview"
      @edit="openEdit"
      @delete="removeItem"
    />

    <EquipmentImageDialog v-model="previewOpen" :item="previewItem" />
    <BorrowRequestDialog v-model="requestOpen" :preset-equipment-id="presetId" />
    <EquipmentFormDialog v-model="formOpen" :edit-data="editingRow" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'
import { useEquipmentStore } from '@/stores/equipmentStore'
import { useBorrowStore } from '@/stores/borrowStore'
import BorrowQueueTable from '@/components/BorrowQueueTable.vue'
import EquipmentInventoryTable from '@/components/EquipmentInventoryTable.vue'
import EquipmentImageDialog from '@/components/EquipmentImageDialog.vue'
import BorrowRequestDialog from '@/components/BorrowRequestDialog.vue'
import EquipmentFormDialog from '@/components/EquipmentFormDialog.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const equipmentStore = useEquipmentStore()
const borrowStore = useBorrowStore()

const requestOpen = ref(false)
const presetId = ref('')
const formOpen = ref(false)
const editingRow = ref(null)
const previewOpen = ref(false)
const previewItem = ref(null)

const filterOptions = computed(() => [
  { label: 'ทุกคน (ทั้งหมด)', value: 'ALL' },
  { label: 'ยังไม่ระบุผู้ยืม', value: 'UNASSIGNED' },
  ...authStore.usersList.map((u) => ({
    label: `${u.name} (@${u.username}) [${u.role}]`,
    value: u.username
  }))
])

onMounted(() => equipmentStore.fetchEquipments())
onBeforeUnmount(() => {
  requestOpen.value = false
  formOpen.value = false
  previewOpen.value = false
})

async function handleApprove(requestId) {
  const res = await borrowStore.approve(requestId)
  if (!res.ok) {
    $q.notify({ type: 'warning', message: res.message })
    return
  }
  $q.notify({ type: 'positive', message: 'อนุมัติคำขอและตัดคิวอื่นบนอุปกรณ์นี้เรียบร้อยแล้ว' })
}

function openPreview(row) {
  previewItem.value = row
  previewOpen.value = true
}

function openRequest(id = '') {
  presetId.value = id
  requestOpen.value = true
}

function openCreate() {
  editingRow.value = null
  formOpen.value = true
}

function openEdit(row) {
  editingRow.value = row
  formOpen.value = true
}

function removeItem(row) {
  $q.dialog({
    title: 'ยืนยันการลบ',
    message: `ลบ "${row.name}" ใช่หรือไม่?`,
    cancel: true
  }).onOk(() => equipmentStore.deleteEquipment(row.id))
}
</script>