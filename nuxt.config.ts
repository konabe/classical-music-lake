// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  devtools: { enabled: true },
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    awsRegion: process.env.AWS_REGION || 'ap-northeast-1',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    dynamoTableListeningLogs: process.env.DYNAMO_TABLE_LISTENING_LOGS || 'classical-music-listening-logs',
    dynamoTableConcerts: process.env.DYNAMO_TABLE_CONCERTS || 'classical-music-concerts',
  },
})
