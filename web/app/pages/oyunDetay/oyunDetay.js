$(document).ready(() => {

  const urlParams = new URLSearchParams(window.location.search);
  const oyunId = urlParams.get('id');

  async function oyunDetayGetir() {
    try {
      const res = await fetch('/oyunListesi/oyunListele');
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);

      const data = await res.json();
      console.log("Fetch ile gelen data:", data);

      let oyun;
      if (Array.isArray(data)) {
        oyun = data.find(o => o.e_id == oyunId);
      } else {
        oyun = data.e_id == oyunId ? data : null;
      }

      if (!oyun) {
        console.log("Oyun bulunamadı 😕");
        return;
      }

      console.log("Bulunan oyun:", oyun);

      // Oyun detaylarını doldur
      const adElem = document.getElementById("oyun-adi");
      const kategoriElem = document.getElementById("oyun-kategori");
      const boyutElem = document.getElementById("oyun-boyutu");
      const durumElem = document.getElementById("oyun-durum");
      const tarihElem = document.getElementById("oyun-yuklenme-tarihi");
      const aciklamaElem = document.getElementById("oyun-aciklama");
      const indirLink = document.getElementById("indir-link");

      if(adElem) adElem.textContent = oyun.e_oyun_adi;
      if(kategoriElem) kategoriElem.textContent = oyun.e_oyun_kategorisi;
      if(boyutElem) boyutElem.textContent = oyun.e_boyut;
      if(durumElem) durumElem.textContent = oyun.e_durum;
      if(tarihElem) tarihElem.textContent = oyun.e_eklenme_tarihi;
      if(aciklamaElem) aciklamaElem.textContent = oyun.e_aciklama;
      if(indirLink) indirLink.href = oyun.e_oyun_indirme_linki;

      // Slider görsellerini ekle
      const $group = $('.slider .slide_group');
      $group.empty();
      $('.slide_buttons').empty();

      if (oyun.e_oyun_gorseli && oyun.e_oyun_gorseli.length > 0) {
        const baseUrl = window.location.origin; // resimlerin tam yolu için
        oyun.e_oyun_gorseli.forEach(src => {
          const fullSrc = src.startsWith('http') ? src : baseUrl + src;
          const $slide = $('<div class="slide"><img src="' + fullSrc + '" alt="Oyun Görseli" style="width: 100%; height: auto; object-fit: cover;"></div>');
          $group.append($slide);
        });
      }

      // Slider’ı başlat
      sliderBaslat();

    } catch (err) {
      console.error("Fetch Hatası:", err);
      alert("Oyun detayları yüklenirken bir hata oluştu.");
    }
  }

  function sliderBaslat() {
    $('.slider').each(function() {
      const $this = $(this);
      const $group = $this.find('.slide_group');
      const $slides = $this.find('.slide'); // artık tüm resimler alınır
      if ($slides.length === 0) return;

      const bulletArray = [];
      let currentIndex = 0;
      let timeout;

      function move(newIndex) {
        let animateLeft, slideLeft;
        advance();
        if ($group.is(':animated') || currentIndex === newIndex) return;

        bulletArray[currentIndex].removeClass('active');
        bulletArray[newIndex].addClass('active');

        if (newIndex > currentIndex) { slideLeft = '100%'; animateLeft = '-100%'; }
        else { slideLeft = '-100%'; animateLeft = '100%'; }

        $slides.eq(newIndex).css({ display: 'block', left: slideLeft });
        $group.animate({ left: animateLeft }, function() {
          $slides.eq(currentIndex).css({ display: 'none' });
          $slides.eq(newIndex).css({ left: 0 });
          $group.css({ left: 0 });
          currentIndex = newIndex;
        });
      }

      function advance() {
        clearTimeout(timeout);
        timeout = setTimeout(function() {
          move(currentIndex < ($slides.length - 1) ? currentIndex + 1 : 0);
        }, 4000);
      }

      $this.find('.next_btn').off('click').on('click', function() {
        move(currentIndex < ($slides.length - 1) ? currentIndex + 1 : 0);
      });

      $this.find('.previous_btn').off('click').on('click', function() {
        move(currentIndex !== 0 ? currentIndex - 1 : $slides.length - 1);
      });

      $.each($slides, function(index) {
        const $button = $('<a class="slide_btn">&bull;</a>');
        if (index === currentIndex) $button.addClass('active');
        $button.on('click', function() { move(index); }).appendTo($this.find('.slide_buttons'));
        bulletArray.push($button);
      });

      advance();
    });
  }

  oyunDetayGetir();

});
