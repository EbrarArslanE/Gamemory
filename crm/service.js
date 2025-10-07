const express = require('express');
const path = require('path');

const app = express();
const PORT = 2222;

// Body parser gerekmedikçe yok
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Tüm app klasörünü statik olarak sunuyoruz
app.use(express.static(path.join(__dirname, 'app')));

// Anasayfa yönlendirmesi
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/pages/anasayfa/anasayfa.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
});
