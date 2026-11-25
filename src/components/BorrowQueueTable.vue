<template>
  <div>
    <div class="text-h5 text-weight-bold q-mb-sm">
      {{ isMember ? 'คำขอยืมและประวัติของฉัน' : 'รายการคำขอยืมอุปกรณ์ (คิวรออนุมัติ / การยืม)' }}
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      flat
      bordered
      class="q-mb-xl"
      no-data-label="ยังไม่มีรายการคำขอยืม"
    >
      <template #body-cell-category="props">
        <q-td :props="props">
          <q-badge v-if="props.row.category" color="blue-grey-2" text-color="dark" :label="props.row.category" />
          <span v-else class="text-grey-6">-</span>
        </q-td>
      </template>

      <template #body-cell-borrower="props">
        <q-td :props="props">
          {{ props.row.borrowerName }} (@{{ props.row.borrowerUsername }})
        </q-td>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="statusColor(props.row.status)"
            :label="props.row.status"
          />
          <div v-if="props.row.note" class="text-caption text-grey-7 q-mt-xs">
            {{ props.row.note }}
          </div>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <div class="row items-center justify-center q-gutter-xs">
            <q-btn
              v-show="isMember && props.row.status === 'Pending'"
              flat
              dense
              color="grey-8"
              label="ยกเลิกคำขอ"
              @click="$emit('cancel-or-return', props.row.id, 'ยกเลิกคำขอ')"
            />
            <q-btn
              v-show="isMember && props.row.status === 'Approved'"
              unelevated
              dense
              color="teal-7"
              label="ส่งคืน"
              @click="$emit('cancel-or-return', props.row.id, 'ส่งคืน')"
            />
            <q-btn
              v-show="isAdmin && props.row.status === 'Pending'"
              unelevated
              dense
              color="positive"
              label="อนุมัติ"
              @click="$emit('approve', props.row.id)"
            />
            <q-btn
              v-show="isAdmin && props.row.status === 'Pending'"
              flat
              dense
              color="negative"
              label="ปฏิเสธ"
              @click="$emit('reject', props.row.id)"
            />
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Array, default: () => [] },
  isMember: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }
})

defineEmits(['approve', 'reject', 'cancel-or-return'])

const columns = [
  { name: 'equipmentName', label: 'อุปกรณ์ที่ขอ', field: 'equipmentName', align: 'left' },
  { name: 'category', label: 'หมวดหมู่', field: 'category', align: 'left' },
  { name: 'borrower', label: 'ผู้ขอยืม', field: 'borrowerName', align: 'left' },
  { name: 'returnDate', label: 'คืนตอนไหน', field: 'returnDate', align: 'left' },
  { name: 'purpose', label: 'เอาไปทำอะไร', field: 'purpose', align: 'left' },
  { name: 'status', label: 'สถานะคำขอ', field: 'status', align: 'center' },
  { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' }
]

function statusColor(status) {
  if (status === 'Pending') return 'amber-9'
  if (status === 'Approved') return 'positive'
  if (status === 'Rejected') return 'negative'
  return 'grey-7'
}
</script>