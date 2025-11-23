-- Seed modul utama: Etika dan Peran Islam dalam Tantangan Kontemporer
-- Jalankan file ini setelah schema-mysql.sql dan schema-activities-mysql.sql

START TRANSACTION;

-- 1) Tambah modul
INSERT INTO modules (title, description, learning_outcomes, ordering, is_active)
VALUES (
  'Etika dan Peran Islam dalam Tantangan Kontemporer',
  'Modul ini dirancang untuk mengatasi tantangan pembelajaran PAI yang dianggap kurang aplikatif dan memfasilitasi internalisasi nilai yang berdampak positif bagi masyarakat.',
  'Mahasiswa mampu menerapkan nilai-nilai Islam (etika digital, keadilan sosial, moderasi beragama) dalam konteks kehidupan kontemporer, termasuk dunia digital, muamalah modern, dan keberagaman di kampus.',
  1,
  1
);

SET @module_id := LAST_INSERT_ID();

-- 2) Tambah tiga unit
INSERT INTO units (module_id, title, description, ordering) VALUES
(@module_id, 'Unit 1: Etika Digital dan Jaringan Sosial', 'Unit ini membahas etika bermedia digital, prinsip tabayyun, serta pengendalian ghibah dan fitnah di ruang virtual.', 1),
(@module_id, 'Unit 2: Keadilan Sosial dan Muamalah Kontemporer', 'Unit ini mengkaji keadilan sosial, kejujuran intelektual, dan etika muamalah dalam transaksi ekonomi modern.', 2),
(@module_id, 'Unit 3: Toleransi dan Keberagaman dalam Konteks PTU', 'Unit ini menekankan pentingnya toleransi, sikap moderat (wasatiyah), dan empati sosial di lingkungan kampus multikultural.', 3);

-- Simpan id unit
SET @unit1_id := (SELECT id FROM units WHERE module_id = @module_id AND ordering = 1 LIMIT 1);
SET @unit2_id := (SELECT id FROM units WHERE module_id = @module_id AND ordering = 2 LIMIT 1);
SET @unit3_id := (SELECT id FROM units WHERE module_id = @module_id AND ordering = 3 LIMIT 1);

-- 3) Tambah materi utama per unit

INSERT INTO materials (unit_id, title, content, media_type)
VALUES
(@unit1_id,
 'Etika Digital dan Akhlakul Karimah di Media Sosial',
 'Tujuan Pembelajaran:\n- Menjelaskan konsep etika digital dalam perspektif Islam.\n- Mengidentifikasi bentuk pelanggaran etika digital seperti ghibah, fitnah, dan penyebaran hoaks.\n- Menerapkan prinsip tabayyun, empati, dan tanggung jawab sosial dalam aktivitas bermedia digital.\n\nA. Tantangan Etika di Era Digital\nEra digital membuka peluang besar, tetapi juga melahirkan berbagai masalah etis seperti cyberbullying, penyebaran hoaks, ujaran kebencian, dan penyalahgunaan jejak digital (digital footprint). Mahasiswa PTU setiap hari berinteraksi dengan media sosial, sehingga membutuhkan landasan moral yang kuat agar tetap berakhlak mulia dalam ruang digital.\n\nB. Akhlakul Karimah dalam Interaksi Digital\nAkhlakul karimah tidak hanya berlaku di dunia nyata, tetapi juga di dunia maya. Prinsip: menjaga lisan dan tulisan dari kata-kata yang menyakitkan; menghindari penghinaan, cemoohan, dan komentar kasar; menghargai privasi orang lain. Dalam konteks digital, satu unggahan dapat tersebar luas dan meninggalkan jejak permanen, sehingga setiap komentar, like, share, dan unggahan harus dipertimbangkan dari sisi manfaat dan mudaratnya.\n\nC. Ghibah, Fitnah, dan Penyebaran Aib di Media Sosial\nGhibah adalah membicarakan keburukan saudara Muslim di belakangnya, sedangkan fitnah adalah tuduhan palsu yang merusak kehormatan orang lain. Di media sosial, hal ini bisa terjadi melalui menyebarkan tangkapan layar percakapan pribadi, menyebarkan video atau foto yang memalukan tanpa izin, atau mengomentari kekurangan orang lain di kolom komentar.\n\nD. Prinsip Tabayyun dalam Informasi Digital\nTabayyun berarti melakukan klarifikasi atau verifikasi sebelum menyebarkan informasi. Dalam konteks berita digital: jangan langsung meneruskan pesan yang belum jelas sumbernya, cek kebenaran melalui sumber tepercaya, dan pertimbangkan dampaknya bagi orang lain. Mengabaikan tabayyun berarti melanggar nilai tanggung jawab dan etika digital.\n\nE. Tanggung Jawab Sosial sebagai Warga Digital\nMuslim adalah khoirul ummah yang membawa kebaikan di mana pun ia berada, termasuk di ruang digital. Warga digital yang beretika menggunakan media sosial untuk menyebar ilmu dan inspirasi kebaikan, menghindari konten yang memecah belah, dan mengedepankan empati saat merespons perbedaan pendapat.\n\nArea Refleksi Nilai:\nTuliskan satu pengalaman Anda terkait media sosial (misalnya pernah melihat kasus cyberbullying atau hoaks). Jelaskan: (1) Apa yang terjadi? (2) Nilai apa yang seharusnya diterapkan (misal: empati, tabayyun, tanggung jawab)? (3) Jika Anda berada dalam situasi itu, apa yang akan Anda lakukan?',
 'TEXT'),

