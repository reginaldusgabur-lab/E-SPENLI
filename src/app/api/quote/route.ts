import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import quotes from '@/lib/manual-quotes.json';

export const dynamic = 'force-dynamic';

type QuoteResponse = { content: string; author: string };

function getManualQuote(): QuoteResponse {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  return {
    content: randomQuote.quote,
    author: randomQuote.author,
  };
}

async function getGeminiQuote(
  category: string,
  attendanceType: 'in' | 'out'
): Promise<QuoteResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const action =
      attendanceType === 'in' ? 'baru masuk kerja' : 'akan pulang kerja';
    const prompt = `Buat satu kutipan motivasi singkat dalam bahasa Indonesia untuk guru atau pegawai sekolah yang ${action}. Konteks kategori: ${category}. Kutipan boleh lucu, penyemangat, atau reflektif (maksimal 2 kalimat). Balas HANYA dengan JSON valid tanpa markdown: {"quote":"...","author":"..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as { quote?: string; author?: string };
    if (!parsed.quote?.trim()) return null;

    return {
      content: parsed.quote.trim(),
      author: parsed.author?.trim() || 'Gemini',
    };
  } catch (error) {
    console.error('[GEMINI_QUOTE_ERROR]', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'default';
    const attendanceType = searchParams.get('attendanceType') as 'in' | 'out' | null;

    if (attendanceType === 'in' || attendanceType === 'out') {
      const geminiQuote = await getGeminiQuote(category, attendanceType);
      if (geminiQuote) {
        return NextResponse.json(geminiQuote);
      }
    }

    return NextResponse.json(getManualQuote());
  } catch (error) {
    console.error('[API_QUOTE_ERROR]', error);
    return NextResponse.json(getManualQuote());
  }
}
