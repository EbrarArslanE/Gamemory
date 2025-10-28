console.clear()
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 2222;

// Body parser gerekmedikçe yok
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'app')));

app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'app/pages/anasayfa/anasayfa.html'));});
app.use('/data/DATA/uploads', express.static(path.join(__dirname, '../database/Uploads')));

app.use('/oyunTanimlari', express.static(path.join(__dirname, 'app/pages/tanimlar/oyunTanimlari')));
app.use('/kategoriTanimlari', express.static(path.join(__dirname, 'app/pages/tanimlar/kategoriTanimlari')));

const OYUN_SORGU = path.join(__dirname, '../database/DataList/oyunListesi.json');
const KATEGORI_SORGU = path.join(__dirname, '../database/DataList/kategoriListesi.json');


// fs.readFile(<sorguyu buraya yaz kontrol için>, 'utf8', (err, data) => {
//   if(err) return console.error('Dosya okunamadı:', err);
//   console.log('Dosya başarıyla okundu:', data);
// });


const UPLOADS_DIR = path.join(__dirname, '../database/Uploads');

// 🔹 Klasör yoksa oluştur
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    // Dosya ismini benzersiz yapmak için zaman damgası ekle
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

// 🔹 Çoklu dosya yüklemeyi destekle
const upload = multer({ storage });


// ID dosya yolu
const OYUN_ID_OLUSTUR  = path.join(__dirname, '../database/ID_List/oyunID.txt');
const KATEGORI_ID_OLUSTUR  = path.join(__dirname, '../database/ID_List/kategoriID.txt');

//! ID ÜRET 
async function GET_OYUN_ID() {
  try {
    let data;
    try {
      data = await fs.promises.readFile(OYUN_ID_OLUSTUR, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.promises.writeFile(OYUN_ID_OLUSTUR, '1', 'utf8');
        return 1;
      }
      throw err;
    }

    let currentId = parseInt(data, 10);
    if (isNaN(currentId)) currentId = 0;

    const newId = currentId + 1;
    await fs.promises.writeFile(OYUN_ID_OLUSTUR, newId.toString(), 'utf8');
    return newId;

  } catch (err) {
    console.error('ID üretme hatası:', err);
    throw err;
  }
}
async function GET_KATEGORI_ID() {
  try {
    let data;
    try {
      data = await fs.promises.readFile(KATEGORI_ID_OLUSTUR, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.promises.writeFile(KATEGORI_ID_OLUSTUR, '1', 'utf8');
        return 1;
      }
      throw err;
    }

    let currentId = parseInt(data, 10);
    if (isNaN(currentId)) currentId = 0;

    const newId = currentId + 1;
    await fs.promises.writeFile(KATEGORI_ID_OLUSTUR, newId.toString(), 'utf8');
    return newId;

  } catch (err) {
    console.error('ID üretme hatası:', err);
    throw err;
  }
}

// ! LİSTELEME
app.get('/oyunListesi/oyunListele', async (req, res) => {
  try {
    const data = await fs.promises.readFile(OYUN_SORGU, 'utf8'); // burası promise
    const jsonData = JSON.parse(data || '[]'); // dosya boşsa []
    res.json(jsonData);
  } catch (err) {
    console.error('Listeleme hatası:', err);
    res.json([]); // hata olsa bile boş array dön
  }
});

app.get('/kategoriTanimlari/kategoriListele', async (req, res) => {
  try {
    const data = await fs.promises.readFile(KATEGORI_SORGU, 'utf8'); // burası promise
    const jsonData = JSON.parse(data || '[]'); // dosya boşsa []
    res.json(jsonData);
  } catch (err) {
    console.error('Listeleme hatası:', err);
    res.json([]); // hata olsa bile boş array dön
  }
});

// ! EKLEME
app.post('/oyunListesi/oyunEkle', async (req, res) => {
  try {
    const {
      e_oyun_adi,
      e_oyun_indirme_linki,
      e_durum,
      e_aciklama,
      e_oyun_kategorisi,
      e_eklenme_tarihi,
      e_boyut,
      e_oyun_gorseli
    } = req.body;

    if (!e_oyun_adi || !e_durum) {
      return res.status(400).json({ hata: 'Eksik oyun adı veya durum bilgisi' });
    }

    // e_oyun_gorseli güvenli şekilde parse et
    let oyunGorselleri = [];
    if (e_oyun_gorseli) {
      if (typeof e_oyun_gorseli === 'string') {
        try {
          oyunGorselleri = JSON.parse(e_oyun_gorseli);
          if (!Array.isArray(oyunGorselleri)) oyunGorselleri = [oyunGorselleri];
        } catch {
          oyunGorselleri = [e_oyun_gorseli];
        }
      } else if (Array.isArray(e_oyun_gorseli)) {
        oyunGorselleri = e_oyun_gorseli;
      } else {
        oyunGorselleri = [e_oyun_gorseli];
      }
    }

    // ID üretme kısmı aynen
    const yeniID = await GET_OYUN_ID();

    const yeniOyunTanimi = {
      e_id: String(yeniID),
      e_oyun_adi,
      e_oyun_indirme_linki,
      e_durum,
      e_aciklama,
      e_oyun_kategorisi,
      e_boyut,
      e_eklenme_tarihi,
      e_oyun_gorseli: oyunGorselleri
    };

    // JSON dosyadan oku
    let oyunListesi = [];
    try {
      const data = await fs.promises.readFile(OYUN_SORGU, 'utf8');
      oyunListesi = data ? JSON.parse(data) : [];
    } catch {
      oyunListesi = [];
    }

    // Yeni oyunu ekle
    oyunListesi.push(yeniOyunTanimi);
    await fs.promises.writeFile(OYUN_SORGU, JSON.stringify(oyunListesi, null, 2), 'utf8');

    res.json({ mesaj: 'Oyun başarıyla oluşturuldu!', e_id: yeniID });

  } catch (err) {
    console.error('Oyun ekleme hatası:', err);
    res.status(500).json({ hata: 'Oyun kaydedilemedi' });
  }
});

