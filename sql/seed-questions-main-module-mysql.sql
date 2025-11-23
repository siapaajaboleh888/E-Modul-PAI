-- Seed 10 soal pilihan ganda untuk modul Etika dan Peran Islam dalam Tantangan Kontemporer
-- Pastikan seed-main-module-mysql.sql sudah dijalankan sebelum file ini

START TRANSACTION;

-- Ambil activity_id untuk masing-masing kuis berdasarkan judulnya
SET @quiz_unit1_id := (SELECT id FROM activities WHERE title = 'Kuis Unit 1 – Etika Digital' LIMIT 1);
SET @quiz_unit2_id := (SELECT id FROM activities WHERE title = 'Kuis Unit 2 – Keadilan & Muamalah' LIMIT 1);
SET @quiz_unit3_id := (SELECT id FROM activities WHERE title = 'Kuis Unit 3 – Toleransi & Moderasi' LIMIT 1);

-- Soal Unit 1 (3 soal)
INSERT INTO questions (activity_id, question_text, question_type, options_json, answer_key, ordering) VALUES
(@quiz_unit1_id,
 'Prinsip dasar dalam Islam yang mengajarkan pentingnya melakukan verifikasi atau klarifikasi terhadap informasi, terutama berita yang diterima melalui media digital atau jaringan sosial, disebut Tabayyun. Pelanggaran prinsip ini secara langsung akan melanggar nilai...',
 'MCQ',
 '{"A":"Keadilan Sosial","B":"Toleransi","C":"Tanggung Jawab dan Etika Digital","D":"Empati Sosial"}',
 'C',
 1),

(@quiz_unit1_id,
 'Seorang mahasiswa PTU menyebarkan tangkapan layar percakapan pribadi temannya yang bersifat aib di grup media sosial. Tindakan ini dalam etika Islam dikenal sebagai ghibah atau fitnah. Konsep ini secara langsung melanggar nilai transformatif yang mana, yang seharusnya dipupuk dalam interaksi digital?',
 'MCQ',
 '{"A":"Wasatiyah (Sikap Moderat)","B":"Empati dan Etika Digital","C":"Kejujuran Intelektual","D":"Keadilan Muamalah"}',
 'B',
 2),

(@quiz_unit1_id,
 'Menurut hasil analisis kebutuhan, E-Modul Interaktif PAI perlu dirancang dengan antarmuka yang bersih dan minim elemen yang tidak relevan (seperti pop-up atau animasi berlebihan). Penerapan desain ini dalam teori pembelajaran bertujuan untuk meminimalkan...',
 'MCQ',
 '{"A":"Germane Load (Beban Kognitif Relevan)","B":"Extraneous Load (Beban Kognitif yang Tidak Relevan)","C":"Afektif Load (Beban Afektif)","D":"Konatif Load (Beban Aplikasi)"}',
 'B',
 3);

-- Soal Unit 2 (3 soal)
INSERT INTO questions (activity_id, question_text, question_type, options_json, answer_key, ordering) VALUES
(@quiz_unit2_id,
 'Seorang mahasiswa di jurusan teknik menggunakan coding hasil karya temannya tanpa izin dan tidak mencantumkan sumber, lalu mengklaimnya sebagai tugas akhir miliknya. Tindakan ini melanggar nilai keberagamaan transformatif Kejujuran Intelektual. Nilai ini termasuk dalam upaya menjaga salah satu pilar Maqashid Syariah, yaitu menjaga...',
 'MCQ',
 '{"A":"Agama (Hifz al-Din)","B":"Jiwa (Hifz al-Nafs)","C":"Akal (Hifz al-''Aql)","D":"Keturunan (Hifz al-Nasl)"}',
 'C',
 1),

