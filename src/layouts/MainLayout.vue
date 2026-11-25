<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title class="text-weight-bold">
          <q-icon name="library_music" color="amber" class="q-mr-sm" />
          {{ appTitle }}
        </q-toolbar-title>

        <div v-if="authStore.isAuthenticated" class="row items-center q-gutter-sm">
          <q-chip color="amber" text-color="dark" class="cursor-pointer" @click="router.push('/profile')">
            <q-avatar size="24px" color="dark" text-color="amber">
              <q-img v-if="authStore.user?.avatar" :src="authStore.user.avatar" fit="cover" />
              <span v-else class="text-caption text-weight-bold">
                {{ (authStore.user?.name || authStore.user?.username || 'U').charAt(0).toUpperCase() }}
              </span>
            </q-avatar>
            <span class="q-ml-xs">
              {{ authStore.user?.username }} (<b>{{ authStore.role }}</b>)
            </span>
          </q-chip>
          <q-btn flat dense icon="logout" label="Logout" @click="confirmLogout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list>
        <q-item-label header class="text-weight-bold text-grey-8">
          เมนูหลัก ({{ authStore.role }})
        </q-item-label>

        <q-item clickable v-ripple to="/equipments" exact>
          <q-item-section avatar>
            <q-icon name="inventory_2" color="deep-orange-7" />
          </q-item-section>
          <q-item-section>คลังอุปกรณ์ (CRUD)</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/summary" exact>
          <q-item-section avatar>
            <q-icon name="analytics" color="teal-7" />
          </q-item-section>
          <q-item-section>สรุปสถานะอุปกรณ์</q-item-section>
        </q-item>

        <q-item v-show="authStore.isAdmin" clickable v-ripple to="/users" exact>
          <q-item-section avatar>
            <q-icon name="admin_panel_settings" color="purple-7" />
          </q-item-section>
          <q-item-section>จัดการผู้ใช้ & สิทธิ์ (Admin)</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/profile" exact>
          <q-item-section avatar>
            <q-avatar size="28px" color="primary" text-color="white">
              <q-img v-if="authStore.user?.avatar" :src="authStore.user.avatar" fit="cover" />
              <q-icon v-else name="person" size="18px" />
            </q-avatar>
          </q-item-section>
          <q-item-section>โปรไฟล์ผู้ใช้งาน</q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item clickable v-ripple @click="confirmLogout">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section>ออกจากระบบ</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'

const leftDrawerOpen = ref(false)
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const appTitle = import.meta.env.QCLI_APP_TITLE || 'Band & Gear Manager'

function confirmLogout() {
  $q.dialog({
    title: 'ยืนยันการออกจากระบบ',
    message: 'ต้องการออกจากระบบใช่หรือไม่?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    leftDrawerOpen.value = false
    authStore.logout()
    await router.replace('/login')
    $q.notify({ type: 'info', message: 'ออกจากระบบเรียบร้อยแล้ว' })
  })
}
</script>