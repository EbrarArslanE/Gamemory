console.clear()
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 2222;

// Body parser gerekmedikçe yok
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'app')));

app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'app/pages/anasayfa/anasayfa.html'));});

app.use('/oyunTanimlari', express.static(path.join(__dirname, 'app/pages/tanimlar/oyunTanimlari')));

const OYUN_SORGU = path.join(__dirname, '../database/DataList/oyunListesi.json');


// fs.readFile(OYUN_SORGU, 'utf8', (err, data) => {
//   if(err) return console.error('Dosya okunamadı:', err);
//   console.log('Dosya başarıyla okundu:', data);
// });


// ID dosya yolu
const OYUN_ID_OLUSTUR  = path.join(__dirname, '../database/ID_List/oyunID.txt');

//! ID ÜRET 
async function GET_OYUN_ID() {
  try {
    let data;
    try {
      data = await fs.readFile(OYUN_ID_OLUSTUR, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.writeFile(OYUN_ID_OLUSTUR, '1', 'utf8');
        return 1;
      }
      throw err;
    }

    let currentId = parseInt(data, 10);
    if (isNaN(currentId)) currentId = 0;

    const newId = currentId + 1;
    await fs.writeFile(OYUN_ID_OLUSTUR, newId.toString(), 'utf8');
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

// ! EKLEME
app.post('/oyunListesi/oyunEkle', async (req, res) => {
  try {
    const { e_oyun_adi, e_oyun_indirme_linki, e_durum, e_aciklama, e_oyun_kategorisi, e_eklenme_tarihi } = req.body;

    if (!e_oyun_adi || !e_durum) {
      return res.status(400).json({ hata: 'Eksik oyun adı veya durum bilgisi' });
    }

    const yeniID = await GET_OYUN_ID();

    const yeniOyunTanimi = {
      e_id: String(yeniID),
      e_oyun_adi,
      e_oyun_indirme_linki,
      e_durum,
      e_aciklama,
      e_oyun_kategorisi,
      e_eklenme_tarihi
    };

    let oyunListesi = [];
    try {
      const fileData = await fs.readFile(OYUN_SORGU, 'utf8');
      oyunListesi = fileData ? JSON.parse(fileData) : [];
    } catch (e) {
      console.warn('Oyun listesi okunamadı, yeni liste oluşturuluyor.', e);
    }

    oyunListesi.push(yeniOyunTanimi);
    await fs.writeFile(OYUN_SORGU, JSON.stringify(oyunListesi, null, 2), 'utf8');

    res.json({ mesaj: 'Oyun başarıyla oluşturuldu!', e_id: yeniID });

  } catch (err) {
    console.error('Oyun ekleme hatası:', err);
    res.status(500).json({ hata: 'Oyun kaydedilemedi' });
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
    e_eklenme_tarihi
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

//! SİLME
app.post('/oyunListesi/oyunSil', (req, res) => {
  const { e_id } = req.body;

  if (!e_id) {
    return res.status(400).json({ hata: 'e_id zorunlu veya eksik.' });
  }

  fs.readFile(OYUN_SORGU, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ hata: 'Veriler okunamıyor.' });
    }

    let urunListesi;
    try {
      urunListesi = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ hata: 'Veri formatı hatalı.' });
    }

    // e_id'ye uymayanları filtrele, yani seçilen ürünü çıkar
    const yeniListe = urunListesi.filter(kayit => String(kayit.e_id) !== String(e_id));

    if (yeniListe.length === urunListesi.length) {
      return res.status(404).json({ hata: 'Silinecek kayıt bulunamadı.' });
    }

    fs.writeFile(OYUN_SORGU, JSON.stringify(yeniListe, null, 2), err => {
      if (err) {
        return res.status(500).json({ hata: 'Silme işlemi sırasında hata oluştu.' });
      }

      res.json({ mesaj: 'Ürün başarıyla silindi.' });
    });
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
