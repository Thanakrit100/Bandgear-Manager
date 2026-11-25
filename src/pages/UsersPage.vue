<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">จัดการผู้ใช้และสิทธิ์ (Admin Only)</div>
        <div class="text-caption text-grey-7">เพิ่มสมาชิก กำหนดรหัสผ่าน และปรับ Role ของผู้ใช้งานในระบบ</div>
      </div>
      <q-btn unelevated color="purple-7" icon="person_add" label="เพิ่มผู้ใช้" @click="dialog = true" />
    </div>

    <q-table :rows="authStore.usersList" :columns="columns" row-key="id" flat bordered>
      <template #body-cell-avatar="props">
        <q-td :props="props">
          <q-avatar size="36px" color="deep-orange-7" text-color="white">
            <q-img v-if="props.row.avatar" :src="props.row.avatar" fit="cover" />
            <span v-else class="text-caption text-weight-bold">
              {{ (props.row.name || props.row.username || 'U').charAt(0).toUpperCase() }}
            </span>
          </q-avatar>
        </q-td>
      </template>

      <template #body-cell-contactInfo="props">
        <q-td :props="props">
          <div v-if="props.row.phone || props.row.contact" class="text-caption">
            <div v-if="props.row.phone">โทร: {{ props.row.phone }}</div>
            <div v-if="props.row.contact">ติดต่อ: {{ props.row.contact }}</div>
          </div>
          <span v-else class="text-grey-6">-</span>
        </q-td>
      </template>

      <template #body-cell-role="props">
        <q-td :props="props">
          <q-select
            :model-value="props.row.role"
            :options="['admin', 'member']"
            dense
            outlined
            @update:model-value="(val) => authStore.changeUserRole(props.row.id, val)"
          />
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            :disable="props.row.username === authStore.user?.username"
            @click="authStore.deleteUser(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 340px">
        <q-card-section><div class="text-h6">เพิ่มผู้ใช้งานใหม่</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="form.username" label="Username *" outlined dense />
          <q-input v-model="form.password" label="Password *" type="password" outlined dense />
          <q-input v-model="form.name" label="ชื่อ-นามสกุล *" outlined dense />
          <q-input v-model="form.position" label="ตำแหน่ง" outlined dense />
          <q-input v-model="form.phone" label="เบอร์โทรศัพท์" outlined dense />
          <q-input v-model="form.contact" label="LINE ID / ช่องทางติดต่อ" outlined dense />
          <q-select v-model="form.role" :options="['admin', 'member']" label="Role *" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
          <q-btn unelevated label="บันทึก" color="purple-7" @click="saveNewUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'

const $q = useQuasar()
const authStore = useAuthStore()
const dialog = ref(false)

function createEmptyForm() {
  return {
    username: '',
    password: '',
    name: '',
    position: '',
    phone: '',
    contact: '',
    role: 'member'
  }
}

const form = ref(createEmptyForm())

const columns = [
  { name: 'avatar', label: 'รูป', field: 'avatar', align: 'center' },
  { name: 'username', label: 'Username', field: 'username', align: 'left' },
  { name: 'name', label: 'ชื่อ-นามสกุล', field: 'name', align: 'left' },
  { name: 'position', label: 'ตำแหน่ง', field: 'position', align: 'left' },
  { name: 'contactInfo', label: 'ช่องทางติดต่อ', field: 'contact', align: 'left' },
  { name: 'role', label: 'Role', field: 'role', align: 'center' },
  { name: 'actions', label: 'ลบ', field: 'actions', align: 'center' }
]

function saveNewUser() {
  const res = authStore.addUser(form.value)
  if (!res.ok) {
    $q.notify({ type: 'warning', message: res.message })
    return
  }

  form.value = createEmptyForm()
  dialog.value = false
  $q.notify({ type: 'positive', message: 'เพิ่มผู้ใช้งานแล้ว' })
}
</script>