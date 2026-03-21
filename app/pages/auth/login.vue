<template>
  <div class="login-page">
    <div class="login-container">
      <h1>ログイン</h1>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="your@example.com"
            required
          />
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="password">パスワード</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="パスワードを入力"
            required
          />
          <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
        </div>

        <p v-if="errors.general" class="error-message general-error">{{ errors.general }}</p>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? "ログイン中..." : "ログイン" }}
        </button>
      </form>

      <div class="register-link">
        <p>
          アカウントをお持ちでない方は
          <NuxtLink to="/auth/user-register">新規登録</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

const { login } = useAuth();
const router = useRouter();

const form = reactive({
  email: "",
  password: "",
});

const errors = reactive({
  email: "",
  password: "",
  general: "",
});

const isLoading = ref(false);

const handleLogin = async () => {
  errors.email = "";
  errors.password = "";
  errors.general = "";

  isLoading.value = true;

  try {
    const result = await login(form.email, form.password);

    if (result.success) {
      form.password = "";
      await router.push("/");
    } else {
      if (result.errorType === "email") {
        errors.email = "有効なメールアドレスを入力してください";
      } else if (result.errorType === "password") {
        errors.password = "パスワードを入力してください";
      } else if (result.errorType === "not_confirmed") {
        errors.general = "メールアドレスの確認が完了していません。確認メールをご確認ください。";
      } else {
        errors.general = "メールアドレスまたはパスワードが正しくありません。";
      }
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #e8d9b8;
}

.login-container {
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

.general-error {
  text-align: center;
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
