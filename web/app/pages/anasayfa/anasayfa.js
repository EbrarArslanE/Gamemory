document.querySelector(".jsFilter").addEventListener("click", function () {
  document.querySelector(".filter-menu").classList.toggle("active");
});

document.querySelector(".grid").addEventListener("click", function () {
  document.querySelector(".list").classList.remove("active");
  document.querySelector(".grid").classList.add("active");
  document.querySelector(".products-area-wrapper").classList.add("gridView");
  document
    .querySelector(".products-area-wrapper")
    .classList.remove("tableView");
});

document.querySelector(".list").addEventListener("click", function () {
  document.querySelector(".list").classList.add("active");
  document.querySelector(".grid").classList.remove("active");
  document.querySelector(".products-area-wrapper").classList.remove("gridView");
  document.querySelector(".products-area-wrapper").classList.add("tableView");
});

var modeSwitch = document.querySelector('.mode-switch');
modeSwitch.addEventListener('click', function () {                      
    document.documentElement.classList.toggle('light');
    modeSwitch.classList.toggle('active');
});

// -------------------------- Oyun Listeleme --------------------------
document.addEventListener('DOMContentLoaded', oyunListele);

async function oyunListele() {
  try {
    const res = await fetch('/oyunListesi/oyunListele');
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const data = await res.json();
    const liste = document.getElementById('oyun-listesi'); // tbody id ayrı olmalı
    liste.innerHTML = '';

data.forEach(oyun => {
  const row = document.createElement('div');
  row.classList.add('products-row');
  row.innerHTML = `
    <div class="product-cell image">
      <img src="${oyun.e_oyun_gorseli && oyun.e_oyun_gorseli.length > 0 ? oyun.e_oyun_gorseli[0] : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}" alt="product">
      <span>${oyun.e_oyun_adi}</span>
    </div>
    <div class="product-cell category"><span class="cell-label">Kategori:</span>${oyun.e_oyun_kategorisi}</div>
    <div class="product-cell status-cell">
      <span class="cell-label">Durum:</span>
      <span class="status ${oyun.e_durum === 'Pasif' ? 'disabled' : 'active'}">${oyun.e_durum || 'Aktif'}</span>
    </div>
    <div class="product-cell sales"><span class="cell-label">Oyun yüklenme tarihi:</span>${oyun.e_eklenme_tarihi}</div>
    <div class="product-cell stock"><span class="cell-label">Oyun Boyutu:</span>${oyun.e_boyut || '-'}</div>
    <div class="product-cell price"><span class="cell-label">Açıklama:</span>${oyun.e_aciklama}</div>
    <div class="product-cell price">
      <div class="w-100 d-flex items-center justify-center">
        <button class="button" type="button">
          <span class="button__text">İndir</span>
          <span class="button__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" id="bdd05811-e15d-428c-bb53-8661459f9307" data-name="Layer 2" class="svg">
              <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path>
              <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path>
              <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  `;
  liste.appendChild(row);
});


  } catch (err) {
    console.error("Fetch Hatası:", err);
    alert("Oyun listesi yüklenirken bir hata oluştu.");
  }
}
