/**
 * Standard messages for authentication workflows.
 * Error detail messages come from the auth service — these are the
 * client-side fallbacks and presets.
 */
import type React from 'react'

export type AuthAlertType = 'success' | 'error' | 'warning' | 'info'

export interface AuthAlertData {
  type: AuthAlertType
  title?: string
  message: React.ReactNode
  code?: string
}

export const AUTH_MESSAGES = {
  loginFailed: (): AuthAlertData => ({
    type: 'error',
    title: 'Login Gagal',
    message: 'Yah, login gagal silahkan coba lagi',
  }),

  resetEmailSuccess: (): AuthAlertData => ({
    type: 'success',
    title: 'Instruksi Terkirim',
    message: 'Berhasil dikirim, coba cek email mu ya',
  }),

  fieldRequired: (field?: string): AuthAlertData => ({
    type: 'error',
    title: 'Form Belum Lengkap',
    message: field
      ? `Harap isi ${field} terlebih dahulu.`
      : 'Harap lengkapi semua bidang yang wajib diisi.',
  }),
}