(@unit2_id,
 'Keadilan Sosial dan Etika Muamalah di Era Digital',
 'Tujuan Pembelajaran:\n- Menjelaskan konsep keadilan sosial dalam perspektif Islam dan maqashid syariah.\n- Mengaitkan nilai kejujuran intelektual dan amanah dengan praktik profesional sehari-hari.\n- Mengaplikasikan prinsip muamalah yang adil dan transparan dalam transaksi digital.\n\nA. Keadilan Sosial dalam Perspektif Islam\nKeadilan sosial adalah kondisi ketika hak-hak masyarakat dipenuhi secara seimbang, tanpa diskriminasi. Dalam maqashid syariah, keadilan terkait dengan penjagaan agama, jiwa, akal, keturunan, dan harta. Mahasiswa PTU dipersiapkan sebagai calon profesional yang harus berkontribusi pada terwujudnya masyarakat yang adil dan sejahtera.\n\nB. Kejujuran Intelektual dan Plagiarisme\nKejujuran intelektual adalah sikap jujur dalam berpikir, meneliti, menulis, dan mengakui sumber ide. Contoh pelanggaran: menyalin tugas atau kode program milik teman tanpa izin dan tanpa mencantumkan sumber, atau mengutip teori dari internet tanpa referensi. Perilaku ini merusak Hifz al-Aql (penjagaan akal) dan melanggar amanah ilmiah.\n\nC. Prinsip Muamalah dalam Transaksi Digital\nMuamalah mengatur hubungan ekonomi dan sosial antar manusia. Dalam bisnis online harus ada kejelasan objek jual-beli, harga, dan kondisi barang. Penjual wajib jujur menjelaskan kualitas barang, termasuk cacat yang ada; tidak boleh ada penipuan atau false advertising.\n\nD. Keadilan dan Inklusivitas dalam Profesi\nNilai keadilan sosial mendorong lulusan PTU untuk mendesain produk, sistem, atau layanan yang dapat diakses oleh berbagai lapisan masyarakat (inklusi), menghindari praktik diskriminatif, dan menggunakan ilmu untuk meminimalkan kesenjangan sosial.\n\nE. Tanggung Jawab Profesional dan Amanah\nAmanah profesional berarti menjalankan tugas sesuai standar etika dan kompetensi, meski tidak diawasi, misalnya tidak memanipulasi laporan teknis, tidak menerima suap, dan berani menolak praktik yang merugikan masyarakat.\n\nArea Refleksi Nilai:\nPilih satu contoh kasus nyata (bisnis online, proyek kampus, atau magang). Analisis: (1) Di mana letak potensi ketidakadilan atau ketidakjujuran? (2) Bagaimana prinsip kejujuran intelektual dan keadilan sosial seharusnya diterapkan? (3) Usulkan langkah konkret untuk memperbaiki situasi tersebut.',
 'TEXT'),

