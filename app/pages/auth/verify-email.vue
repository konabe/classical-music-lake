<script setup lang="ts">
definePageMeta({ layout: "auth" });

const router = useRouter();
const { verifyEmail, resendVerificationCode, login } = useAuth();

const email = ref("");
const password = ref("");

const isLoading = ref(false);
const error = ref("");
const infoMessage = ref("");

onMounted(() => {
  const state = history.state as { email?: string };
  const pendingPassword = sessionStorage.getItem("pendingPassword");
  if ((state?.email?.trim() ?? "") === "" || (pendingPassword?.trim() ?? "") === "") {
    router.push("/auth/user-register");
    return;
  }
  email.value = state.email;
  password.value = pendingPassword;
});

async function handleSubmit(code: string) {
  error.value = "";
  infoMessage.value = "";
  isLoading.value = true;

  try {
    const verifyResult = await verifyEmail(email.value, code);
    if (!verifyResult.success) {
      error.value =
        verifyResult.error !== undefined && verifyResult.error !== ""
          ? verifyResult.error
          : "確認に失敗しました";
      return;
    }

    const loginResult = await login(email.value, password.value);
    sessionStorage.removeItem("pendingPassword");
    if (!loginResult.success) {
      error.value =
        "確認は完了しましたが、ログインに失敗しました。ログイン画面からログインしてください。";
      return;
    }

    router.push("/");
  } finally {
    isLoading.value = false;
  }
}

async function handleResend() {
  error.value = "";
  infoMessage.value = "";
  isLoading.value = true;

  try {
    const result = await resendVerificationCode(email.value);
    if (result.success) {
      infoMessage.value = "認証コードを再送しました。メールをご確認ください。";
    } else {
      error.value =
        result.error !== undefined && result.error !== "" ? result.error : "再送信に失敗しました";
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <VerifyEmailTemplate
    :email="email"
    :is-loading="isLoading"
    :error="error"
    :info-message="infoMessage"
    @submit="handleSubmit"
    @resend="handleResend"
  />
</template>
