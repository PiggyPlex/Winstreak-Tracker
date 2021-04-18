"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

$('.old-content').hide();
var step = 1,
    username,
    games;

var random = function random(min, max) {
  return ~~(Math.random() * (Math.floor(max) - Math.ceil(min) + 1));
};

$.get('/api/games', function (res) {
  return games = res.games;
}).fail(function (err) {
  alert('Something went wrong: I could not fetch the games!');
  console.trace(err);
});

var nextStep = function nextStep() {
  var _updateContent = function _updateContent(title, content) {
    var time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;
    $('h2').html(title);
    $('.old-content').html($('.current-content').html());
    $('.current-content').hide();
    $('.old-content').show();
    $('.old-content').fadeOut(time);
    $('.current-content').html(content);
    setTimeout(function () {
      $('.current-content').fadeIn(time);
    }, time);
  };

  if (step == 1) {
    $('.next-btn').html("<span class=\"btn-emoji\">\uD83D\uDC4C</span> Continue");

    _updateContent('🤷‍♂️ Who are you?', '<blockquote>Psst: you can enter someone else\'s username to track their winstreak!</blockquote><input placeholder="What\'s your username?">');
  }

  if (step == 2) {
    if (!$('input').val().trim()) return alert('Oops, you must enter a username!');
    username = $('input').val();

    _updateContent("\uD83E\uDD13 ".concat(username, " it is"), "Which gamemode would you like to track?<br />");

    $('.current-content').append($('<select>').html(Object.entries(games).map(function (game) {
      var _option = $('<option>').attr('value', game[0]).text(game[1]);

      if (game[0] === 'bw') _option.attr('selected', 'selected');
      return _option;
    })));
  }

  if (step == 3) {
    $('.next-btn').attr('disabled', true);
    $.ajax({
      url: "/api/track/".concat(encodeURIComponent(username)),
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      data: {
        game: $('select').find(":selected").val() || 'bw'
      }
    }).done(function (_ref) {
      var token = _ref.token;
      var currentTokens = localStorage.getItem('@winstreak:tokens');
      var newTokens = [token];

      if (currentTokens) {
        try {
          newTokens = JSON.parse(currentTokens);
          newTokens.push(token);
        } catch (_unused) {
          newTokens = [token];
        }
      }

      localStorage.setItem('@winstreak:tokens', JSON.stringify(_toConsumableArray(new Set(newTokens))));
      window.location.href = '/winstreaks';
    }).fail(function (err) {
      alert("Something went wrong! This is most likely because you provided an invalid username.");
      console.trace("e.e", err);
    });
  }

  step++;
};

$(document).on('click', '.next-btn', function (e) {
  var $el = $(e.currentTarget);
  $el.blur();
  if ($el.attr('disabled')) return;
  nextStep();
});
$(document).on('mouseover', '.next-btn', function (e) {
  if (e.currentTarget !== e.target) return;
  if (step === 1) explode(e.pageX, e.pageY);
});
var bubbles = 25;

var explode = function explode(x, y) {
  if ($('canvas')[0]) return;
  var particles = [];
  var ratio = window.devicePixelRatio;
  var c = document.createElement('canvas');
  var ctx = c.getContext('2d');
  c.style.position = 'absolute';
  c.style.left = x - 100 + 'px';
  c.style.top = y - 100 + 'px';
  c.style.pointerEvents = 'none';
  c.style.width = 200 + 'px';
  c.style.height = 200 + 'px';
  c.style.zIndex = 100;
  c.width = 200 * ratio;
  c.height = 200 * ratio;
  document.body.appendChild(c);

  for (var i = 0; i < bubbles; i++) {
    particles.push({
      x: c.width / 2,
      y: c.height / 2,
      radius: r(54, 72),
      rotation: r(0, 360, true),
      speed: r(4, 8),
      friction: 0.95,
      opacity: r(0, 0.5, true),
      yVel: 0,
      gravity: 0.1
    });
  }

  render(particles, ctx, c.width, c.height);
  setTimeout(function () {
    return document.body.removeChild(c);
  }, 1000);
};

var render = function render(particles, ctx, width, height) {
  requestAnimationFrame(function () {
    return render(particles, ctx, width, height);
  });
  ctx.clearRect(0, 0, width, height);
  var dababy = new Image();
  dababy.src = '/assets/images/7534-dababy.png';
  particles.forEach(function (p, i) {
    p.x += p.speed * Math.cos(p.rotation * Math.PI / 180);
    p.y += p.speed * Math.sin(p.rotation * Math.PI / 180);
    p.opacity -= 0.01;
    p.speed *= p.friction;
    p.radius *= p.friction;
    p.yVel += p.gravity;
    p.y += p.yVel;
    if (p.opacity < 0 || p.radius < 0) return; // ctx.beginPath();
    // ctx.globalAlpha = p.opacity;
    // ctx.fillStyle = p.color;
    // ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, false);

    ctx.drawImage(dababy, p.x, p.y, p.radius, p.radius);
  });
  return ctx;
};

var r = function r(a, b, c) {
  return parseFloat((Math.random() * ((a ? a : 1) - (b ? b : 0)) + (b ? b : 0)).toFixed(c ? c : 0));
};