(@quiz_unit2_id,
 'Prinsip Muamalah (etika transaksi) dalam Islam menekankan transparansi dan kejelasan. Dalam konteks bisnis online yang kontemporer, penerapan nilai Kejujuran dalam Muamalah dapat diwujudkan melalui...',
 'MCQ',
 '{"A":"Memberikan diskon besar-besaran untuk menarik konsumen","B":"Menjelaskan secara jujur kualitas barang, termasuk cacat yang mungkin ada","C":"Menghindari transaksi yang melibatkan bank syariah","D":"Menggunakan media sosial untuk berpromosi secara agresif"}',
 'B',
 2),

(@quiz_unit2_id,
 'Nilai Keadilan Sosial (H2 Diterima) dalam E-Modul ini ditanamkan agar mahasiswa memiliki kesadaran terhadap isu ketidakadilan dan inisiatif mencari solusi yang adil. Dalam konteks profesional, perwujudan nilai ini adalah...',
 'MCQ',
 '{"A":"Menghindari politik kampus agar fokus pada akademik","B":"Mendesain sistem atau produk yang dapat diakses oleh semua lapisan masyarakat (prinsip inklusif)","C":"Memprioritaskan rekan kerja sesama muslim dalam proyek","D":"Mengkritik kebijakan pemerintah tanpa memberikan solusi alternatif"}',
 'B',
 3);

-- Soal Unit 3 (4 soal)
INSERT INTO questions (activity_id, question_text, question_type, options_json, answer_key, ordering) VALUES
(@quiz_unit3_id,
 'Tujuan utama pengintegrasian nilai Toleransi dan Empati dalam E-Modul PAI di PTU, sesuai temuan riset, adalah untuk...',
 'MCQ',
 '{"A":"Memahami semua ajaran agama lain secara mendalam","B":"Menghafal dalil-dalil tentang kerukunan","C":"Meningkatkan pemahaman multikulturalisme dan mencegah radikalisme","D":"Menunjukkan superioritas ajaran Islam"}',
 'C',
 1),

(@quiz_unit3_id,
 'Seorang mahasiswa berpartisipasi dalam diskusi panas mengenai pandangan keagamaan yang berbeda. Sikap Moderat (Wasatiyah) yang perlu diterapkan dalam situasi ini adalah...',
 'MCQ',
 '{"A":"Memaksakan pandangan mayoritas sebagai satu-satunya kebenaran","B":"Menarik diri dari diskusi untuk menghindari konflik","C":"Berpegang pada prinsip kebenaran tetapi menghormati pandangan yang berbeda dengan argumen yang santun","D":"Mencari dukungan viral di media sosial untuk memenangkan perdebatan"}',
 'C',
 2),

(@quiz_unit3_id,
 'Fitur Area Refleksi Nilai dalam E-Modul PAI memiliki peran kunci dalam proses Teori Transformasi Nilai (H2 Diterima). Fungsi utama fitur ini adalah...',
 'MCQ',
 '{"A":"Mencatat skor akhir kuis mahasiswa","B":"Menggantikan tugas menulis esai manual dosen","C":"Memberikan ruang bagi mahasiswa untuk menginternalisasi nilai dan mengaitkannya secara eksplisit dengan solusi masalah","D":"Menilai seberapa cepat mahasiswa menyelesaikan unit"}',
 'C',
 3),

(@quiz_unit3_id,
 'Salah satu tantangan kunci yang teridentifikasi dalam Tahap Analisis adalah kualitas koneksi sinyal sporadis di beberapa PTU Madura. Upaya mitigasi teknis yang dilakukan tim peneliti pada E-Modul untuk mengatasi masalah ini adalah...',
 'MCQ',
 '{"A":"Mewajibkan mahasiswa menggunakan jaringan LAN kampus","B":"Melakukan optimasi ukuran file media digital (video/animasi) pasca-Alpha Testing","C":"Menghilangkan fitur PBL dan menggantinya dengan teks padat","D":"Menerapkan skema basis data non-relasional"}',
 'B',
 4);

COMMIT;
