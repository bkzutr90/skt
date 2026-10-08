const fs = require('fs');
const path = require('path');

// tingkat kesulitan = panjang kata
const LEVELS = {
  mudah: 'Mudah (4-5 huruf)',
  sedang: 'Sedang (6-7 huruf)',
  sulit: 'Sulit (8+ huruf)',
};
const DEFAULT_LEVEL = 'mudah';

// [KATA, petunjuk]
const BANK = {
  mudah: [
    ['BUKU', 'Benda'], ['MEJA', 'Perabot'], ['KURSI', 'Perabot'], ['BOLA', 'Olahraga'],
    ['SAPI', 'Hewan'], ['BEBEK', 'Hewan'], ['IKAN', 'Hewan'], ['APEL', 'Buah'],
    ['JERUK', 'Buah'], ['NASI', 'Makanan'], ['SATE', 'Makanan'], ['SOTO', 'Makanan'],
    ['BAKSO', 'Makanan'], ['ROTI', 'Makanan'], ['TOPI', 'Pakaian'], ['BAJU', 'Pakaian'],
    ['RUMAH', 'Tempat'], ['PINTU', 'Bagian rumah'], ['MOBIL', 'Kendaraan'], ['BECAK', 'Kendaraan'],
    ['KAPAL', 'Kendaraan'], ['LAUT', 'Alam'], ['HUTAN', 'Alam'], ['BUNGA', 'Tanaman'],
    ['KOPI', 'Minuman'], ['SUSU', 'Minuman'],
  ],
  sedang: [
    ['KUCING', 'Hewan'], ['HARIMAU', 'Hewan'], ['KELINCI', 'Hewan'], ['MANGGA', 'Buah'],
    ['PISANG', 'Buah'], ['ANGGUR', 'Buah'], ['DURIAN', 'Buah'], ['RENDANG', 'Makanan'],
    ['SEPEDA', 'Kendaraan'], ['SEPATU', 'Pakaian'], ['KEMEJA', 'Pakaian'], ['SEKOLAH', 'Tempat'],
    ['GUNUNG', 'Alam'], ['SUNGAI', 'Alam'], ['PANTAI', 'Alam'], ['JAKARTA', 'Kota'],
    ['BANDUNG', 'Kota'], ['KULKAS', 'Elektronik'], ['TELEPON', 'Elektronik'], ['PAYUNG', 'Benda'],
    ['DOKTER', 'Profesi'], ['PETANI', 'Profesi'], ['NELAYAN', 'Profesi'], ['KENTANG', 'Sayuran'],
    ['WORTEL', 'Sayuran'],
  ],
  sulit: [
    ['SEMANGKA', 'Buah'], ['RAMBUTAN', 'Buah'], ['MARTABAK', 'Makanan'], ['SURABAYA', 'Kota'],
    ['SEMARANG', 'Kota'], ['PALEMBANG', 'Kota'], ['MAKASSAR', 'Kota'], ['YOGYAKARTA', 'Kota'],
    ['KALIMANTAN', 'Pulau'], ['SUMATERA', 'Pulau'], ['SULAWESI', 'Pulau'], ['INDONESIA', 'Negara'],
    ['KOMPUTER', 'Elektronik'], ['TELEVISI', 'Elektronik'], ['KACAMATA', 'Benda'],
    ['PENGGARIS', 'Alat tulis'], ['PENGHAPUS', 'Alat tulis'], ['HELIKOPTER', 'Kendaraan'],
    ['UNIVERSITAS', 'Pendidikan'], ['PERPUSTAKAAN', 'Tempat'], ['PROKLAMASI', 'Sejarah'],
    ['ORANGUTAN', 'Hewan'], ['KANGGURU', 'Hewan'], ['KEMERDEKAAN', 'Sejarah'],
  ],
};

// Opsional: data/words.json = { "mudah": [["KUCING","Hewan"], ...], "sedang": [...], "sulit": [...] }
async function loadWords(level) {
  let list = BANK[level] || BANK[DEFAULT_LEVEL];
  try {
    const file = path.join(__dirname, '..', 'data', 'words.json');
    if (fs.existsSync(file)) {
      const custom = JSON.parse(fs.readFileSync(file, 'utf8'))[level];
      if (Array.isArray(custom) && custom.length) list = custom;
    }
  } catch (e) { console.error('[words] words.json gagal dibaca:', e.message); }
  return list
    .map(([w, c]) => [String(w).toUpperCase().replace(/[^A-Z]/g, ''), String(c || 'Umum')])
    .filter(([w]) => w.length >= 3);
}

module.exports = { loadWords, LEVELS, DEFAULT_LEVEL };
