import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const smtpUser = env.get('SMTP_USER', '')
const smtpPassword = env.get('SMTP_PASSWORD', '')

const smtpConfig = {
  host: env.get('SMTP_HOST', 'localhost'),
  port: Number(env.get('SMTP_PORT', '1025')),
  // N'inclure le bloc auth que s'il y a des identifiants
  ...(smtpUser && smtpPassword
    ? { auth: { user: smtpUser, pass: smtpPassword, type: 'login' } }
    : {}),
}

const mailConfig = defineConfig({
  default: 'smtp',
  mailers: {
    //@ts-ignore
    smtp: transports.smtp(smtpConfig),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
