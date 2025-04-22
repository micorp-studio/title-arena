<script setup lang="ts">
import * as z from 'zod'

const createStatus = ref('idle')
const imgUrl = ref('');

const upload = useUpload('/api/minias', { method: 'PUT' })
const toast = useToast();

async function onFileSelect(event: Event) {
  const uploadedFiles = await upload(event.target as HTMLInputElement);
  toast.add({
    title: 'Image uploaded',
    description: uploadedFiles[0].pathname,
    color: 'secondary'
  });

  imgUrl.value = '/api/minias/' + uploadedFiles[0].pathname.split('/').pop();
  miniaState.pathname = uploadedFiles[0].pathname;
}

const miniaSchema = z.object({
  pathname: z.string().min(1).max(100)
})

const miniaState = reactive({
  pathname: ''
})

const onSubmit = async () => {
  toast.add({
    title: 'Minia created',
    description: miniaState.pathname,
    color: 'secondary'
  });
}
</script>

<template>
  <UForm :schema="miniaSchema" :state="miniaState" @submit="onSubmit">
    <UFormField name="pathname" label="Minia Name" required>
      <UInput type="file" name="Minia" @change="onFileSelect" accept="image/jpeg, image/png" />
      <img v-if="imgUrl" class="w-32" :src="imgUrl" alt="Minia" />
    </UFormField>
    <UButton type="submit" color="primary" icon="i-ph-check-circle" :loading="createStatus === 'loading'"
      :disabled="createStatus === 'loading'">
      Create Minia
    </UButton>
  </UForm>
</template>
