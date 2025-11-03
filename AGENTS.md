# Panduan Agen untuk Proyek DeepMatch

Ini adalah proyek "DeepMatch", sebuah aplikasi kencan premium.

## Arsitektur Proyek

Proyek ini menggunakan struktur **Monorepo** yang dikelola oleh `pnpm workspaces`.

- **`packages/api`**: Ini adalah backend API kita.

  - **Stack**: Node.js, Express, dan TypeScript.
  - **Struktur Kode**: Kode sumber ada di `packages/api/src/`.
  - **Perintah Dev**: `pnpm --filter api dev`

- **`packages/app`**: Ini adalah frontend mobile app kita.
  - **Stack**: React Native dan TypeScript.
  - (Saat ini masih kosong, akan diinisialisasi nanti).

## Aturan Kontribusi

1.  **TypeScript**: Selalu gunakan TypeScript, bukan JavaScript.
2.  **Spesifik**: Saat diberi tugas, selalu konfirmasi Anda bekerja di _package_ yang benar (misal: `packages/api` atau `packages/app`).
3.  **Endpoint API**: Semua endpoint API baru untuk `packages/api` harus diawali dengan `/api/v1/`.
4.  **Testing**: (Nanti akan ditambahkan) Semua logika bisnis harus memiliki _unit test_ menggunakan Jest.
