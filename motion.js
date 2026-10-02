// Плавное появление блоков и фоновые видео (грузятся, только когда до них долистали)
(function () {
  // Видео YouTube: сначала обложка, плеер — по нажатию
  document.querySelectorAll('.yt button, .yt-lazy button').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.parentNode.getAttribute('data-id');
      if (location.protocol === 'file:') { window.open('https://www.youtube.com/watch?v=' + id, '_blank'); return; }
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1';
      f.title = b.getAttribute('aria-label');
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      b.replaceWith(f);
    });
  });

  // Смена фото в блоках .slides
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.slides').forEach(function (box) {
      var items = box.querySelectorAll('figure'), i = 0;
      if (items.length < 2) return;
      setInterval(function () {
        items[i].classList.remove('on');
        i = (i + 1) % items.length;
        items[i].classList.add('on');
      }, 4200);
    });
  }

  var reveals = document.querySelectorAll('.reveal');
  var videos = document.querySelectorAll('video[data-src]');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  reveals.forEach(function (el) { io.observe(el); });

  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saver = navigator.connection && navigator.connection.saveData;
  if (still || saver) return; // остаётся фото-заставка
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (!v.src) v.src = v.getAttribute('data-src');
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else if (v.src) { v.pause(); }
    });
  }, { rootMargin: '200px 0px' });
  videos.forEach(function (v) { vio.observe(v); });
})();
