$('.slider').each(function() {
  var $this = $(this);
  var $group = $this.find('.slide_group');
  var $slides = $this.find('.slide');
  var bulletArray = [];
  var currentIndex = 0;
  var timeout;
  
  function move(newIndex) {
    var animateLeft, slideLeft;
    
    advance();
    
    if ($group.is(':animated') || currentIndex === newIndex) {
      return;
    }
    
    bulletArray[currentIndex].removeClass('active');
    bulletArray[newIndex].addClass('active');
    
    if (newIndex > currentIndex) {
      slideLeft = '100%';
      animateLeft = '-100%';
    } else {
      slideLeft = '-100%';
      animateLeft = '100%';
    }
    
    $slides.eq(newIndex).css({
      display: 'block',
      left: slideLeft
    });
    $group.animate({
      left: animateLeft
    }, function() {
      $slides.eq(currentIndex).css({
        display: 'none'
      });
      $slides.eq(newIndex).css({
        left: 0
      });
      $group.css({
        left: 0
      });
      currentIndex = newIndex;
    });
  }
  
  function advance() {
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      if (currentIndex < ($slides.length - 1)) {
        move(currentIndex + 1);
      } else {
        move(0);
      }
    }, 4000);
  }
  
  $('.next_btn').on('click', function() {
    if (currentIndex < ($slides.length - 1)) {
      move(currentIndex + 1);
    } else {
      move(0);
    }
  });
  
  $('.previous_btn').on('click', function() {
    if (currentIndex !== 0) {
      move(currentIndex - 1);
    } else {
      move(3);
    }
  });
  
  $.each($slides, function(index) {
    var $button = $('<a class="slide_btn">&bull;</a>');
    
    if (index === currentIndex) {
      $button.addClass('active');
    }
    $button.on('click', function() {
      move(index);
    }).appendTo('.slide_buttons');
    bulletArray.push($button);
  });
  
  advance();
});


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
    document.getElementById("oyun-adi").textContent = oyun.e_oyun_adi;
    document.getElementById("oyun-kategori").textContent = oyun.e_oyun_kategorisi;
    document.getElementById("oyun-boyutu").textContent = oyun.e_boyut;
    document.getElementById("oyun-durum").textContent = oyun.e_durum;
    document.getElementById("oyun-yuklenme-tarihi").textContent = oyun.e_eklenme_tarihi;
    document.getElementById("oyun-aciklama").textContent = oyun.e_aciklama;
    document.getElementById("indir-link").href = oyun.e_oyun_indirme_linki;

    // Slider görsellerini ekle
    const $group = $('.slider .slide_group');
    $group.empty();
    $('.slide_buttons').empty();

    if (oyun.e_oyun_gorseli && oyun.e_oyun_gorseli.length > 0) {
      oyun.e_oyun_gorseli.forEach(src => {
        const $slide = $('<div class="slide"><img src="' + src + '" alt="Oyun Görseli"></div>');
        $group.append($slide);
      });
    }

    // Slider kodunu başlat
    $('.slider').each(function() {
      const $this = $(this);
      const $group = $this.find('.slide_group');
      const $slides = $this.find('.slide');
      if ($slides.length === 0) return; // boşsa hata verme
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

  } catch (err) {
    console.error("Fetch Hatası:", err);
    alert("Oyun detayları yüklenirken bir hata oluştu.");
  }
}

oyunDetayGetir();
