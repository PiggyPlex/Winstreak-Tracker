"use strict";

$("a[href=\"".concat(window.location.pathname, "\"]")).parent().addClass('active');
$("a[href=\"".concat(window.location.pathname, "/\"]")).parent().addClass('active');
$(document).on('click', '.mobile-menu-btn', function (e) {
  var $el = $(e.currentTarget);
  $el.fadeOut(500);
  $('.sidebar').addClass('show');
});
$(document).on('click', '.mobile-close-btn', function (e) {
  $('.mobile-menu-btn').fadeIn(500);
  $('.sidebar').removeClass('show');
});