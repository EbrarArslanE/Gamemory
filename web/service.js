console.clear()
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 2223;

// Body parser gerekmedikçe yok
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'app')));

app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'app/pages/anasayfa/anasayfa.html'));});

// app.use('/oyunTanimlari', express.static(path.join(__dirname, 'app/pages/tanimlar/oyunTanimlari')));

const OYUN_SORGU = path.join(__dirname, '../database/DataList/oyunListesi.json');


// fs.readFile(OYUN_SORGU, 'utf8', (err, data) => {
//   if(err) return console.error('Dosya okunamadı:', err);
//   console.log('Dosya başarıyla okundu:', data);
// });


// ID dosya yolu

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

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
