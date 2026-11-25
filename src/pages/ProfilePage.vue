<template>
  <q-page padding>
    <div class="text-h5 text-weight-bold q-mb-md">โปรไฟล์ผู้ใช้งาน</div>

    <div class="row q-col-gutter-lg" style="max-width: 900px">
      <div class="col-12 col-md-5">
        <q-card flat bordered class="q-pa-md text-center">
          <q-card-section>
            <q-avatar size="110px" color="deep-orange-7" text-color="white" class="q-mb-md shadow-2">
              <q-img v-if="authStore.user?.avatar" :src="authStore.user.avatar" fit="cover" />
              <span v-else class="text-h4 text-weight-bold">
                {{ (authStore.user?.name || authStore.user?.username || 'U').charAt(0).toUpperCase() }}
              </span>
            </q-avatar>

            <div class="text-h6 text-weight-bold">{{ authStore.user?.name || '-' }}</div>
            <div class="text-caption text-grey-7 q-mb-sm">@{{ authStore.user?.username || '-' }}</div>

            <q-badge
              :color="authStore.role === 'admin' ? 'amber-9' : 'teal-7'"
              class="q-px-sm q-py-xs text-uppercase"
            >
              {{ authStore.role }}
            </q-badge>
          </q-card-section>

          <q-separator />

          <q-card-section class="text-left q-gutter-xs">
            <div><strong>Username:</strong> {{ authStore.user?.username || '-' }}</div>
            <div><strong>ชื่อ-นามสกุล:</strong> {{ authStore.user?.name || '-' }}</div>
            <div><strong>ตำแหน่ง:</strong> {{ authStore.user?.position || '-' }}</div>
            <div><strong>Role:</strong> {{ authStore.role }}</div>
            <div><strong>เบอร์โทร:</strong> {{ authStore.user?.phone || '-' }}</div>
            <div><strong>LINE / ช่องทางติดต่อ:</strong> {{ authStore.user?.contact || '-' }}</div>
            <div><strong>รายละเอียดเพิ่มเติม:</strong> {{ authStore.user?.bio || '-' }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-7">
        <q-card flat bordered class="q-pa-md">
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 text-weight-bold">แก้ไขข้อมูลส่วนตัวและรูปโปรไฟล์</div>
          </q-card-section>

          <q-card-section class="q-gutter-md">
            <q-file
              v-model="avatarFile"
              accept="image/*"
              label="อัปโหลดรูปโปรไฟล์ (ไม่เกิน 600KB)"
              outlined
              dense
              clearable
              @update:model-value="handleAvatarUpload"
            >
              <template #prepend>
                <q-icon name="account_circle" />
              </template>
            </q-file>

            <q-input
              v-model="form.avatar"
              label="หรือใส่ลิงก์รูปโปรไฟล์ (URL)"
              placeholder="https://..."
              outlined
              dense
              clearable
            />

            <q-input v-model="form.name" label="ชื่อ-นามสกุล *" outlined dense />
            <q-input v-model="form.position" label="ตำแหน่ง" outlined dense />
            <q-input v-model="form.phone" label="เบอร์โทรศัพท์" outlined dense />
            <q-input v-model="form.contact" label="LINE ID / Facebook / IG" outlined dense />
            <q-input
              v-model="form.bio"
              type="textarea"
              rows="2"
              label="เครื่องดนตรีประจำตัว / รายละเอียดเพิ่มเติม"
              outlined
              dense
            />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat label="รีเซ็ตค่า" color="grey-7" @click="syncForm" />
            <q-btn unelevated label="บันทึกโปรไฟล์" color="deep-orange-7" icon="save" @click="saveProfile" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'

const $q = useQuasar()
const authStore = useAuthStore()

const avatarFile = ref(null)
const form = ref({
  avatar: '',
  name: '',
  position: '',
  phone: '',
  contact: '',
  bio: ''
})

function syncForm() {
  avatarFile.value = null
  form.value = {
    avatar: authStore.user?.avatar || '',
    name: authStore.user?.name || '',
    position: authStore.user?.position || '',
    phone: authStore.user?.phone || '',
    contact: authStore.user?.contact || '',
    bio: authStore.user?.bio || ''
  }
}

onMounted(syncForm)
watch(() => authStore.user, syncForm)

function handleAvatarUpload(file) {
  if (!file) return
  if (file.size > 600 * 1024) {
    $q.notify({
      type: 'warning',
      message: 'รูปโปรไฟล์ใหญ่เกิน 600KB กรุณาย่อรูปหรือใช้ลิงก์ URL แทน'
    })
    avatarFile.value = null
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    form.value.avatar = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}

function saveProfile() {
  if (!form.value.name.trim()) {
    $q.notify({ type: 'warning', message: 'กรุณากรอกชื่อ-นามสกุล' })
    return
  }

  const res = authStore.updateProfile(form.value)
  if (!res.ok) {
    $q.notify({ type: 'negative', message: res.message })
    return
  }

  $q.notify({ type: 'positive', message: 'บันทึกโปรไฟล์เรียบร้อยแล้ว' })
}
</script>