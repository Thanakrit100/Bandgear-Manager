<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card v-if="item" style="min-width: 340px; max-width: 560px">
      <q-card-section class="bg-dark text-white row items-center justify-between">
        <div class="text-subtitle1 text-weight-bold">{{ item.name }}</div>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>
      <q-card-section class="flex flex-center bg-grey-2">
        <q-img :src="item.image" style="max-height: 360px; border-radius: 8px" fit="contain" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue'])
</script>