app.post('/kategoriTanimlari/kategoriEkle', async (req, res) => {
  const { e_kategori_adi, e_durum } = req.body;

  if (!e_kategori_adi || !e_durum) {
    return res.status(400).json({ hata: 'Eksik Kategori bilgisi' });
  }

  try {
    const yeniID = await GET_KATEGORI_ID(); // ✅ callback değil await kullan

    const yeniKategoriTanimi = {
      e_id: String(yeniID),
      e_kategori_adi,
      e_durum
    };

    let kategoriTanimlari = [];

    try {
      const data = await fs.promises.readFile(KATEGORI_SORGU, 'utf8');
      if (data) kategoriTanimlari = JSON.parse(data);
    } catch (err) {
      console.warn('KATEGORI_SORGU dosyası okunamadı, yeni oluşturulacak.');
    }

    kategoriTanimlari.push(yeniKategoriTanimi);

    await fs.promises.writeFile(KATEGORI_SORGU, JSON.stringify(kategoriTanimlari, null, 2), 'utf8');

    console.log('Kategori eklendi:', yeniKategoriTanimi);
    res.json({ mesaj: 'Kategori başarıyla oluşturuldu!', e_id: yeniID });

  } catch (err) {
    console.error('Kategori ekleme hatası:', err);
    res.status(500).json({ hata: 'Kategori eklenirken hata oluştu.' });
  }
});


//! DÜZENLEME
app.post('/oyunListesi/oyunDuzenle', (req, res) => {
  const {
    e_id,             
    e_oyun_adi,
    e_oyun_indirme_linki,
    e_durum,
    e_aciklama,
    e_oyun_kategorisi,
    e_eklenme_tarihi,
    e_boyut,
    e_oyun_gorseli
  } = req.body;

  if (!e_id) {
    return res.status(400).json({ Hata: 'e_id bulunamıyor.' });
  }

  fs.readFile(OYUN_SORGU, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ Hata: 'Veriler okunamıyor.' });
    }

    let veriListesi;
    try {
      veriListesi = JSON.parse(data);   // ✅ tek parse
    } catch (parseErr) {
      return res.status(500).json({ Hata: 'Veri formatı hatalı.' });
    }

    let kayitBulundu = false;

    const duzenlenmisListe = veriListesi.map(kayit => {
      if (String(kayit.e_id) === String(e_id)) {   // ✅ doğru karşılaştırma
        kayit.e_oyun_adi            = e_oyun_adi            ?? kayit.e_oyun_adi;
        kayit.e_oyun_indirme_linki  = e_oyun_indirme_linki  ?? kayit.e_oyun_indirme_linki;
        kayit.e_durum               = e_durum               ?? kayit.e_durum;
        kayit.e_aciklama            = e_aciklama            ?? kayit.e_aciklama;
        kayit.e_eklenme_tarihi      = e_eklenme_tarihi      ?? kayit.e_eklenme_tarihi;
        if (e_oyun_gorseli && Array.isArray(e_oyun_gorseli)) {
          kayit.e_oyun_gorseli = [...kayit.e_oyun_gorseli, ...e_oyun_gorseli];
        }
        kayit.e_boyut               = e_boyut               ?? kayit.e_boyut;
        kayit.e_oyun_kategorisi     = e_oyun_kategorisi     ?? kayit.e_oyun_kategorisi;
        kayitBulundu = true;
      }
      return kayit;
    });

    if (!kayitBulundu) {
      return res.status(404).json({ Hata: 'Düzenlemeye çalıştığınız kayıt bulunamadı.' });
    }

    fs.writeFile(
      OYUN_SORGU,
      JSON.stringify(duzenlenmisListe, null, 2),
      err => {
        if (err) {
          return res.status(500).json({ Hata: 'İşlem kaydedilirken bir sorun oluştu: Düzenleme başarısız.' });
        }
        res.json({ Mesaj: 'İşlem Başarılı.' });
      }
    );
  });
});

