<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 360px">
      <q-card-section class="bg-deep-orange-7 text-white">
        <div class="text-h6">ส่งคำขอยืมอุปกรณ์</div>
        <div class="text-caption">กรุณาระบุให้ครบทั้ง 3 ช่องก่อนส่งคำขอ</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-select
          v-model="form.equipmentId"
          :options="gearOptions"
          emit-value
          map-options
          label="1. ต้องการยืมอุปกรณ์อะไร *"
          outlined
          dense
        />

        <q-input
          v-model="form.returnDate"
          type="datetime-local"
          label="2. คืนตอนไหน *"
          outlined
          dense
          stack-label
        />

        <q-input
          v-model="form.purpose"
          type="textarea"
          rows="2"
          label="3. เอาไปทำอะไร *"
          outlined
          dense
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
        <q-btn unelevated label="ยืนยันส่งคำขอ" color="deep-orange-7" @click="submit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useEquipmentStore } from '@/stores/equipmentStore'
import { useBorrowStore } from '@/stores/borrowStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  presetEquipmentId: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'submitted'])

const $q = useQuasar()
const equipmentStore = useEquipmentStore()
const borrowStore = useBorrowStore()

const form = ref({ equipmentId: '', returnDate: '', purpose: '' })

const gearOptions = computed(() =>
  equipmentStore.availableEquipments.map((g) => ({
    label: `${g.name} (${g.category})`,
    value: g.id
  }))
)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.value = {
        equipmentId: props.presetEquipmentId || gearOptions.value[0]?.value || '',
        returnDate: '',
        purpose: ''
      }
    }
  }
)

async function submit() {
  const res = await borrowStore.requestBorrow(form.value)
  if (!res.ok) {
    $q.notify({ type: 'warning', message: res.message })
    return
  }
  $q.notify({ type: 'positive', message: 'ส่งคำขอยืมเรียบร้อยแล้ว' })
  emit('submitted')
  emit('update:modelValue', false)
}
</script>