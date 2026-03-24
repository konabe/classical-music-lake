<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean;
  errors: { email: string; password: string; general: string };
}>();

const emit = defineEmits<{
  submit: [email: string, password: string];
}>();

const form = reactive({
  email: "",
  password: "",
});

function handleSubmit() {
  emit("submit", form.email, form.password);
}
</script>

<template>
  <AuthFormContainer title="ログイン">
    <form @submit.prevent="handleSubmit">
      <FormGroup label="メールアドレス" input-id="email" :error-message="props.errors.email">
        <TextInput
          id="email"
          v-model="form.email"
          type="email"
          placeholder="your@example.com"
          required
        />
      </FormGroup>

      <FormGroup label="パスワード" input-id="password" :error-message="props.errors.password">
        <TextInput
          id="password"
          v-model="form.password"
          type="password"
          placeholder="パスワードを入力"
          required
        />
      </FormGroup>

      <ErrorMessage v-if="props.errors.general" :message="props.errors.general" :center="true" />

      <ButtonPrimary type="submit" :disabled="props.isLoading">
        {{ props.isLoading ? "ログイン中..." : "ログイン" }}
      </ButtonPrimary>
    </form>

    <div class="register-link">
      <p>
        アカウントをお持ちでない方は
        <NuxtLink to="/auth/user-register">新規登録</NuxtLink>
      </p>
    </div>
  </AuthFormContainer>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #7a5c38;
}

.register-link a {
  color: #2d2d50;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
