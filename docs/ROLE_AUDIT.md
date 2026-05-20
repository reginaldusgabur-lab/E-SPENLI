# Checklist Verifikasi Fitur per Peran

Dokumen ini memetakan spesifikasi E-SPENLI ke rute dan modul kode. Gunakan untuk uji manual setelah deploy.

## Admin (`role: admin`)

| Fitur | Rute / Modul | Status kode |
|-------|----------------|-------------|
| Manajemen pengguna | `/dashboard/admin/users` | Ada |
| Dasbor global | `/dashboard/admin` | Ada |
| Manajemen izin (semua staf) | `/dashboard/admin/izin` | Ada |
| Konfigurasi kop/footer PDF | `/dashboard/admin/konfigurasi` | Ada |
| Laporan semua pengguna | `/dashboard/admin/laporan`, `/dashboard/admin/laporan-guru` | Ada |
| Guard akses | `src/app/dashboard/admin/layout.tsx` | Ada |

## Kepala Sekolah (`role: kepala_sekolah`)

| Fitur | Rute / Modul | Status kode |
|-------|----------------|-------------|
| Dasbor pemantauan | `/dashboard/kepala-sekolah` | Ada |
| Persetujuan izin | `/dashboard/kepala-sekolah/approval`, `/dashboard/kepala-sekolah/izin` | Ada |
| Laporan staf | `/dashboard/kepala-sekolah/laporan` | Ada |
| Absensi pribadi | `/dashboard/absen` | Ada |

## Guru & Pegawai

| Fitur | Rute / Modul | Status kode |
|-------|----------------|-------------|
| Login & registrasi + verifikasi email | `/` (`src/app/page.tsx`) | Ada |
| Dasbor pribadi | `/dashboard`, `/dashboard/guru`, `/dashboard/pegawai` | Ada |
| Absensi QR | `/dashboard/absen` + `src/components/absen.tsx` | Ada |
| Pengajuan izin/sakit | `/dashboard/izin` | Ada |
| Laporan pribadi | `/dashboard/laporan` | Ada |
| Kutipan motivasi | `src/components/layout/quote-of-the-day.tsx` + `/api/quote` | Ada (Gemini + fallback) |
| Onboarding | `src/components/OnboardingTour.tsx` | Ada |
| Persentase & poin | `src/lib/attendance.ts` | Ada |

## Uji manual yang disarankan

1. Login sebagai masing-masing peran; pastikan redirect dasbor benar.
2. Scan QR absen masuk/pulang; kutipan AI atau fallback manual muncul.
3. Ajukan izin sebagai guru/pegawai; setujui/tolak sebagai kepala sekolah.
4. Unduh laporan PDF; kop/footer sesuai konfigurasi admin.
5. Cek persentase kehadiran dan poin di dasbor setelah admin mengatur bobot.
6. Instal PWA (Chrome: Install app / Android: Add to Home Screen).
