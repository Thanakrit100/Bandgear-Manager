<template>
  <q-page class="q-pa-md flex justify-center bg-grey-2">
    <div style="width: 100%; max-width: 800px;">
      <div class="row justify-end q-mb-md">
        <q-btn
          unelevated
          color="negative"
          class="text-bold"
          style="border-radius: 4px;"
          @click="handleLogout"
        >
          <q-icon name="logout" class="q-mr-xs" style="transform: rotate(180deg);" />
          LOGOUT
        </q-btn>
      </div>
      <div class="text-center q-mb-lg">
        <q-avatar square size="48px" color="primary" text-color="white" class="rounded-borders q-mb-sm">
          <q-icon name="calculate" size="32px" />
        </q-avatar>
        <div class="text-h3 text-bold text-grey-10">GPA Calculator Pro</div>
        <div class="text-subtitle2 text-grey-7">ระบบคำนวณและบันทึกเกรดเฉลี่ยรายภาคเรียน</div>
      </div>
      <SubjectForm 
        :editData="currentEdit"
        @add-subject="handleAddSubject"
        @update-subject="handleUpdateSubject"
        @cancel-edit="currentEdit = null"
      />
      <q-banner v-if="errorMessage" class="bg-red-1 text-negative q-mt-md rounded-borders" rounded>
        <template #avatar>
          <q-icon name="error" color="negative" />
        </template>
        {{ errorMessage }}
      </q-banner>
      <div class="q-mt-xl">
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-dots color="primary" size="40px" />
          <div class="text-caption text-grey-7 q-mt-sm">กำลังโหลดข้อมูล...</div>
        </div>

        <SubjectList
          v-else
          :subjects="subjects"
          @delete="handleDeleteSubject"
          @edit="handleEditClick"
          @clearAll="handleClearAll"
        />
        <div class="row q-mt-lg rounded-borders overflow-hidden shadow-2" style="background-color: #3b82f6; color: white;">
          <div class="col-6 text-center q-pa-md" style="border-right: 1px solid rgba(255,255,255,0.2);">
            <div class="text-caption text-uppercase text-weight-bold">หน่วยกิตรวม</div>
            <div class="text-h3 text-bold q-mt-xs">{{ totalCredits }}</div>
          </div>
          <div class="col-6 text-center q-pa-md">
            <div class="text-caption text-uppercase text-weight-bold">เกรดเฉลี่ย (GPA)</div>
            <div class="text-h3 text-bold q-mt-xs">{{ semesterGPA }}</div>
          </div>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useGpaStore } from '@/stores/gpaStore'
import { useAuthStore } from '@/stores/authStore'

import SubjectForm from '@/components/GpaFrom.vue'
import SubjectList from '@/components/SubjectList.vue'

const $q = useQuasar()
const router = useRouter()
const gpaStore = useGpaStore()
const authStore = useAuthStore()

const { subjects, loading, errorMessage } = storeToRefs(gpaStore)
const currentEdit = ref(null)

onMounted(() => {
  gpaStore.fetchSubjects()
})

const handleAddSubject = async (newSubject) => {
  await gpaStore.addSubject(newSubject)
  if (!errorMessage.value) {
    $q.notify({
      type: 'positive',
      message: 'เพิ่มวิชาเรียบร้อยแล้ว',
      icon: 'cloud_done'
    })
  }
}

const handleEditClick = (subject) => {
  currentEdit.value = subject
}

const handleUpdateSubject = async (updatedSubject) => {
  if (gpaStore.updateSubject) {
    await gpaStore.updateSubject(updatedSubject)
  }
  currentEdit.value = null
  $q.notify({
    type: 'positive',
    message: 'แก้ไขข้อมูลวิชาเรียบร้อยแล้ว',
    icon: 'edit'
  })
}

const handleDeleteSubject = async (id) => {
  await gpaStore.deleteSubject(id)
  if (!errorMessage.value) {
    $q.notify({
      type: 'negative',
      message: 'ลบรายการเรียบร้อยแล้ว',
      icon: 'delete'
    })
  }
}

const handleClearAll = async () => {
  if (gpaStore.clearAllSubjects) {
    await gpaStore.clearAllSubjects()
  }
}

const totalCredits = computed(() => {
  return subjects.value.reduce((sum, item) => sum + (Number(item.credit) || 0), 0)
})

const semesterGPA = computed(() => {
  if (totalCredits.value === 0) return '0.00'
  const totalGradePoints = subjects.value.reduce(
    (sum, item) => sum + ((item.point || 0) * Number(item.credit)),
    0
  )
  return (totalGradePoints / totalCredits.value).toFixed(2)
})

const handleLogout = () => {
  authStore.logout()
  router.replace('/login')
}
</script>