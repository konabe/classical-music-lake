<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean;
  errors: { email: string; password: string };
  successMessage: string;
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
  <div class="register-page">
    <div class="register-container">
      <h1>新規登録</h1>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="your@example.com"
            required
          />
          <p v-if="props.errors.email" class="error-message">{{ props.errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="password">パスワード</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="At least 8 characters"
            required
          />
          <p v-if="props.errors.password" class="error-message">
            {{ props.errors.password }}
          </p>
          <p class="password-requirements">
            パスワードは8文字以上で、大文字・小文字・数字を含む必要があります
          </p>
        </div>

        <button type="submit" :disabled="props.isLoading">
          {{ props.isLoading ? "登録中..." : "登録" }}
        </button>
      </form>

      <div v-if="props.successMessage" class="success-message">
        <p>{{ props.successMessage }}</p>
        <NuxtLink to="/auth/login">ログイン画面へ</NuxtLink>
      </div>

      <div class="login-link">
        <p>
          既にアカウントをお持ちですか？
          <NuxtLink to="/auth/login">ログイン</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #e8d9b8;
}

.register-container {
  background: #f2e6c9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(61, 36, 9, 0.15);
  width: 100%;
  max-width: 400px;
  border: 1px solid #b8995e;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1a1a2e;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #1a1a2e;
}

input[type="email"],
input[type="password"] {
  padding: 0.75rem;
  border: 1px solid #b8995e;
  border-radius: 4px;
  font-size: 1rem;
  background: #faf3e0;
  transition: border-color 0.2s;
}

input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #1a1a2e;
}

.error-message {
  color: #a83218;
  font-size: 0.875rem;
  margin: 0;
}

.password-requirements {
  color: #7a5c38;
  font-size: 0.875rem;
  margin: 0;
}

button {
  padding: 0.75rem;
  background-color: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #2d2d50;
}

button:disabled {
  background-color: #a89070;
  cursor: not-allowed;
}

.success-message {
  background-color: #d8e8c0;
  color: #2a5218;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.success-message a {
  display: inline-block;
  margin-top: 0.5rem;
  color: #2a5218;
  text-decoration: underline;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #7a5c38;
}

.login-link a {
  color: #2d2d50;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
