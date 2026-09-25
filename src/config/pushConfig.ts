export const PUSH_CONFIG = {
  publicKey:
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    'BBi6iRBeUpLe5cioMWscY7rsYzb-qo3VcdJdi3RBWYsGpwATO6GQA5L5s1n22YW8l4cN8mqxKoKcXRh3_eriGeY',
  privateKey:
    process.env.VAPID_PRIVATE_KEY ||
    'XWhLwug7p0uiYsCYwPH9fggHIPvUEv0mfBWV-AXXFCA',
  subject: process.env.VAPID_SUBJECT || 'mailto:contact@myscore24.com',
}