app.post('/kategoriTanimlari/kategoriDuzenle', (req, res) => {
  const {
    e_id,             
    e_kategori_adi, 
    e_durum
  } = req.body;

  if (!e_id) {
    return res.status(400).json({ Hata: 'e_id bulunamıyor.' });
  }

  fs.readFile(KATEGORI_SORGU, 'utf-8', (err, data) => {
    if (err) {
      return res.status(500).json({ Hata: 'Veriler okunamıyor.' });
    }

    let veriListesi;
    try {
      veriListesi = JSON.parse(data);   // ✅ tek parse
    } catch (parseErr) {
      return res.status(500).json({ Hata: 'Veri formatı hatalı.' });
    }

    let kayitBulundu = false;

    const duzenlenmisListe = veriListesi.map(kayit => {
      if (String(kayit.e_id) === String(e_id)) {   // ✅ doğru karşılaştırma
        kayit.e_kategori_adi  = e_kategori_adi  ?? kayit.e_kategori_adi;
        kayit.e_durum         = e_durum         ?? kayit.e_durum;
        kayitBulundu = true;
      }
      return kayit;
    });

    if (!kayitBulundu) {
      return res.status(404).json({ Hata: 'Düzenlemeye çalıştığınız kayıt bulunamadı.' });
    }

    fs.writeFile(
      KATEGORI_SORGU,
      JSON.stringify(duzenlenmisListe, null, 2),
      err => {
        if (err) {
          return res.status(500).json({ Hata: 'İşlem kaydedilirken bir sorun oluştu: Düzenleme başarısız.' });
        }
        res.json({ Mesaj: 'İşlem Başarılı.' });
      }
    );
  });
});
//! SİLME
app.post('/oyunListesi/oyunSil', (req, res) => {
  const { e_id } = req.body;

  if (!e_id) {
    return res.status(400).json({ hata: 'e_id zorunlu veya eksik.' });
  }

  fs.readFile(OYUN_SORGU, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ hata: 'Veriler okunamıyor.' });

    let urunListesi;
    try {
      urunListesi = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ hata: 'Veri formatı hatalı.' });
    }

    // Silinecek oyunu bul
    const oyun = urunListesi.find(kayit => String(kayit.e_id) === String(e_id));
    if (!oyun) return res.status(404).json({ hata: 'Silinecek kayıt bulunamadı.' });

    // JSON’dan sil
    const yeniListe = urunListesi.filter(kayit => String(kayit.e_id) !== String(e_id));
    fs.writeFile(OYUN_SORGU, JSON.stringify(yeniListe, null, 2), err => {
      if (err) return res.status(500).json({ hata: 'Silme işlemi sırasında hata oluştu.' });

      // Kullanılmayan görselleri temizle
      const uploadsDir = path.join(__dirname, '..', 'database/Uploads'); 

      // JSON’da halen kullanılan görselleri topla
      const usedImages = new Set();
      yeniListe.forEach(o => {
        if (o.e_oyun_gorseli) {
          o.e_oyun_gorseli.forEach(imgPath => usedImages.add(path.basename(imgPath)));
        }
      });

      fs.readdir(uploadsDir, (err, files) => {
        if (err) console.log("Klasör okunamadı:", err);
        else {
          files.forEach(file => {
            if (!usedImages.has(file)) {
              const filePath = path.join(uploadsDir, file);
              fs.unlink(filePath, err => {
                if (err) console.log("Dosya silinemedi:", filePath, err);
                else console.log("Dosya silindi:", filePath);
              });
            }
          });
        }
      });

      res.json({ mesaj: 'Ürün ve kullanılmayan görseller başarıyla silindi.' });
    });
  });
});
app.post('/kategoriTanimlari/kategoriSil', (req, res) => {
  const { e_id } = req.body;

  if (!e_id) {
    return res.status(400).json({ hata: 'e_id zorunlu veya eksik.' });
  }

  fs.readFile(KATEGORI_SORGU, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ hata: 'Veriler okunamıyor.' });

    let urunListesi;
    try {
      urunListesi = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ hata: 'Veri formatı hatalı.' });
    }

    // Silinecek oyunu bul
    const oyun = urunListesi.find(kayit => String(kayit.e_id) === String(e_id));
    if (!oyun) return res.status(404).json({ hata: 'Silinecek kayıt bulunamadı.' });

    // JSON’dan sil
    const yeniListe = urunListesi.filter(kayit => String(kayit.e_id) !== String(e_id));
    fs.writeFile(KATEGORI_SORGU, JSON.stringify(yeniListe, null, 2), err => {
      if (err) return res.status(500).json({ hata: 'Silme işlemi sırasında hata oluştu.' });

      res.json({ mesaj: 'Ürün ve kullanılmayan görseller başarıyla silindi.' });
    });
  });
});



// TODO resim yükleme servisi düzenlenecek!
// Çoklu resim yükleme (max 10 dosya)
app.post('/diger/resimYukle', upload.array('e_oyun_gorseli', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Hiçbir dosya yüklenemedi.' });
  }

  // Yüklenen tüm dosyaların yollarını dizide topla
  const filePaths = req.files.map(file => '/data/DATA/uploads/' + file.filename);

  res.status(200).json({
    message: 'Dosyalar başarıyla yüklendi.',
    filePaths // frontend'e gönderiyoruz
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
