import React from 'react'

export type AuthAlertType = 'success' | 'error' | 'warning' | 'info'

export interface AuthAlertData {
  type: AuthAlertType
  title?: string
  message: React.ReactNode
  code?: string
}

/**
 * Standard industry preset messages for authentication workflows.
 */
export const AUTH_MESSAGES = {
  /**
   * Salah password dengan sisa kesempatan mencoba.
   */
  wrongPassword: (remaining: number): AuthAlertData => ({
    type: 'error',
    title: 'Gagal Masuk',
    message: `Username atau password salah, ${remaining}x coba lagi`,
  }),

  /**
   * Terlalu banyak percobaan (lockout cooldown 1 menit).
   */
  lockout: (seconds: number): AuthAlertData => ({
    type: 'warning',
    title: 'Akses Dibatasi Sementara',
    message: `Terlalu banyak percobaan gagal. Silakan tunggu ${seconds} detik sebelum mencoba kembali.`,
  }),

  /**
   * Akun tidak terdaftar / kredensial tidak valid.
   */
  invalidCredentials: (): AuthAlertData => ({
    type: 'error',
    title: 'Kredensial Tidak Valid',
    message: 'Kredensial tidak valid',
  }),

  /**
   * Login Google / 3rd party sukses.
   */
  googleSuccess: (): AuthAlertData => ({
    type: 'success',
    title: 'Autentikasi Berhasil',
    message: 'Login berhasil, membawa mu ke dashboard',
  }),

  /**
   * Login umum gagal.
   */
  loginFailed: (): AuthAlertData => ({
    type: 'error',
    title: 'Login Gagal',
    message: 'Yah, login gagal silahkan coba lagi',
  }),

  /**
   * Koneksi backend server terputus.
   */
  serverDisconnected: (): AuthAlertData => ({
    type: 'error',
    title: 'Koneksi Terputus',
    message: 'Koneksi terputus, kami sedang memperbaiki nya, coba lagi nanti',
  }),

  /**
   * Sukses kirim tautan reset password.
   */
  resetEmailSuccess: (): AuthAlertData => ({
    type: 'success',
    title: 'Instruksi Terkirim',
    message: 'Berhasil dikirim, coba cek email mu ya',
  }),

  /**
   * Validasi field wajib belum diisi.
   */
  fieldRequired: (field?: string): AuthAlertData => ({
    type: 'error',
    title: 'Form Belum Lengkap',
    message: field
      ? `Harap isi ${field} terlebih dahulu.`
      : 'Harap lengkapi semua bidang yang wajib diisi.',
  }),
}
