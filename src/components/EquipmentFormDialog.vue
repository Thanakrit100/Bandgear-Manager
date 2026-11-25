<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 360px; max-width: 460px">
      <q-card-section class="bg-dark text-white">
        <div class="text-h6">{{ editData ? 'แก้ไขอุปกรณ์ / ผู้ยืม' : 'เพิ่มอุปกรณ์ใหม่เข้าคลัง' }}</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="form.name" label="ชื่ออุปกรณ์ *" outlined dense />
        <q-input v-model="form.category" label="หมวดหมู่" outlined dense />

        <q-file
          v-model="imageFile"
          accept="image/*"
          label="อัปโหลดรูปอุปกรณ์ (ไม่เกิน 600KB)"
          outlined
          dense
          clearable
          @update:model-value="handleFileChange"
        >
          <template #prepend>
            <q-icon name="image" />
          </template>
        </q-file>

        <q-input
          v-model="form.image"
          label="ลิงก์รูปภาพ (URL)"
          placeholder="https://..."
          outlined
          dense
          clearable
        />

        <div v-if="form.image" class="flex flex-center q-pa-xs bg-grey-2 rounded-borders">
          <q-img
            :src="form.image"
            style="width: 150px; height: 100px; border-radius: 6px"
            fit="cover"
          />
        </div>

        <template v-if="editData">
          <q-select
            v-model="form.borrowerUsername"
            :options="assignableOptions"
            emit-value
            map-options
            clearable
            label="ผู้ยืม / ผู้รับผิดชอบ"
            outlined
            dense
          />

          <q-select
            v-model="form.status"
            :options="['Available', 'Pending', 'Borrowed']"
            label="สถานะ"
            outlined
            dense
          />

          <q-input
            v-model="form.returnDate"
            type="datetime-local"
            label="กำหนดคืนตอนไหน"
            outlined
            dense
            stack-label
          />

          <q-input v-model="form.purpose" label="เอาไปทำอะไร" outlined dense />
        </template>

        <q-input v-model="form.note" label="หมายเหตุ" outlined dense />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
        <q-btn unelevated label="บันทึก" color="deep-orange-7" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'
import { useEquipmentStore } from '@/stores/equipmentStore'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editData: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const $q = useQuasar()
const authStore = useAuthStore()
const equipmentStore = useEquipmentStore()

const imageFile = ref(null)
const form = ref({
  name: '',
  category: '',
  image: '',
  borrowerUsername: '',
  status: 'Available',
  returnDate: '',
  purpose: '',
  note: ''
})

const assignableOptions = computed(() =>
  authStore.usersList.map((u) => ({
    label: `${u.name} (@${u.username}) [${u.role}]`,
    value: u.username
  }))
)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    imageFile.value = null
    if (props.editData) {
      form.value = {
        name: props.editData.name || '',
        category: props.editData.category || '',
        image: props.editData.image || '',
        borrowerUsername: props.editData.borrowerUsername || '',
        status: props.editData.status || 'Available',
        returnDate: props.editData.returnDate || '',
        purpose: props.editData.purpose || '',
        note: props.editData.note || ''
      }
    } else {
      form.value = {
        name: '',
        category: '',
        image: '',
        borrowerUsername: '',
        status: 'Available',
        returnDate: '',
        purpose: '',
        note: ''
      }
    }
  }
)

function handleFileChange(file) {
  if (!file) return
  if (file.size > 600 * 1024) {
    $q.notify({
      type: 'warning',
      message: 'ไฟล์รูปใหญ่เกิน 600KB กรุณาย่อรูปหรือใช้ลิงก์ URL แทน'
    })
    imageFile.value = null
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.value.image = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}

async function save() {
  if (!form.value.name.trim()) {
    $q.notify({ type: 'warning', message: 'กรุณากรอกชื่ออุปกรณ์' })
    return
  }

  if (!props.editData) {
    const res = await equipmentStore.addEquipment({
      name: form.value.name,
      category: form.value.category,
      image: form.value.image,
      borrowerUsername: '',
      status: 'Available',
      returnDate: '',
      purpose: '',
      note: form.value.note
    })

    if (res && !res.ok) {
      $q.notify({ type: 'warning', message: res.message })
      return
    }
  } else {
    const nextStatus =
      form.value.borrowerUsername && form.value.status === 'Available'
        ? 'Borrowed'
        : form.value.status

    const res = await equipmentStore.updateEquipment(props.editData.id, {
      ...form.value,
      status: nextStatus
    })

    if (res && !res.ok) {
      $q.notify({ type: 'warning', message: res.message })
      return
    }
  }

  $q.notify({ type: 'positive', message: 'บันทึกข้อมูลเรียบร้อยแล้ว' })
  emit('saved')
  emit('update:modelValue', false)
}
</script>