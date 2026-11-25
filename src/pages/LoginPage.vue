<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="window-height window-width flex flex-center bg-grey-2 q-pa-md">
        <q-card class="q-pa-lg shadow-3" style="width: 100%; max-width: 440px">
          <q-card-section class="text-center">
            <q-icon name="speaker_group" size="54px" color="deep-orange-7" />
            <div class="text-h5 text-weight-bold q-mt-sm">Band & Gear Manager</div>
            <div class="text-caption text-grey-7">ระบบจัดการอุปกรณ์และสิทธิ์การใช้งานตามบัญชีผู้ใช้</div>
          </q-card-section>

          <q-card-section class="q-gutter-md">
            <q-input v-model="username" label="ชื่อผู้ใช้ (Username)" outlined dense />
            <q-input
              v-model="password"
              label="รหัสผ่าน (Password)"
              type="password"
              outlined
              dense
              @keyup.enter="handleLogin"
            />

            <q-btn
              unelevated
              color="deep-orange-7"
              label="เข้าสู่ระบบ"
              class="full-width"
              @click="handleLogin"
            />

            <q-btn
              outline
              color="dark"
              icon="person_add"
              label="Create Account (สมัครสมาชิกใหม่)"
              class="full-width"
              @click="openRegister"
            />

            <q-separator />

            <div class="text-caption text-grey-7 text-center">ทดสอบล็อกอินด่วนตาม Role</div>
            <div class="row q-gutter-xs justify-center">
              <q-btn
                size="sm"
                outline
                color="purple-7"
                label="Admin"
                @click="quickLogin('admin', 'admin1234')"
              />
              <q-btn
                size="sm"
                outline
                color="primary"
                label="Member"
                @click="quickLogin('member', 'mem1234')"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-dialog v-model="registerDialog">
          <q-card style="min-width: 360px">
            <q-card-section class="bg-dark text-white">
              <div class="text-h6">Create Account</div>
              <div class="text-caption text-grey-4">
                บัญชีที่สมัครใหม่จะได้รับสิทธิ์เริ่มต้นเป็น Member
              </div>
            </q-card-section>

            <q-card-section class="q-gutter-md">
              <q-input v-model="regForm.username" label="ชื่อผู้ใช้ (Username) *" outlined dense />
              <q-input
                v-model="regForm.password"
                label="รหัสผ่าน (Password) *"
                type="password"
                outlined
                dense
              />
              <q-input
                v-model="regForm.confirmPassword"
                label="ยืนยันรหัสผ่าน (Confirm Password) *"
                type="password"
                outlined
                dense
              />
              <q-input v-model="regForm.name" label="ชื่อ-นามสกุล *" outlined dense />
              <q-input
                v-model="regForm.position"
                label="ตำแหน่งในวง / ชมรม (เช่น Bass, Guitar, Sound)"
                outlined
                dense
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
              <q-btn unelevated label="สร้างบัญชี" color="deep-orange-7" @click="handleRegister" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'

const username = ref('')
const password = ref('')
const registerDialog = ref(false)
const regForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  position: ''
})

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

function handleLogin() {
  const res = authStore.login({
    username: username.value,
    password: password.value
  })

  if (!res.ok) {
    $q.notify({ type: 'warning', message: res.message })
    return
  }

  $q.notify({ type: 'positive', message: `เข้าสู่ระบบสำเร็จ (${authStore.role})` })
  router.replace('/equipments')
}

function quickLogin(userVal, passVal) {
  username.value = userVal
  password.value = passVal
  handleLogin()
}

function openRegister() {
  regForm.value = {
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    position: ''
  }
  registerDialog.value = true
}

function handleRegister() {
  if (regForm.value.password !== regForm.value.confirmPassword) {
    $q.notify({ type: 'warning', message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' })
    return
  }

  const res = authStore.register({
    username: regForm.value.username,
    password: regForm.value.password,
    name: regForm.value.name,
    position: regForm.value.position
  })

  if (!res.ok) {
    $q.notify({ type: 'warning', message: res.message })
    return
  }

  $q.notify({ type: 'positive', message: 'สร้างบัญชีสำเร็จ สามารถเข้าสู่ระบบได้ทันที' })
  username.value = regForm.value.username.trim().toLowerCase()
  password.value = ''
  registerDialog.value = false
}
</script>