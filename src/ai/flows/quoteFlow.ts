/**
 * @fileOverview Flow untuk menghasilkan kutipan motivasi/lucu.
 */

import { defineFlow } from '@genkit-ai/core';
import { model } from '@/ai/genkit'; // Mengimpor model yang sudah dikonfigurasi
import { z } from 'zod';

// Mendefinisikan skema input menggunakan Zod
const QuoteInputSchema = z.object({
  category: z
    .string()
    .describe('Peran audiens target, contoh: "guru", "kepala sekolah", "pegawai".'),
  attendanceType: z
    .enum(['in', 'out'])
    .describe('Jenis absensi: "in" untuk masuk, "out" untuk pulang.'),
});
export type QuoteInput = z.infer<typeof QuoteInputSchema>;

// Mendefinisikan skema output menggunakan Zod
const QuoteOutputSchema = z.object({
  quote: z
    .string()
    .describe('Teks kutipan yang dihasilkan.'),
  author: z
    .string()
    .describe('Nama penulis fiktif yang sesuai dengan konteks kutipan.'),
});
export type QuoteOutput = z.infer<typeof QuoteOutputSchema>;

// Fungsi helper untuk memanggil flow (opsional, tapi praktik yang baik)
export async function getQuote(input: QuoteInput): Promise<QuoteOutput> {
  const flowResult = await quoteFlow.run(input);
  return flowResult as unknown as QuoteOutput;
}

// Template prompt untuk model bahasa
const quotePromptTemplate = `Anda adalah seorang penulis kreatif yang ahli membuat kutipan singkat untuk para pendidik.

Audiens: {{category}}
Jenis Absensi: {{attendanceType}}

# Tugas Utama:
1.  Buatlah **satu kutipan orisinal dalam Bahasa Indonesia yang terdiri dari TEPAT SATU KALIMAT**.
2.  Secara acak, pilih salah satu dari tiga gaya bahasa berikut untuk kutipan tersebut:
    *   **Lucu & Asik:** Ringan, jenaka, dan membuat tersenyum.
    *   **Penyemangat:** Memberikan motivasi dan energi positif.
    *   **Reflektif:** Penuh makna dan mengajak merenung sejenak.
3.  Sesuaikan kutipan dengan audiens ({{category}}) dan jenis absensi ({{attendanceType}}):
    *   Absensi **'in'**: Fokus pada semangat memulai hari, energi pagi, atau humor ringan seputar sekolah.
    *   Absensi **'out'**: Fokus pada istirahat, pencapaian, atau humor tentang akhir hari mengajar.
4.  Buat juga **satu nama penulis fiktif** yang unik dan cocok dengan gaya kutipan yang Anda buat.

# Contoh Variasi Gaya (untuk Guru, Absen 'in'):
- **Lucu/Asik**: {"quote": "Level kesabaran hari ini: Diisi ulang dan siap untuk pertanyaan 'Pak, ini halaman berapa?'", "author": "Guru Level Pro"}
- **Penyemangat**: {"quote": "Selamat pagi, mari ukir jejak ilmu di papan tulis dan di hati setiap siswa.", "author": "Pendidik Penuh Inspirasi"}
- **Reflektif**: {"quote": "Setiap bel masuk adalah pengingat bahwa kita punya kesempatan baru untuk mencerahkan masa depan.", "author": "Sang Pencetak Generasi"}

# Contoh untuk Kepala Sekolah (Absen 'out'):
- **Lucu/Asik**: {"quote": "Misi hari ini selesai, sekolah aman terkendali, saatnya ganti status jadi 'penikmat kopi sore'.", "author": "Kapten Sekolah"}

Pastikan output Anda selalu dalam format JSON yang valid tanpa tambahan karakter atau penjelasan.
`;

// FINAL FIX: Mengembalikan ke sintaks 3-argumen (lama) agar sesuai dengan cache dependensi Vercel.
// Perubahan ini dipaksa untuk membuat commit hash baru.
export const quoteFlow = defineFlow(
  'quoteFlow',
  QuoteInputSchema,
  QuoteOutputSchema,
  async (input) => {
    const llmResponse = await model.generate({
      prompt: {
        text: quotePromptTemplate,
        variables: input,
      },
      output: {
        schema: QuoteOutputSchema,
      },
    });

    return llmResponse.output!;
  }
);
