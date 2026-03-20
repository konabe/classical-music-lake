<template>
  <div class="register-page">
    <div class="register-container">
      <h1>新規登録</h1>

      <form @submit.prevent="handleRegister">
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
            placeholder="At least 8 characters"
            required
          />
          <p v-if="errors.password" class="error-message">
            {{ errors.password }}
          </p>
          <p class="password-requirements">
            パスワードは8文字以上で、大文字・小文字・数字を含む必要があります
          </p>
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? "登録中..." : "登録" }}
        </button>
      </form>

      <div v-if="successMessage" class="success-message">
        <p>{{ successMessage }}</p>
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

<script setup lang="ts">
import { ref, reactive } from "vue";

const { validateEmail, register } = useAuth();

const form = reactive({
  email: "",
  password: "",
});

const errors = reactive({
  email: "",
  password: "",
});

const isLoading = ref(false);
const successMessage = ref("");

const handleRegister = async () => {
  // Reset messages
  errors.email = "";
  errors.password = "";
  successMessage.value = "";

  // Validate email
  if (!validateEmail(form.email)) {
    errors.email = "有効なメールアドレスを入力してください";
    return;
  }

  isLoading.value = true;

  try {
    const result = await register(form.email, form.password);

    if (result.success) {
      successMessage.value = "確認メールを送信しました。メールをご確認ください。";
      form.email = "";
      form.password = "";
    } else {
      // Check which field the error is about
      if (result.error?.includes("email")) {
        errors.email = result.error;
      } else if (result.error?.includes("password")) {
        errors.password = result.error;
      } else if (result.error?.includes("already")) {
        errors.email = "このメールアドレスは既に登録されています";
      } else {
        errors.email = result.error || "登録に失敗しました";
      }
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-container {
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

.password-requirements {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
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

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.success-message a {
  display: inline-block;
  margin-top: 0.5rem;
  color: #155724;
  text-decoration: underline;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.login-link a {
  color: #4a90e2;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
