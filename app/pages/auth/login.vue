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

const { validateEmail, login } = useAuth();
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

  if (!validateEmail(form.email)) {
    errors.email = "有効なメールアドレスを入力してください";
    return;
  }

  if (!form.password) {
    errors.password = "パスワードを入力してください";
    return;
  }

  isLoading.value = true;

  try {
    const result = await login(form.email, form.password);

    if (result.success) {
      await router.push("/");
    } else {
      if (result.error?.includes("email")) {
        errors.email = result.error;
      } else if (result.error?.includes("confirm") || result.error?.includes("verified")) {
        errors.general = "メールアドレスの確認が完了していません。確認メールをご確認ください。";
      } else {
        errors.general = result.error || "ログインに失敗しました。時間をおいてお試しください。";
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
  background-color: #f5f5f5;
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
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
  color: #333;
}

input[type="email"],
input[type="password"] {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #4a90e2;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin: 0;
}

.general-error {
  text-align: center;
}

button {
  padding: 0.75rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #357abd;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.register-link a {
  color: #4a90e2;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
