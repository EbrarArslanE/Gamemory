// -------------------------- Sidebar Yükleme --------------------------
async function loadSidebar() {
  try {
    const response = await fetch('/assets/scripts/sidebar.html');
    if (!response.ok) throw new Error(response.status + ' ' + response.statusText);
    document.getElementById('sidebar').innerHTML = await response.text();
  } catch (err) {
    console.error('Sidebar yükleme hatası:', err);
  }
}
loadSidebar();

console.log("anasayfa.js yüklendi");

// -------------------------- Modal Yönetimi --------------------------
const modal = document.getElementById('oyunModal');
const btnOpen = document.querySelectorAll('.btn-add');
const btnClose = modal.querySelectorAll('.close');

btnOpen.forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    openModal();
  });
});

btnClose.forEach(btn => btn.addEventListener('click', closeModal));

window.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

function openModal() {
  modal.classList.add('show');
  modal.style.display = 'flex';
}

function closeModal() {
  modal.classList.remove('show');
  modal.style.display = 'none';
}

function formTemizle() {
  document.getElementById('oyunForm').reset();
}

function modalBaslikYaz(text) {
  const baslik = modal.querySelector('.modal-header h2');
  if (baslik) baslik.textContent = text;
}

// -------------------------- İşlem Tipi --------------------------
let islemTipi = 'ekle';
let seciliID = null;

function modalEkle() {
  islemTipi = 'ekle';
  seciliID = null;
  modalBaslikYaz("Yeni Oyun Tanımı Ekle");
  formTemizle();
  openModal();
}

async function modalDuzenle(e_id) {
  islemTipi = 'duzenle';
  seciliID = e_id;
  modalBaslikYaz("Oyun Tanımı Düzenle");

  try {
    const res = await fetch('/oyunListesi/oyunListele');
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const data = await res.json();
    const kayit = data.find(item => String(item.e_id) === String(e_id));
    if (!kayit) return alert("Kayıt bulunamadı.");

    document.getElementById('e_oyun_adi').value = kayit.e_oyun_adi;
    document.getElementById('e_oyun_indirme_linki').value = kayit.e_oyun_indirme_linki;
    document.getElementById('e_eklenme_tarihi').value = kayit.e_eklenme_tarihi;
    document.getElementById('e_aciklama').value = kayit.e_aciklama;
    document.getElementById('e_oyun_kategorisi').value = kayit.e_oyun_kategorisi;
    document.getElementById('e_durum').value = kayit.e_durum;

    openModal();
  } catch (err) {
    console.error("Fetch Hatası:", err);
    toastr.error("Kayıt verisi alınamadı.", "Hata!");
  }

}

// -------------------------- Oyun Listeleme --------------------------
document.addEventListener('DOMContentLoaded', oyunListele);

async function oyunListele() {
  try {
    const res = await fetch('/oyunListesi/oyunListele');
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const data = await res.json();

    const tbody = document.getElementById('oyun-listesi'); // tbody id ayrı olmalı
    tbody.innerHTML = '';

    data.forEach(oyun => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${oyun.e_id}</td>
        <td>${oyun.e_oyun_adi}</td>
        <td>${oyun.e_eklenme_tarihi}</td>
        <td>${oyun.e_aciklama}</td>
        <td><span class="w-100 status ${oyun.e_durum === 'Aktif' ? 'success' : oyun.e_durum === 'Pasif' ? 'warning' : 'danger'}">${oyun.e_durum}</span></td>
        <td class="d-flex gap-2 justify-center">
          <a href="#" class="btn btn-edit w-50" onclick="modalDuzenle('${oyun.e_id}')"><i class="bx bx-edit"></i> Düzenle</a>
          <a href="#" class="btn btn-delete w-50" onclick="oyunSil('${oyun.e_id}')"><i class="bx bx-trash"></i> Sil</a>
        </td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Fetch Hatası:", err);
    alert("Oyun listesi yüklenirken bir hata oluştu.");
  }
}

// -------------------------- Kaydetme --------------------------
async function islemiKaydet() {
  const e_durum_value = document.getElementById('e_durum').value;
  if (!e_durum_value) return toastr.warning("Lütfen oyun durumunu seçiniz.", "Uyarı!");

  const oyunKaydet = {
    e_oyun_adi: document.getElementById('e_oyun_adi').value.trim(),
    e_oyun_indirme_linki: document.getElementById('e_oyun_indirme_linki').value.trim(),
    e_eklenme_tarihi: document.getElementById('e_eklenme_tarihi').value.trim(),
    e_aciklama: document.getElementById('e_aciklama').value.trim(),
    e_oyun_kategorisi: document.getElementById('e_oyun_kategorisi').value.trim(),
    e_durum: e_durum_value
  };

  if (islemTipi === 'duzenle') oyunKaydet.e_id = seciliID;

  const url = islemTipi === 'ekle' ? '/oyunListesi/oyunEkle' : '/oyunListesi/oyunDuzenle';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(oyunKaydet)
    });

    const data = await res.json();

    if (data.hata || data.Hata) {
      toastr.error(data.hata || data.Hata, "Hata!");
      return;
    }

    toastr.success(
      islemTipi === 'ekle' ? "Oyun başarıyla eklendi!" : "Oyun başarıyla güncellendi!",
      "Başarılı!"
    );
    closeModal();
    oyunListele();

  } catch (err) {
    console.error("İşlem hatası:", err);
    toastr.error("Bir hata oluştu. Lütfen tekrar deneyin.", "Hata!");
  }
}

// -------------------------- Silme --------------------------
async function oyunSil(e_id) {
  const onay = await Swal.fire({
    title: 'Emin misin?',
    text: 'Bu oyunu kalıcı olarak silmek üzeresin!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1C1C2E', // senin navy blue
    cancelButtonColor: '#b9433f',  // senin arctic lime
    confirmButtonText: 'Evet, sil!',
    cancelButtonText: 'Vazgeç'
  });

  if (!onay.isConfirmed) return;

  try {
    const res = await fetch('/oyunListesi/oyunSil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ e_id })
    });
    const data = await res.json();

    if (data.hata) {
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: data.hata,
        confirmButtonColor: '#58A6FF'
      });
      return;
    }

    await Swal.fire({
      icon: 'success',
      title: 'Silindi!',
      text: data.mesaj || 'Oyun başarıyla silindi.',
      confirmButtonColor: '#58A6FF'
    });

    oyunListele();

  } catch (err) {
    console.error('Silme hatası:', err);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Silme işleminde bir hata oluştu.',
      confirmButtonColor: '#1C1C2E'
    });
  }
}