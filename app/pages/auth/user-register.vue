<script setup lang="ts">
definePageMeta({ layout: "auth" });

const router = useRouter();
const { validateEmail, register } = useAuth();

const errors = reactive({
  email: "",
  password: "",
});

const isLoading = ref(false);

async function handleSubmit(email: string, password: string) {
  errors.email = "";
  errors.password = "";

  if (validateEmail(email) === false) {
    errors.email = "有効なメールアドレスを入力してください";
    return;
  }

  isLoading.value = true;

  try {
    const result = await register(email, password);

    if (result.success === true) {
      sessionStorage.setItem("pendingPassword", password);
      router.push({ path: "/auth/verify-email", state: { email } });
      return;
    }

    const message = result.error ?? "登録に失敗しました";

    if (result.errorType === "email") {
      errors.email = message;
    } else if (result.errorType === "password") {
      errors.password = message;
    } else if (message.includes("already") === true || message.includes("既に") === true) {
      errors.email = "このメールアドレスは既に登録されています";
    } else {
      errors.email = message;
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <UserRegisterTemplate
    :is-loading="isLoading"
    :errors="errors"
    :success-message="''"
    @submit="handleSubmit"
  />
</template>
