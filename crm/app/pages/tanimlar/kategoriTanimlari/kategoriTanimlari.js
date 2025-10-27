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
const modal = document.getElementById('kategoriModal');
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
  document.getElementById('kategoriForm').reset();
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
  modalBaslikYaz("Yeni Kategori Tanımı Ekle");
  formTemizle();
  openModal();
}

async function kategoriDuzenle(e_id) {
  islemTipi = 'duzenle';
  seciliID = e_id;
  modalBaslikYaz("Kategori Tanımı Düzenle");

  try {
    const res = await fetch('/kategoriTanimlari/kategoriListele');
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const data = await res.json();
    const kayit = data.find(item => String(item.e_id) === String(e_id));
    if (!kayit) return alert("Kayıt bulunamadı.");

    document.getElementById('e_kategori_adi').value = kayit.e_kategori_adi;
    document.getElementById('e_durum').value = kayit.e_durum;

    openModal();
  } catch (err) {
    console.error("Fetch Hatası:", err);
    toastr.error("Kayıt verisi alınamadı.", "Hata!");
  }

}

// -------------------------- Oyun Listeleme --------------------------
document.addEventListener('DOMContentLoaded', kategoriListele);

async function kategoriListele() {
  try {
    const res = await fetch('/kategoriTanimlari/kategoriListele');
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
    const data = await res.json();

    const tbody = document.getElementById('kategori-listesi');
    tbody.innerHTML = '';

    data.forEach(kategori => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${kategori.e_kategori_adi}</td>
        <td><span class="w-100 status ${kategori.e_durum === 'Aktif' ? 'success' : kategori.e_durum === 'Pasif' ? 'warning' : 'danger'}">${kategori.e_durum}</span></td>
        <td class="d-flex gap-2 justify-center">
          <a href="#" class="btn btn-edit w-50" onclick="kategoriDuzenle('${kategori.e_id}')"><i class="bx bx-edit"></i> Düzenle</a>
          <a href="#" class="btn btn-delete w-50" onclick="kategoriSil('${kategori.e_id}')"><i class="bx bx-trash"></i> Sil</a>
        </td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Fetch Hatası:", err);
    alert("Kategori listesi yüklenirken bir hata oluştu.");
  }
}

// -------------------------- Kaydetme --------------------------
async function islemiKaydet() {
  const e_durum_value = document.getElementById('e_durum').value;
  if (!e_durum_value) return toastr.warning("Lütfen Kategori durumunu seçiniz.", "Uyarı!");

  const kategoriKaydet = {
    e_kategori_adi: document.getElementById('e_kategori_adi').value.trim(),
    e_durum: e_durum_value
  };

  if (islemTipi === 'duzenle') kategoriKaydet.e_id = seciliID;

  const url = islemTipi === 'ekle' ? '/kategoriTanimlari/kategoriEkle' : '/kategoriTanimlari/kategoriDuzenle';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kategoriKaydet)
    });

    const data = await res.json();

    if (data.hata || data.Hata) {
      toastr.error(data.hata || data.Hata, "Hata!");
      return;
    }

    toastr.success(
      islemTipi === 'ekle' ? "Kategori başarıyla eklendi!" : "Kategori başarıyla güncellendi!",
      "Başarılı!"
    );
    closeModal();
    kategoriListele();

  } catch (err) {
    console.error("İşlem hatası:", err);
    toastr.error("Bir hata oluştu. Lütfen tekrar deneyin.", "Hata!");
  }
}

function islemTipiYazdir(params) {
  document.getElementById('islem-tipi').textContent = islemTipi === 'ekle' ? 'Yeni Kategori Ekle' : 'Kategori Düzenle';
}

// -------------------------- Silme --------------------------
async function kategoriSil(e_id) {
  const onay = await Swal.fire({
    title: 'Emin misin?',
    text: 'Bu kategoriyi kalıcı olarak silmek üzeresin!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1C1C2E',
    cancelButtonColor: '#b9433f',
    confirmButtonText: 'Evet, sil!',
    cancelButtonText: 'Vazgeç'
  });

  if (!onay.isConfirmed) return;

  try {
    const res = await fetch('/kategoriTanimlari/kategoriSil', {
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
      text: data.mesaj || 'Kategori başarıyla silindi.',
      confirmButtonColor: '#58A6FF'
    });

    kategoriListele();

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
