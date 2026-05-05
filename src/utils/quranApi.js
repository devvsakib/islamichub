const BASE_URL = 'https://api.alquran.cloud/v1';

/**
 * Fetches the list of all 114 Surahs.
 */
export async function fetchSurahList() {
  const response = await fetch(`${BASE_URL}/surah`);
  const data = await response.json();
  if (data.code !== 200) throw new Error(data.data);
  return data.data;
}

/**
 * Fetches a specific Surah with Arabic text and English translation.
 * Uses the 'quran-uthmani' and 'en.sahih' editions.
 */
export async function fetchSurahDetails(surahNumber) {
  const [arabicRes, englishRes] = await Promise.all([
    fetch(`${BASE_URL}/surah/${surahNumber}/quran-uthmani`),
    fetch(`${BASE_URL}/surah/${surahNumber}/en.sahih`)
  ]);

  const [arabic, english] = await Promise.all([arabicRes.json(), englishRes.json()]);

  if (arabic.code !== 200) throw new Error(arabic.data);
  if (english.code !== 200) throw new Error(english.data);

  // Merge Arabic and English Ayahs
  const ayahs = arabic.data.ayahs.map((ayah, index) => ({
    ...ayah,
    englishText: english.data.ayahs[index].text,
  }));

  return { ...arabic.data, ayahs };
}

/**
 * Fetches audio data for a specific Surah.
 * Edition 'ar.alafasy' is a common high-quality recitation.
 */
export async function fetchSurahAudio(surahNumber, edition = 'ar.alafasy') {
  const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${edition}`);
  const data = await response.json();
  if (data.code !== 200) throw new Error(data.data);
  return data.data;
}
