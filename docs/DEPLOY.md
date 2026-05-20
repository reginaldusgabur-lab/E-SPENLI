# Panduan Deploy E-SPENLI

## Prasyarat

- Repositori GitHub: `reginaldusgabur-lab/e-spenli`
- Proyek Firebase (Authentication + Firestore)
- Proyek Vercel terhubung ke repo
- Kunci API Google Gemini (opsional; tanpa kunci, kutipan memakai daftar manual)

## Variabel lingkungan

### Vercel (Production, Preview, Development)

| Nama | Wajib | Catatan |
|------|-------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Ya | Firebase client |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Ya | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Ya | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Ya | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Ya | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Ya | |
| `FIREBASE_PROJECT_ID` | Ya | Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | Ya | Service account |
| `FIREBASE_PRIVATE_KEY` | Ya | Satu baris dengan `\n` |
| `FIREBASE_DATABASE_URL` | Ya | `https://{project}.firebaseio.com` |
| `GEMINI_API_KEY` | Tidak | Kutipan AI; fallback manual jika kosong |

Salin dari [`.env.example`](../.env.example). **Jangan** commit `.env.local`.

### GitHub Actions Secrets

| Secret | Penggunaan |
|--------|------------|
| `VERCEL_TOKEN` | Deploy ke Vercel |
| `VERCEL_ORG_ID` | ID organisasi Vercel |
| `VERCEL_PROJECT_ID` | ID proyek Vercel |
| `FIREBASE_TOKEN` | `firebase login:ci` |
| `FIREBASE_PROJECT_ID` | Deploy rules & indexes |

## Alur CI/CD (cabang `main`)

Workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

1. `npm install`
2. `npm run build`
3. `firebase deploy --only firestore:rules,firestore:indexes`
4. Deploy produksi ke Vercel

Setelah menambah secret, push ke `main` dan pantau tab **Actions** di GitHub.

## Instal PWA di perangkat

### Android (Chrome)

1. Buka URL produksi E-SPENLI.
2. Login seperti biasa.
3. Menu ⋮ → **Install app** / **Add to Home screen**.

### iOS (Safari)

1. Buka URL di Safari.
2. Tombol **Share** → **Add to Home Screen**.

### Desktop (Chrome / Edge)

Ikon install di bilah alamat, atau banner **Instal E-SPENLI** di aplikasi.

## Setup pertama kali (admin sekolah)

1. Buat akun admin di Firebase / melalui halaman registrasi (lalu set role `admin` via `set-claim.js` atau panel users).
2. Login sebagai admin → **Manajemen Pengguna** → buat akun kepala sekolah, guru, pegawai.
3. **Konfigurasi** → atur jam absen, bobot poin, dan kop laporan.
4. Cetak/tampilkan QR absen di `/dashboard` (fitur absen admin).
5. Tambahkan `GEMINI_API_KEY` di Vercel → redeploy untuk kutipan AI.

## Pengembangan lokal

```bash
cp .env.example .env.local
# isi nilai Firebase & opsional GEMINI_API_KEY
npm install
npm run dev
```

Build produksi lokal: `npm run build && npm start` (PWA aktif saat `NODE_ENV=production`).
