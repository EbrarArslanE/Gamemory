fetch('/assets/scripts/sidebar.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('sidebar').innerHTML = html;
  })
  .catch(err => console.error('Sidebar yükleme hatası:', err));

  
  console.log("anasayfa.js yüklendi");