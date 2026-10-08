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
    // ===== BENDA =====
    ['BUKU', 'Benda'],
    ['MEJA', 'Perabot'],
    ['KURSI', 'Perabot'],
    ['BOLA', 'Olahraga'],
    ['PENA', 'Alat tulis'],
    ['PISAU', 'Alat'],
    ['GELAS', 'Benda'],
    ['KACA', 'Benda'],
    ['JAM', 'Benda'],
    ['TAS', 'Benda'],
    ['KAIN', 'Benda'],
    ['KOIN', 'Benda'],
    ['KADO', 'Benda'],
    ['KUNCI', 'Benda'],
    ['SAPU', 'Benda'],
    ['SABUN', 'Benda'],
    ['SIKAT', 'Benda'],
    ['KABEL', 'Elektronik'],
    ['LAMPU', 'Elektronik'],
    ['RADIO', 'Elektronik'],
    ['MOUSE', 'Elektronik'],
    ['KIPAS', 'Elektronik'],

    // ===== HEWAN =====
    ['SAPI', 'Hewan'],
    ['IKAN', 'Hewan'],
    ['BEBEK', 'Hewan'],
    ['AYAM', 'Hewan'],
    ['KUCING', 'Hewan'],
    ['TIKUS', 'Hewan'],
    ['KAMBING', 'Hewan'],
    ['KUDA', 'Hewan'],
    ['BURUNG', 'Hewan'],
    ['SEMUT', 'Hewan'],
    ['LEBAH', 'Hewan'],
    ['ULAT', 'Hewan'],
    ['CACING', 'Hewan'],
    ['KODOK', 'Hewan'],
    ['IKAN', 'Hewan'],

    // ===== MAKANAN =====
    ['NASI', 'Makanan'],
    ['SATE', 'Makanan'],
    ['SOTO', 'Makanan'],
    ['BAKSO', 'Makanan'],
    ['ROTI', 'Makanan'],
    ['MIE', 'Makanan'],
    ['TELUR', 'Makanan'],
    ['TAHU', 'Makanan'],
    ['TEMPE', 'Makanan'],
    ['BUBUR', 'Makanan'],
    ['SUP', 'Makanan'],
    ['CAKE', 'Makanan'],
    ['DONAT', 'Makanan'],
    ['PIZZA', 'Makanan'],
    ['BURGER', 'Makanan'],
    ['KEJU', 'Makanan'],
    ['DAGING', 'Makanan'],
    ['IKAN', 'Makanan'],
    ['SAMBAL', 'Makanan'],
    ['KERUPUK', 'Makanan'],

    // ===== BUAH =====
    ['APEL', 'Buah'],
    ['JERUK', 'Buah'],
    ['MELON', 'Buah'],
    ['MANGGA', 'Buah'],
    ['PEPAYA', 'Buah'],
    ['PISANG', 'Buah'],
    ['ANGGUR', 'Buah'],
    ['JAMBU', 'Buah'],
    ['SALAK', 'Buah'],
    ['NANAS', 'Buah'],
    ['LEMON', 'Buah'],
    ['DURIAN', 'Buah'],
    ['KIWI', 'Buah'],

    // ===== TEMPAT =====
    ['RUMAH', 'Tempat'],
    ['TOKO', 'Tempat'],
    ['PASAR', 'Tempat'],
    ['KAFE', 'Tempat'],
    ['KANTOR', 'Tempat'],
    ['TAMAN', 'Tempat'],
    ['PANTAI', 'Tempat'],
    ['KOLAM', 'Tempat'],
    ['KELAS', 'Tempat'],
    ['HOTEL', 'Tempat'],

    // ===== ALAM =====
    ['LAUT', 'Alam'],
    ['HUJAN', 'Alam'],
    ['AWAN', 'Alam'],
    ['ANGIN', 'Alam'],
    ['HUTAN', 'Alam'],
    ['BUKIT', 'Alam'],
    ['GUNUNG', 'Alam'],
    ['SUNGAI', 'Alam'],
    ['BATU', 'Alam'],
    ['PASIR', 'Alam'],

    // ===== PAKAIAN =====
    ['BAJU', 'Pakaian'],
    ['TOPI', 'Pakaian'],
    ['CELANA', 'Pakaian'],
    ['KAOS', 'Pakaian'],
    ['ROK', 'Pakaian'],
    ['JAKET', 'Pakaian'],
    ['SEPATU', 'Pakaian'],
    ['KEMEJA', 'Pakaian'],
    ['SARUNG', 'Pakaian'],
    ['DASI', 'Pakaian'],

    // ===== KENDARAAN =====
    ['MOBIL', 'Kendaraan'],
    ['MOTOR', 'Kendaraan'],
    ['BECAK', 'Kendaraan'],
    ['KAPAL', 'Kendaraan'],
    ['BUS', 'Kendaraan'],
    ['TRUK', 'Kendaraan'],
    ['TAXI', 'Kendaraan'],
    ['SEPEDA', 'Kendaraan'],
    ['ROKET', 'Kendaraan'],

    // ===== MINUMAN =====
    ['KOPI', 'Minuman'],
    ['SUSU', 'Minuman'],
    ['TEH', 'Minuman'],
    ['JUS', 'Minuman'],
    ['SODA', 'Minuman'],
    ['AIR', 'Minuman'],
    ['SIRUP', 'Minuman'],

    // ===== PROFESI =====
    ['GURU', 'Profesi'],
    ['DOKTER', 'Profesi'],
    ['POLISI', 'Profesi'],
    ['PILOT', 'Profesi'],
    ['HAKIM', 'Profesi'],
    ['PETANI', 'Profesi'],
    ['KOKI', 'Profesi'],
    ['BIDAN', 'Profesi'],

    // ===== LAINNYA =====
    ['PAGI', 'Waktu'],
    ['SIANG', 'Waktu'],
    ['MALAM', 'Waktu'],
    ['SENJA', 'Waktu'],
    ['MINGGU', 'Waktu'],
    ['JANUARI', 'Bulan'],
    ['MARET', 'Bulan'],
    ['APRIL', 'Bulan'],
    ['MEI', 'Bulan'],
    ['JUNI', 'Bulan'],
    ['MERAH', 'Warna'],
    ['BIRU', 'Warna'],
    ['HIJAU', 'Warna'],
    ['PUTIH', 'Warna'],
    ['HITAM', 'Warna'],
  ],

  sedang: [
    // ===== HEWAN =====
    ['KUCING', 'Hewan'],
    ['HARIMAU', 'Hewan'],
    ['KELINCI', 'Hewan'],
    ['GAJAH', 'Hewan'],
    ['JERAPAH', 'Hewan'],
    ['ZEBRA', 'Hewan'],
    ['MONYET', 'Hewan'],
    ['GORILA', 'Hewan'],
    ['PANDA', 'Hewan'],
    ['KOALA', 'Hewan'],
    ['KANGURU', 'Hewan'],
    ['BUAYA', 'Hewan'],
    ['KURA-KURA', 'Hewan'],
    ['LUMBA-LUMBA', 'Hewan'],
    ['HIU', 'Hewan'],
    ['PAUS', 'Hewan'],
    ['PENGUIN', 'Hewan'],
    ['MERPATI', 'Hewan'],
    ['KUPU-KUPU', 'Hewan'],
    ['BELALANG', 'Hewan'],

    // ===== BUAH =====
    ['MANGGA', 'Buah'],
    ['PISANG', 'Buah'],
    ['ANGGUR', 'Buah'],
    ['DURIAN', 'Buah'],
    ['SEMANGKA', 'Buah'],
    ['RAMBUTAN', 'Buah'],
    ['MELON', 'Buah'],
    ['PEPAYA', 'Buah'],
    ['NANGKA', 'Buah'],
    ['MANGGIS', 'Buah'],
    ['MARKISA', 'Buah'],
    ['STROBERI', 'Buah'],
    ['ALPUKAT', 'Buah'],
    ['SIRSAK', 'Buah'],
    ['BELIMBING', 'Buah'],
    ['DELIMA', 'Buah'],

    // ===== MAKANAN =====
    ['RENDANG', 'Makanan'],
    ['NASI GORENG', 'Makanan'],
    ['MARTABAK', 'Makanan'],
    ['PEMPEK', 'Makanan'],
    ['BATAGOR', 'Makanan'],
    ['SIOMAY', 'Makanan'],
    ['GADO-GADO', 'Makanan'],
    ['KETOPRAK', 'Makanan'],
    ['SOMAY', 'Makanan'],
    ['LONTONG', 'Makanan'],
    ['OPOR', 'Makanan'],
    ['RAWON', 'Makanan'],
    ['GUDEG', 'Makanan'],
    ['PECEL', 'Makanan'],
    ['SATE AYAM', 'Makanan'],
    ['MIE AYAM', 'Makanan'],
    ['NASI PADANG', 'Makanan'],
    ['AYAM GORENG', 'Makanan'],
    ['AYAM BAKAR', 'Makanan'],

    // ===== BENDA =====
    ['PAYUNG', 'Benda'],
    ['DOMPET', 'Benda'],
    ['KAMERA', 'Elektronik'],
    ['LAPTOP', 'Elektronik'],
    ['KULKAS', 'Elektronik'],
    ['TELEPON', 'Elektronik'],
    ['MONITOR', 'Elektronik'],
    ['KEYBOARD', 'Elektronik'],
    ['SPEAKER', 'Elektronik'],
    ['HEADSET', 'Elektronik'],
    ['CHARGER', 'Elektronik'],
    ['REMOTE', 'Elektronik'],
    ['PRINTER', 'Elektronik'],
    ['KOMPOR', 'Elektronik'],
    ['BLENDER', 'Elektronik'],
    ['SETRIKA', 'Elektronik'],

    // ===== TEMPAT =====
    ['SEKOLAH', 'Tempat'],
    ['RUMAH SAKIT', 'Tempat'],
    ['PERKANTORAN', 'Tempat'],
    ['BANDARA', 'Tempat'],
    ['STASIUN', 'Tempat'],
    ['TERMINAL', 'Tempat'],
    ['PERPUSTAKAAN', 'Tempat'],
    ['UNIVERSITAS', 'Pendidikan'],
    ['MUSEUM', 'Tempat'],
    ['STADION', 'Tempat'],
    ['RESTORAN', 'Tempat'],
    ['SUPERMARKET', 'Tempat'],
    ['MAL', 'Tempat'],
    ['POM BENSIN', 'Tempat'],

    // ===== ALAM =====
    ['GUNUNG', 'Alam'],
    ['SUNGAI', 'Alam'],
    ['PANTAI', 'Alam'],
    ['AIR TERJUN', 'Alam'],
    ['PEMANDANGAN', 'Alam'],
    ['PELABUHAN', 'Tempat'],
    ['PERKEBUNAN', 'Alam'],
    ['PERSAWAHAN', 'Alam'],
    ['PEGUNUNGAN', 'Alam'],
    ['SAMUDRA', 'Alam'],

    // ===== PROFESI =====
    ['DOKTER', 'Profesi'],
    ['PERAWAT', 'Profesi'],
    ['GURU', 'Profesi'],
    ['POLISI', 'Profesi'],
    ['TENTARA', 'Profesi'],
    ['PILOT', 'Profesi'],
    ['NELAYAN', 'Profesi'],
    ['PETANI', 'Profesi'],
    ['PEDAGANG', 'Profesi'],
    ['ARSITEK', 'Profesi'],
    ['PROGRAMMER', 'Profesi'],
    ['MEKANIK', 'Profesi'],
    ['JURNALIS', 'Profesi'],
    ['PENYANYI', 'Profesi'],
    ['AKTOR', 'Profesi'],

    // ===== KOTA =====
    ['JAKARTA', 'Kota'],
    ['BANDUNG', 'Kota'],
    ['SURABAYA', 'Kota'],
    ['SEMARANG', 'Kota'],
    ['DEPOK', 'Kota'],
    ['BEKASI', 'Kota'],
    ['BOGOR', 'Kota'],
    ['MALANG', 'Kota'],
    ['MEDAN', 'Kota'],
    ['PADANG', 'Kota'],
    ['MANADO', 'Kota'],
    ['DENPASAR', 'Kota'],
    ['BATAM', 'Kota'],
    ['BALIKPAPAN', 'Kota'],

    // ===== LAINNYA =====
    ['KEMERAHAN', 'Kondisi'],
    ['KEBAHAGIAAN', 'Perasaan'],
    ['KESUKSESAN', 'Kondisi'],
    ['PERMAINAN', 'Aktivitas'],
    ['OLAHRAGA', 'Aktivitas'],
    ['PETUALANGAN', 'Aktivitas'],
    ['PERJALANAN', 'Aktivitas'],
    ['PERAYAAN', 'Kegiatan'],
    ['PERNIKAHAN', 'Acara'],
    ['ULANG TAHUN', 'Acara'],
  ],

  sulit: [
    // ===== INDONESIA =====
    ['INDONESIA', 'Negara'],
    ['KEMERDEKAAN', 'Sejarah'],
    ['PROKLAMASI', 'Sejarah'],
    ['PANCASILA', 'Ideologi'],
    ['NUSANTARA', 'Wilayah'],
    ['BHINNEKA', 'Semboyan'],
    ['GARUDA', 'Simbol negara'],
    ['KEBUDAYAAN', 'Budaya'],
    ['MASYARAKAT', 'Sosial'],
    ['PEMBANGUNAN', 'Kegiatan'],

    // ===== KOTA =====
    ['YOGYAKARTA', 'Kota'],
    ['PALEMBANG', 'Kota'],
    ['MAKASSAR', 'Kota'],
    ['BALIKPAPAN', 'Kota'],
    ['BANJARMASIN', 'Kota'],
    ['PEKANBARU', 'Kota'],
    ['BANDARLAMPUNG', 'Kota'],
    ['PONTIANAK', 'Kota'],
    ['SAMARINDA', 'Kota'],
    ['JAYAPURA', 'Kota'],

    // ===== PULAU =====
    ['KALIMANTAN', 'Pulau'],
    ['SUMATERA', 'Pulau'],
    ['SULAWESI', 'Pulau'],
    ['PAPUA', 'Pulau'],
    ['BALI', 'Pulau'],
    ['LOMBOK', 'Pulau'],
    ['FLORES', 'Pulau'],
    ['SUMBAWA', 'Pulau'],
    ['MADURA', 'Pulau'],

    // ===== HEWAN =====
    ['ORANGUTAN', 'Hewan'],
    ['KOMODO', 'Hewan'],
    ['BADAK', 'Hewan'],
    ['BANTENG', 'Hewan'],
    ['BERUANG', 'Hewan'],
    ['SIMPANSE', 'Hewan'],
    ['KAKTUS', 'Tanaman'],
    ['BUAYA MUARA', 'Hewan'],
    ['KUPU-KUPU', 'Hewan'],

    // ===== TEKNOLOGI =====
    ['KOMPUTER', 'Elektronik'],
    ['TELEVISI', 'Elektronik'],
    ['SMARTPHONE', 'Teknologi'],
    ['KOMUNIKASI', 'Teknologi'],
    ['INTERNET', 'Teknologi'],
    ['PERANGKAT', 'Teknologi'],
    ['PERANGKAT LUNAK', 'Teknologi'],
    ['PROGRAMMING', 'Teknologi'],
    ['DATABASE', 'Teknologi'],
    ['SERVER', 'Teknologi'],
    ['JARINGAN', 'Teknologi'],
    ['KEYBOARD', 'Elektronik'],
    ['MIKROFON', 'Elektronik'],
    ['PROYEKTOR', 'Elektronik'],
    ['KOMPONEN', 'Teknologi'],

    // ===== MAKANAN =====
    ['MARTABAK', 'Makanan'],
    ['PEMPEK', 'Makanan'],
    ['RENDANG', 'Makanan'],
    ['KETUPAT', 'Makanan'],
    ['KLEPON', 'Makanan'],
    ['SERABI', 'Makanan'],
    ['BROWNIES', 'Makanan'],
    ['PUDING', 'Makanan'],
    ['SPAGETI', 'Makanan'],
    ['LASAGNA', 'Makanan'],
    ['SANDWICH', 'Makanan'],
    ['CROISSANT', 'Makanan'],
    ['PANCAKE', 'Makanan'],
    ['DONAT', 'Makanan'],

    // ===== PROFESI =====
    ['PENGACARA', 'Profesi'],
    ['WARTAWAN', 'Profesi'],
    ['INSINYUR', 'Profesi'],
    ['ILMUWAN', 'Profesi'],
    ['ASTRONOT', 'Profesi'],
    ['PRESENTER', 'Profesi'],
    ['FOTOGRAFER', 'Profesi'],
    ['DESAINER', 'Profesi'],
    ['PROGRAMMER', 'Profesi'],
    ['DEVELOPER', 'Profesi'],
    ['MANAJER', 'Profesi'],
    ['DIREKTUR', 'Profesi'],

    // ===== TEMPAT =====
    ['PERPUSTAKAAN', 'Tempat'],
    ['UNIVERSITAS', 'Pendidikan'],
    ['LABORATORIUM', 'Tempat'],
    ['OBSERVATORIUM', 'Tempat'],
    ['PENGADILAN', 'Tempat'],
    ['KEDUTAAN', 'Tempat'],
    ['PUSKESMAS', 'Tempat'],
    ['PELABUHAN', 'Tempat'],
    ['BANDARA', 'Tempat'],
    ['PERKANTORAN', 'Tempat'],

    // ===== ABSTRAK =====
    ['KECERDASAN', 'Kemampuan'],
    ['PENGETAHUAN', 'Kemampuan'],
    ['PENGALAMAN', 'Kondisi'],
    ['KEBERANIAN', 'Sifat'],
    ['KEJUJURAN', 'Sifat'],
    ['PERSAHABATAN', 'Hubungan'],
    ['KEBAHAGIAAN', 'Perasaan'],
    ['KESEDIHAN', 'Perasaan'],
    ['KEGEMBIRAAN', 'Perasaan'],
    ['KEBERHASILAN', 'Kondisi'],
    ['KEGAGALAN', 'Kondisi'],
    ['PERJUANGAN', 'Aktivitas'],
    ['PETUALANGAN', 'Aktivitas'],
    ['PERKEMBANGAN', 'Proses'],
    ['PERUBAHAN', 'Proses'],
  ],
};

