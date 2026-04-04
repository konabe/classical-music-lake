<script setup lang="ts">
import { nowAsDatetimeLocal } from "~/utils/date";
import type { CreateConcertLogInput } from "~/types";

const props = defineProps<{
  submitLabel?: string;
}>();

const emit = defineEmits<{
  submit: [values: CreateConcertLogInput];
}>();

const form = reactive({
  concertDate: nowAsDatetimeLocal(),
  venue: "",
  conductor: "",
  orchestra: "",
  soloist: "",
});

function handleSubmit() {
  const input: CreateConcertLogInput = {
    concertDate: new Date(form.concertDate).toISOString(),
    venue: form.venue,
    conductor: form.conductor !== "" ? form.conductor : undefined,
    orchestra: form.orchestra !== "" ? form.orchestra : undefined,
    soloist: form.soloist !== "" ? form.soloist : undefined,
  };
  emit("submit", input);
}
</script>

<template>
  <form class="log-form" @submit.prevent="handleSubmit">
    <FormGroup label="開催日時" input-id="concert-date" required>
      <input id="concert-date" v-model="form.concertDate" type="datetime-local" required />
    </FormGroup>

    <FormGroup label="会場" input-id="venue" required>
      <TextInput id="venue" v-model="form.venue" placeholder="例: サントリーホール" required />
    </FormGroup>

    <FormGroup label="指揮者" input-id="conductor">
      <TextInput id="conductor" v-model="form.conductor" placeholder="例: カラヤン" />
    </FormGroup>

    <FormGroup label="オーケストラ / アンサンブル" input-id="orchestra">
      <TextInput
        id="orchestra"
        v-model="form.orchestra"
        placeholder="例: ベルリン・フィルハーモニー管弦楽団"
      />
    </FormGroup>

    <FormGroup label="ソリスト" input-id="soloist">
      <TextInput id="soloist" v-model="form.soloist" placeholder="例: アルゲリッチ" />
    </FormGroup>

    <FormActions
      :submit-label="props.submitLabel ?? '記録する'"
      @cancel="$router.push('/concert-logs')"
    />
  </form>
</template>

<style scoped>
.log-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
