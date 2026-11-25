<template>
  <q-table
    :rows="rows"
    :columns="columns"
    row-key="id"
    flat
    bordered
    :loading="loading"
    :no-data-label="noDataLabel"
  >
    <template #body-cell-image="props">
      <q-td :props="props">
        <q-img
          v-if="props.row.image"
          :src="props.row.image"
          style="width: 64px; height: 44px; border-radius: 6px"
          fit="cover"
          class="cursor-pointer"
          @click="$emit('preview', props.row)"
        />
        <q-avatar v-else rounded size="44px" color="grey-3" text-color="grey-7" icon="photo_camera" />
      </q-td>
    </template>

    <template #body-cell-category="props">
      <q-td :props="props">
        <q-badge v-if="props.row.category" color="blue-grey-2" text-color="dark" :label="props.row.category" />
        <span v-else class="text-grey-6">-</span>
      </q-td>
    </template>

    <template #body-cell-pendingCount="props">
      <q-td :props="props">
        <q-badge
          v-if="pendingCountFn(props.row.id) > 0"
          color="amber-9"
          text-color="white"
          :label="`รอคิว ${pendingCountFn(props.row.id)} คำขอ`"
        />
        <span v-else class="text-grey-6">-</span>
      </q-td>
    </template>

    <template #body-cell-borrower="props">
      <q-td :props="props">
        {{ props.row.borrowerName ? `${props.row.borrowerName} (@${props.row.borrowerUsername})` : '-' }}
      </q-td>
    </template>

    <template #body-cell-actions="props">
      <q-td :props="props">
        <template v-if="mode === 'available'">
          <q-btn
            unelevated
            dense
            color="deep-orange-7"
            icon="send"
            label="ส่งคำขอยืม"
            @click="$emit('request', props.row.id)"
          />
        </template>

        <template v-else-if="isAdmin">
          <div class="row items-center justify-center q-gutter-xs">
            <q-btn flat dense round icon="edit" color="primary" @click="$emit('edit', props.row)" />
            <q-btn flat dense round icon="delete" color="negative" @click="$emit('delete', props.row)" />
          </div>
        </template>

        <span v-else class="text-grey-6">-</span>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  mode: { type: String, default: 'main' }, 
  isAdmin: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  noDataLabel: { type: String, default: 'ไม่มีข้อมูล' },
  pendingCountFn: { type: Function, default: () => 0 }
})

defineEmits(['preview', 'request', 'edit', 'delete'])

const columns = computed(() => {
  if (props.mode === 'available') {
    return [
      { name: 'image', label: 'รูปภาพ', field: 'image', align: 'center' },
      { name: 'name', label: 'อุปกรณ์', field: 'name', align: 'left' },
      { name: 'category', label: 'หมวดหมู่', field: 'category', align: 'left' },
      { name: 'pendingCount', label: 'คิวคำขอ', field: 'id', align: 'center' },
      { name: 'status', label: 'สถานะ', field: 'status', align: 'center' },
      { name: 'actions', label: 'ขอยืม', field: 'actions', align: 'center' }
    ]
  }

  return [
    { name: 'image', label: 'รูปภาพ', field: 'image', align: 'center' },
    { name: 'name', label: 'อุปกรณ์', field: 'name', align: 'left' },
    { name: 'category', label: 'หมวดหมู่', field: 'category', align: 'left' },
    { name: 'borrower', label: 'ผู้ถือครอง', field: 'borrowerName', align: 'left' },
    { name: 'returnDate', label: 'คืนตอนไหน', field: 'returnDate', align: 'left' },
    { name: 'purpose', label: 'เอาไปทำอะไร', field: 'purpose', align: 'left' },
    { name: 'status', label: 'สถานะ', field: 'status', align: 'center' },
    { name: 'actions', label: 'จัดการ', field: 'actions', align: 'center' }
  ]
})
</script>