(@unit3_id,
 'Toleransi, Moderasi Beragama, dan Empati di Kampus Multikultural',
 'Tujuan Pembelajaran:\n- Menjelaskan konsep ukhuwah, tasamuh (toleransi), dan wasatiyah (moderasi beragama).\n- Mengidentifikasi bentuk sikap intoleran dan radikal di lingkungan kampus maupun media sosial.\n- Menunjukkan sikap empati dan moderat dalam interaksi dengan pihak yang berbeda agama, suku, atau pandangan.\n\nA. Keberagaman di Lingkungan PTU\nPerguruan Tinggi Umum adalah ruang pertemuan berbagai latar belakang agama, etnis, budaya, dan pandangan sosial. Keberagaman ini adalah potensi sekaligus tantangan. Tanpa pengelolaan nilai yang tepat, dapat muncul prasangka, diskriminasi, dan konflik.\n\nB. Konsep Ukhuwah dan Tasamuh\nUkhuwah Islamiyah, Wathaniyah, dan Insaniyah menjadi dasar hubungan sosial. Tasamuh berarti menghormati perbedaan keyakinan dan praktik ibadah orang lain, tidak memaksakan pandangan sendiri dengan cara yang kasar atau merendahkan, dan tetap menjaga adab dalam perbedaan pendapat.\n\nC. Wasatiyah (Sikap Moderat) dalam Beragama\nWasatiyah adalah sikap seimbang: tidak berlebihan dan tidak meremehkan. Ciri-cirinya: menghindari fanatisme sempit, mengedepankan musyawarah dan argumen ilmiah, serta menolak kekerasan dan pemaksaan dalam dakwah.\n\nD. Tantangan Intoleransi dan Radikalisme di Era Digital\nMedia sosial sering menjadi ruang penyebaran ujaran kebencian, stereotip negatif, dan ajakan intoleran. Mahasiswa perlu mewaspadai konten yang mengkafirkan kelompok lain, tidak mudah terprovokasi oleh potongan video atau teks yang lepas konteks, dan menggunakan tabayyun saat menghadapi isu sensitif.\n\nE. Empati Sosial dan Dialog Konstruktif\nEmpati adalah kemampuan merasakan dari sudut pandang orang lain. Dalam konteks keberagaman: mendengarkan pengalaman kelompok minoritas, menghindari candaan yang merendahkan identitas tertentu, dan mengembangkan dialog yang bertujuan mencari solusi.\n\nArea Refleksi Nilai:\nBayangkan sebuah kasus konflik atau diskriminasi di kampus (atau di media sosial kampus). Tulis: (1) Apa bentuk ketidakadilan atau sikap tidak toleran yang terjadi? (2) Bagaimana sikap wasatiyah dan empati dapat membantu menyelesaikan masalah? (3) Tindakan konkret apa yang bisa Anda lakukan untuk menjaga suasana kampus yang damai?',
 'TEXT');

-- 4) Tambah aktivitas TUGAS dan KUIS untuk tiap unit (pertanyaan kuis bisa diisi belakangan lewat aplikasi)

-- Unit 1
INSERT INTO activities (unit_id, type, title, description, max_score)
VALUES
(@unit1_id, 'TASK', 'Refleksi Nilai Etika Digital', 'Tugas refleksi tentang pengalaman etika digital (cyberbullying, hoaks, atau privasi) dan penerapan nilai empati, tabayyun, dan tanggung jawab.', 100),
(@unit1_id, 'QUIZ', 'Kuis Unit 1 – Etika Digital', 'Kuis formatif untuk mengukur pemahaman konsep etika digital, ghibah/fitnah, dan tabayyun.', 100);

-- Unit 2
INSERT INTO activities (unit_id, type, title, description, max_score)
VALUES
(@unit2_id, 'TASK', 'Analisis Keadilan Sosial dan Muamalah', 'Tugas analisis kasus nyata terkait keadilan sosial, kejujuran intelektual, dan etika muamalah dalam praktik ekonomi modern.', 100),
(@unit2_id, 'QUIZ', 'Kuis Unit 2 – Keadilan & Muamalah', 'Kuis formatif tentang keadilan sosial, maqashid syariah, dan prinsip muamalah dalam transaksi digital.', 100);

-- Unit 3
INSERT INTO activities (unit_id, type, title, description, max_score)
VALUES
(@unit3_id, 'TASK', 'Refleksi Toleransi dan Moderasi Beragama', 'Tugas refleksi kasus konflik atau diskriminasi di kampus dan solusi berdasarkan nilai toleransi, wasatiyah, dan empati.', 100),
(@unit3_id, 'QUIZ', 'Kuis Unit 3 – Toleransi & Moderasi', 'Kuis formatif mengenai konsep ukhuwah, tasamuh, dan wasatiyah dalam konteks kampus multikultural.', 100);

COMMIT;
