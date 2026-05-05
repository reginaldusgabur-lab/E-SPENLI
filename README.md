# Aplikasi Absensi SMPN 5 Langke Rembong (E-SPENLI)

Selamat datang di dokumentasi resmi E-SPENLI, sebuah aplikasi absensi digital modern yang dirancang khusus untuk **Admin, Kepala Sekolah, Guru, dan Pegawai** di SMPN 5 Langke Rembong. Aplikasi ini dibangun untuk mengotomatiskan, memantau, dan meningkatkan akurasi proses absensi serta pelaporan di lingkungan sekolah.

## Latar Belakang

Di era digital, proses manual pencatatan kehadiran rentan terhadap kesalahan, memakan waktu, dan sulit untuk dianalisis. E-SPENLI hadir sebagai solusi untuk mengatasi tantangan ini dengan menyediakan platform yang efisien, transparan, dan mudah diakses.

## Peran Pengguna & Fitur Utama

Sistem ini memiliki empat peran utama, masing-masing dengan hak akses dan fitur yang disesuaikan.

### 1. Admin (Super User)

Peran dengan kontrol penuh terhadap sistem. Bertugas mengelola data master dan memantau aktivitas secara keseluruhan.

- **Manajemen Pengguna**: Membuat, mengedit, dan mengelola akun untuk semua peran (Kepala Sekolah, Guru, Pegawai).
- **Dasbor Global**: Mengakses dasbor utama dengan statistik agregat seluruh pengguna, termasuk aktivitas kehadiran terbaru.
- **Manajemen Izin**: Melihat dan memproses *semua* permintaan izin/sakit dari seluruh staf.
- **Konfigurasi Laporan**: Mengatur informasi kop dan *footer* (nama instansi, sekolah, kepala sekolah, NIP) yang akan digunakan pada laporan PDF.
- **Akses Laporan Penuh**: Membuat dan mengunduh laporan kehadiran untuk semua pengguna.

### 2. Kepala Sekolah

Peran pimpinan yang berfokus pada pemantauan dan persetujuan.

- **Dasbor Pemantauan**: Melihat ringkasan kehadiran seluruh staf dan riwayat absensi terbaru.
- **Persetujuan Izin**: Menyetujui atau menolak pengajuan izin/sakit yang diajukan oleh guru dan pegawai.
- **Akses Laporan Staf**: Memiliki akses untuk melihat dan meninjau data laporan kehadiran seluruh staf.
- **Absensi Pribadi**: Melakukan absensi masuk dan pulang seperti pengguna lainnya.

### 3. Guru & Pegawai

Peran pengguna utama yang menjadi fokus dari sistem absensi harian.

- **Login & Registrasi**: Mendaftar dan login ke sistem dengan verifikasi email.
- **Dasbor Pribadi**: Melihat ringkasan kehadiran pribadi, jam masuk/pulang, dan kutipan motivasi.
- **Absensi via QR Code**: Melakukan absensi secara cepat dan aman dengan memindai QR Code yang disediakan admin.
- **Pengajuan Izin/Sakit**: Mengajukan ketidakhadiran secara online melalui formulir digital.
- **Laporan Pribadi**: Melihat dan mengunduh riwayat lengkap absensi pribadi.

## Fitur Inovatif & Teknologi

- **Kutipan Motivasi AI**: Setiap kali melakukan absensi, pengguna akan disambut dengan kutipan unik—lucu, penyemangat, atau reflektif—yang dibuat oleh AI (ditenagai oleh Google Gemini) untuk memberikan semangat.
- **Perhitungan Kehadiran Akurat**: 
    - **Persentase Kehadiran**: Dihitung secara real-time berdasarkan jumlah hari kerja efektif (misalnya 23 hari dalam sebulan) yang disesuaikan dengan waktu berjalan.
    - **Sistem Poin**: Perhitungan poin kehadiran disesuaikan dengan nilai bobot yang diinput secara manual oleh Admin, memberikan fleksibilitas dalam penilaian kedisiplinan.
- **Tur Orientasi (Onboarding)**: Saat pertama kali login, pengguna baru akan dipandu melalui fitur-fitur utama yang relevan dengan perannya untuk memastikan adopsi yang cepat dan mudah.
- **Antarmuka Modern**: Dibangun dengan Next.js, TypeScript, dan Tailwind CSS untuk performa tinggi dan pengalaman pengguna yang responsif.
- **Backend Realtime**: Menggunakan Firebase (Firestore & Authentication) untuk sinkronisasi data yang cepat dan andal.