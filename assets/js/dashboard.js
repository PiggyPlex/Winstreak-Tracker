$(`a[href="${window.location.pathname}"]`).parent().addClass('active');
$(`a[href="${window.location.pathname}/"]`).parent().addClass('active');

$(document).on('click', '.mobile-menu-btn', (e) => {
  const $el = $(e.currentTarget);
  $el.fadeOut(500);
  $('.sidebar').addClass('show');
});

$(document).on('click', '.mobile-close-btn', (e) => {
  $('.mobile-menu-btn').fadeIn(500);
  $('.sidebar').removeClass('show');
});