// ===== KATA TAMBAHAN =====
// Format ringkas: x('Petunjuk', 'KATA1 KATA2 KATA_DUA ...')
// Pemisah antar kata = spasi. Underscore / tanda hubung otomatis dibuang saat dimuat.
const x = (cat, str) => str.trim().split(/\s+/).map((w) => [w, cat]);

const EXTRA = {
  mudah: [
    // Benda
    ...x('Benda', 'TALI PAKU PINTU ATAP LANTAI RAK SENDOK GARPU PIRING BOTOL EMBER GAYUNG SISIR HANDUK CERMIN BANTAL GUNTING LEM PENSIL SPIDOL KERTAS TINTA KOPER PETA LILIN KOREK PALU OBENG TANGGA RANTAI JARUM BENANG KANCING KARET PENGHAPUS TEMBOK GENTENG'),
    ...x('Perabot', 'LEMARI KASUR SOFA RAK GORDEN KARPET TIKAR DIPAN'),
    // Hewan
    ...x('Hewan', 'ANJING DOMBA BABI ULAR RUSA SINGA MACAN RUBAH LELE GABUS TUPAI ELANG ANGSA ITIK MERAK NURI KENARI LALAT NYAMUK KUTU RAYAP UDANG CUMI SIPUT KERANG BELUT GURITA TERI BEO HIU ANOA BIAWAK KADAL CICAK TOKEK LABA TAWON JANGKRIK KEPIK KUMBANG'),
    // Makanan
    ...x('Makanan', 'SAYUR BAYAM WORTEL KENTANG TOMAT CABAI BAWANG JAGUNG UBI TALAS KACANG KECAP GARAM GULA SELAI MADU PERMEN COKLAT KUE LEMPER BAKWAN CILOK ODENG CIREBON KETAN OPAK TERASI SAMBEL GORENGAN KOLAK BUBUR LAPIS TAPE ONCOM SERUNDENG'),
    // Buah
    ...x('Buah', 'LECI KELAPA TEBU KURMA PIR PLUM BERI CERI NAGA DUKU KEDONDONG SAWO BENGKUANG TERONG LABU'),
    // Tempat
    ...x('Tempat', 'BANK MASJID GEREJA PURA VIHARA DAPUR KAMAR KEBUN SAWAH LADANG DESA KOTA JALAN GANG TERAS GUDANG BENGKEL WARUNG APOTEK PARKIR PULAU ASRAMA MALL KANTIN TOILET GARASI BALKON LOKET'),
    // Alam
    ...x('Alam', 'PETIR GUNTUR BADAI KABUT EMBUN SALJU BULAN LANGIT BUMI TANAH API ABU LAVA DANAU TEBING GOA LEMBAH KARANG RUMPUT DAUN BUNGA POHON AKAR MAWAR MELATI KAKTUS LUMUT RAWA GURUN PULAU TELUK'),
    // Pakaian & aksesoris
    ...x('Pakaian', 'JILBAB SANDAL SABUK DASTER GAUN BATIK KEBAYA JUBAH SYAL KOPIAH PECI MASKER KAOSKAKI SARUNG'),
    ...x('Aksesoris', 'CINCIN GELANG KALUNG ANTING JAM KACAMATA'),
    // Kendaraan
    ...x('Kendaraan', 'KERETA ANGKOT OJEK BAJAJ PERAHU RAKIT TRAM VESPA SKUTER DELMAN HELI JET KANO MOBIL'),
    // Minuman
    ...x('Minuman', 'JAHE WEDANG CENDOL DAWET BOBA LATTE MOCHA KAKAO SARI LEMONTEA'),
    // Profesi
    ...x('Profesi', 'SATPAM SOPIR KURIR TUKANG MONTIR DOSEN BUPATI LURAH KADES ARTIS ATLET PENARI JAKSA BANKIR KASIR SUPIR JAGAL PELAUT PENJAHIT PELUKIS TUKANGBATU'),
    // Hari & bulan
    ...x('Hari', 'SENIN SELASA RABU KAMIS JUMAT SABTU'),
    ...x('Bulan', 'JULI'),
    // Warna
    ...x('Warna', 'KUNING UNGU COKLAT JINGGA EMAS PERAK ABUABU PINK KELABU KREM ORANYE'),
    // Tubuh
    ...x('Tubuh', 'KEPALA RAMBUT MATA HIDUNG MULUT TELINGA GIGI LIDAH LEHER BAHU TANGAN JARI KUKU PERUT KAKI LUTUT JANTUNG OTAK KULIT DAGU PIPI ALIS BIBIR SIKU PINGGANG PAHA'),
    // Keluarga
    ...x('Keluarga', 'AYAH IBU KAKAK ADIK NENEK KAKEK PAMAN BIBI ANAK CUCU SUAMI ISTRI TEMAN KERABAT BAPAK EMAK ABANG'),
    // Olahraga
    ...x('Olahraga', 'TENIS GOLF LARI SILAT KARATE JUDO CATUR VOLI BASKET TINJU SENAM YOGA SELANCAR RENANG SEPAKBOLA PANAHAN'),
    // Alat musik
    ...x('Musik', 'GITAR PIANO DRUM BIOLA GAMELAN SULING KENDANG GONG HARPA BASS TUBA ANGKLUNG REBANA KECAPI TIFA'),
    // Sekolah
    ...x('Sekolah', 'RAPOR UJIAN PAPAN KAPUR BEL TUGAS SISWA GURU KELAS BUKU'),
    // Perasaan
    ...x('Perasaan', 'SENANG SEDIH MARAH TAKUT LAPAR HAUS LELAH KAGET MALU BOSAN CINTA RINDU BANGGA GEMBIRA SABAR KESAL IRI'),
    // Kata kerja
    ...x('Kata kerja', 'MAKAN MINUM TIDUR BANGUN JALAN DUDUK LOMPAT NYANYI BACA TULIS MASAK MANDI CUCI BELI JUAL BUKA TUTUP MAIN KERJA TERTAWA TERBANG DORONG TARIK ANGKAT LEMPAR TANGKAP'),
    // Planet & langit
    ...x('Planet', 'MARS VENUS SATURN PLUTO URANUS BUMI BULAN'),
    ...x('Langit', 'BINTANG KOMET MATAHARI METEOR'),
    // Negara
    ...x('Negara', 'JEPANG CHINA INDIA MESIR KUBA PERU KOREA RUSIA TURKI ITALIA KANADA BRASIL IRAN IRAK ARAB NEPAL LAOS KENYA GHANA'),
    // Ibu kota
    ...x('Ibu kota', 'ROMA PARIS TOKYO LONDON BERLIN MADRID OSLO LIMA KAIRO DELHI SEOUL HANOI MANILA BANGKOK'),
    // Kota
    ...x('Kota', 'SOLO TEGAL KEDIRI JAMBI SERANG AMBON PALU BIMA'),
    // Budaya
    ...x('Budaya', 'BATIK WAYANG KERIS REOG KECAK SAMAN PENDET TORTOR JOGLO GADANG HONAI'),
    // Umum
    ...x('Umum', 'UANG KERJA LIBUR PESTA TAMU PETA HADIAH SURAT PAKET TIKET FOTO FILM LAGU GAME KOMIK'),
  ],

  sedang: [
    // Hewan
    ...x('Hewan', 'SERIGALA CHEETAH LEOPARD BERUANG KEPITING LOBSTER TENGGILING TRENGGILING MUSANG LUTUNG BEKANTAN CENDRAWASIH KAKATUA KUTILANG PERKUTUT MERPATI ELANG ALBATROS FLAMINGO PELIKAN LUMBA ANGSA TUPAI KUNANG KECOA CAPUNG TOKEK KOMODO BIAWAK ULARSAWA IGUANA KAMELEON SALAMANDER DUGONG OKAPI RUSA BANTENG KERBAU TAPIR'),
    // Buah & sayur
    ...x('Buah', 'JAMBUAIR KEDONDONG LANGSAT SAWO KESEMEK CERMAI BLEWAH KELAPA KURMA LYCHEE BLUEBERI ASAM'),
    ...x('Sayur', 'BROKOLI KANGKUNG KUBIS SELEDRI TIMUN LOBAK PARIKA BAYAM SAWI TERONG BUNCIS KECIPIR JAMUR PETAI JENGKOL KENTANG KEMANGI LABUSIAM'),
    // Makanan
    ...x('Makanan', 'KWETIAU BAKMIE LUMPIA SEBLAK TIWUL SURABI KOLAK ONDEHONDE GETUK LEMANG LEPET BAKPIA BAKPAO BIKA PASTEL RISOLES SEMUR RENDANG PERKEDEL KAREDOK LALAPAN SAMBALADO KUEPUTU KUELAPIS DADARGULUNG NASIUDUK NASIKUNING NASILIWET SOTOAYAM BAKSOURAT MIEGORENG INDOMIE SOSIS NUGGET KENTANGGORENG'),
    // Minuman
    ...x('Minuman', 'CAPPUCINO ESPRESSO ESTEH ESDOGER ESTELER ESCAMPUR BANDREK BAJIGUR WEDANGJAHE SEKOTENG KOPILUWAK YOGHURT SMOOTHIE MILKSHAKE'),
    // Benda & elektronik
    ...x('Benda', 'KOPERAN KOMPAS TELESKOP PAYUNG SENTER BATERAI GEMBOK LEMARI BANTAL SELIMUT GORDEN KARPET CERMIN BINGKAI VAS'),
    ...x('Elektronik', 'TABLET SMARTWATCH DRONE MIKROFON PROYEKTOR SCANNER ROUTER MODEM KONSOL JOYSTICK POWERBANK TELEVISI KIPASANGIN PENYEDOT MESINCUCI MIKROWAVE'),
    // Tempat
    ...x('Tempat', 'BIOSKOP APOTEK PUSKESMAS KELURAHAN KECAMATAN KEJAKSAAN PENJARA PERTOKOAN KLENTENG GEREJA MASJID CANDI VIHARA ASRAMA LAPANGAN GELANGGANG KEBUNRAYA KEBUNBINATANG AKUARIUM PLANETARIUM'),
    // Kota
    ...x('Kota', 'TEGAL KEDIRI JAMBI BENGKULU SERANG CIREBON SUKABUMI TANGERANG BLITAR MADIUN KUPANG AMBON TERNATE MATARAM KENDARI GORONTALO BANDAACEH BUKITTINGGI PARIAMAN TARAKAN SORONG MERAUKE PALANGKARAYA TASIKMALAYA PEKALONGAN SALATIGA MAGELANG SURAKARTA JEMBER PROBOLINGGO PASURUAN MOJOKERTO SIDOARJO PURWOKERTO KARAWANG CILEGON BANJAR BINJAI'),
    // Negara & ibu kota
    ...x('Negara', 'INGGRIS JERMAN PRANCIS SPANYOL THAILAND MALAYSIA VIETNAM SINGAPURA FILIPINA MEKSIKO BELANDA PORTUGAL SWISS NORWEGIA SWEDIA FINLANDIA AUSTRIA POLANDIA UKRAINA PAKISTAN AFGANISTAN KAMBOJA MYANMAR BRUNEI TIMORLESTE'),
    ...x('Ibu kota', 'BEIJING CANBERRA WASHINGTON AMSTERDAM LISBON WELLINGTON BRUSSEL VIENNA STOCKHOLM HELSINKI KUALALUMPUR'),
    // Bulan
    ...x('Bulan', 'AGUSTUS OKTOBER NOVEMBER DESEMBER SEPTEMBER FEBRUARI'),
    // Planet & astronomi
    ...x('Planet', 'JUPITER NEPTUNUS MERKURIUS SATURNUS'),
    ...x('Astronomi', 'GALAKSI KOMET METEOR SATELIT ASTEROID BIMASAKTI MATAHARI GERHANA'),
    // Profesi
    ...x('Profesi', 'SATPAM KONDEKTUR MASINIS PRAMUGARI PRAMUNIAGA PETUGAS PENJAGA PENJAHIT PENGRAJIN PEMAHAT PELUKIS PENULIS PENERJEMAH PENERBANG PENYIAR DALANG PEDAGANG PENGUSAHA PERAWAT APOTEKER PSIKOLOG PROFESOR DOSEN SENIMAN MUSISI KOMEDIAN ATLET PELATIH WASIT'),
    // Olahraga
    ...x('Olahraga', 'SEPAKBOLA BULUTANGKIS RENANG ANGKATBESI TENISMEJA PANAHAN BERLARI BALAPAN SELANCAR GULAT PENCAKSILAT BASEBALL HOKI RUGBI BILIARD'),
    // Tubuh & kesehatan
    ...x('Tubuh', 'TENGGOROKAN PERGELANGAN PUNGGUNG TENGKUK JANTUNG PARUPARU LAMBUNG USUS GINJAL HATI OTOT TULANG SENDI JARINGAN'),
    ...x('Kesehatan', 'DEMAM BATUK PILEK PUSING OBAT VAKSIN VITAMIN SUNTIK KLINIK RESEP DIAGNOSA'),
    // Budaya
    ...x('Budaya', 'ANGKLUNG GAMELAN WAYANG BATIK BOROBUDUR PRAMBANAN TONGKONAN SASANDO KOLINTANG JAIPONG SERIMPI LEGONG PIRING REOG ONDELONDEL LENONG TOPENG KETOPRAK ANGGUK ZAPIN'),
    // Perasaan & sifat
    ...x('Sifat', 'PEMBERANI PENYAYANG RAMAH SOPAN JUJUR RAJIN MALAS PELIT DERMAWAN CERDAS BIJAK SABAR TEKUN PEMALU PEMARAH PENAKUT LEMBUT TEGAS'),
    ...x('Perasaan', 'BAHAGIA GEMBIRA KECEWA CEMAS KHAWATIR TERHARU GELISAH SEMANGAT SENANG TENANG'),
    // Alam
    ...x('Alam', 'PELANGI MATAHARI TERBIT TERBENAM KEMARAU PENGHUJAN PEGUNUNGAN AIRTERJUN GUNUNGAPI GEMPA TSUNAMI BANJIR LONGSOR KEBAKARAN ANGINPUTING'),
    // Kata kerja
    ...x('Kata kerja', 'BERLARI BERJALAN BERNYANYI BERMAIN BELAJAR MEMBACA MENULIS MEMASAK BEKERJA BERENANG MENARI TERTAWA MENANGIS BERDOA BERSIH BERSEPEDA MENGAJAR MENGGAMBAR MELUKIS'),
    // Sekolah
    ...x('Sekolah', 'PELAJARAN MATEMATIKA PENGGARIS PENGHAPUS BUKUTULIS UPACARA SERAGAM KANTIN LAPANGAN PERPUSTAKAAN KELULUSAN WISUDA'),
    // Umum
    ...x('Umum', 'LIBURAN PESTA PERAYAAN HADIAH KEJUTAN LEBARAN NATAL IMLEK WAISAK NYEPI KARNAVAL FESTIVAL KONSER PAMERAN'),
  ],

  sulit: [
    // Teknologi
    ...x('Teknologi', 'ALGORITMA APLIKASI TEKNOLOGI INFORMASI PEMROGRAMAN KONEKSI PASSWORD BROWSER DOWNLOAD KEAMANAN ENKRIPSI PROSESOR MEMORI BATERAI FOTOGRAFI TELEKOMUNIKASI KECERDASANBUATAN MEDIASOSIAL PLATFORM SOFTWARE HARDWARE INTERFACE FRAMEWORK REPOSITORI CYBERSECURITY'),
    // Sains
    ...x('Sains', 'GRAVITASI ASTRONOMI FOTOSINTESIS EVOLUSI BIOLOGI FISIKA KIMIA MATEMATIKA GEOGRAFI SEJARAH EKONOMI SOSIOLOGI ARKEOLOGI METEOROLOGI ATMOSFER GALAKSI TATASURYA SATELIT TELESKOP MIKROSKOP ELEKTRON MOLEKUL ENERGI RADIASI MAGNET LISTRIK TURBIN GENERATOR REAKTOR VAKSIN BAKTERI ANTIBIOTIK EKOSISTEM EKOLOGI GENETIKA KROMOSOM'),
    // Pahlawan & sejarah
    ...x('Pahlawan', 'KARTINI DIPONEGORO SOEKARNO SUDIRMAN HASANUDDIN PATTIMURA IMAMBONJOL CUTNYAKDIEN KIHAJARDEWANTARA'),
    ...x('Sejarah', 'MAJAPAHIT SRIWIJAYA MATARAM KOLONIAL PENJAJAHAN PERLAWANAN SUMPAHPEMUDA REFORMASI KONSTITUSI KEMERDEKAAN PROKLAMASI'),
    // Budaya & tempat bersejarah
    ...x('Budaya', 'BOROBUDUR PRAMBANAN LAWANGSEWU TONGKONAN KOLINTANG SASANDO ANGKLUNG GAMELAN WAYANGKULIT TARIPENDET BATIKTULIS'),
    ...x('Tempat', 'MONUMENNASIONAL TAMANMINI KEBUNRAYA PERPUSTAKAAN PEMERINTAHAN KANTORPOS BALAIKOTA GEDUNGKESENIAN PUSATPERBELANJAAN'),
    // Makanan
    ...x('Makanan', 'CHEESECAKE TIRAMISU KENTANGGORENG ESCAMPUR KWETIAUGORENG NASIKUNING SOTOBETAWI GADOGADO ASINANSAYUR BUBURAYAM LONTONGSAYUR KETOPRAKJAKARTA SATEKAMBING GULAIKAMBING AYAMPENYET PECELLELE'),
    // Negara
    ...x('Negara', 'AUSTRALIA ARGENTINA BANGLADESH SELANDIABARU AFRIKASELATAN ARABSAUDI FILIPINA KAMBOJA SRILANKA UZBEKISTAN KAZAKHSTAN'),
    // Provinsi & pulau
    ...x('Provinsi', 'SUMATERABARAT SUMATERAUTARA SUMATERASELATAN JAWABARAT JAWATENGAH JAWATIMUR KALIMANTANTIMUR SULAWESISELATAN NUSATENGGARA PAPUABARAT KEPULAUANRIAU BANGKABELITUNG'),
    ...x('Pulau', 'HALMAHERA KARIMUNJAWA BELITUNG BANGKA ENGGANO SIMEULUE MENTAWAI NIAS BUNAKEN RAJAAMPAT WAKATOBI DERAWAN KOMODO'),
    // Abstrak
    ...x('Abstrak', 'KEADILAN KESEHATAN KEAMANAN KEMAKMURAN KESABARAN KESETIAAN KEPEMIMPINAN TANGGUNGJAWAB KESEDERHANAAN PERDAMAIAN PERSATUAN KERJASAMA KEMANDIRIAN KEPERCAYAAN KEBERSAMAAN KETEKUNAN KEDISIPLINAN PENDIDIKAN LINGKUNGAN PEMERINTAH DEMOKRASI PEMILIHAN PERDAGANGAN'),
    ...x('Sektor', 'PERTANIAN PERIKANAN PETERNAKAN PERTAMBANGAN PERINDUSTRIAN PARIWISATA KEHUTANAN PERKEBUNAN KONSTRUKSI TRANSPORTASI'),
    // Profesi
    ...x('Profesi', 'PSIKOLOG APOTEKER PROFESOR KOMEDIAN ANALIS KONSULTAN AKUNTAN AUDITOR PENERJEMAH PENERBANG PRAMUGARI DETEKTIF DIPLOMAT PRESIDEN GUBERNUR WALIKOTA SEKRETARIS NOTARIS ARKEOLOG ASTRONOM BIOLOGI PENELITI'),
    // Alam & lingkungan
    ...x('Alam', 'KEANEKARAGAMAN PELESTARIAN PEMANASANGLOBAL PERUBAHANIKLIM GUNUNGBERAPI TERUMBUKARANG HUTANHUJAN LAHANBASAH SUMBERDAYA ENERGIBARU ENERGISURYA'),
    // Hewan & tumbuhan
    ...x('Hewan', 'KUPUKUPU TRENGGILING CENDRAWASIH BEKANTAN MACANTUTUL HARIMAUSUMATERA ORANGUTAN BADAKJAWA ANOA JALAK BALI ELANGJAWA'),
    ...x('Tanaman', 'ANGGREK RAFFLESIA BUNGABANGKAI CEMARA BERINGIN TEMBAKAU CENGKEH PALA KAYUMANIS KELAPASAWIT KARET KOPI KAKAO'),
    // Olahraga & hiburan
    ...x('Olahraga', 'SEPAKBOLA BULUTANGKIS ANGKATBESI PENCAKSILAT PANJATTEBING SELANCARAN OLIMPIADE JIMNASTIK ATLETIK TRIATLON MARATHON'),
    ...x('Hiburan', 'FOTOGRAFI SINEMATOGRAFI KOREOGRAFI ANIMASI DOKUMENTER PERTUNJUKAN ORKESTRA KONSERVATORIUM PAMERANSENI'),
    // Kata kerja & proses
    ...x('Proses', 'PERTUMBUHAN PERBAIKAN PERKEMBANGAN PEMBELAJARAN PEMBUATAN PENGIRIMAN PENGUMPULAN PENGAMATAN PERCOBAAN PENELITIAN'),
    // Perasaan & sifat
    ...x('Sifat', 'KEDERMAWANAN KERENDAHAN KEKUATAN KETEGASAN KEBIJAKSANAAN KESETIAKAWANAN KEPEDULIAN KESABARAN KEIKHLASAN KESOPANAN'),
  ],
};

// Opsional: data/words.json = { "mudah": [["KUCING","Hewan"], ...], "sedang": [...], "sulit": [...] }
async function loadWords(level) {
  const lv = BANK[level] ? level : DEFAULT_LEVEL;
  let list = [...BANK[lv], ...(EXTRA[lv] || [])];
  try {
    const file = path.join(__dirname, '..', 'data', 'words.json');
    if (fs.existsSync(file)) {
      const custom = JSON.parse(fs.readFileSync(file, 'utf8'))[lv];
      if (Array.isArray(custom) && custom.length) list = custom;
    }
  } catch (e) { console.error('[words] words.json gagal dibaca:', e.message); }

  // normalisasi + buang kata ganda (kata yang sama hanya dipakai sekali)
  const seen = new Set();
  const out = [];
  for (const [w, c] of list) {
    const word = String(w).toUpperCase().replace(/[^A-Z]/g, '');
    if (word.length < 3 || seen.has(word)) continue;
    seen.add(word);
    out.push([word, String(c || 'Umum')]);
  }
  return out;
}

module.exports = { loadWords, LEVELS, DEFAULT_LEVEL };
