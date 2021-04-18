const gamesCallback = () => {
  $.get('/api/games', ({ games }) => {
    $('.game').each(function() {
      $(this).text(games[$(this).text()]);
    });
  });
}

(() => {
  try {
    const tokens = JSON.parse(localStorage.getItem('@winstreak:tokens'));
    const data = tokens.map(token => {
      if (typeof token !== 'string') return;
      const parts = token.split('.');
      if (!parts[1]) return;
      try {
        return { token, payload: JSON.parse(atob(parts[1])) };
      } catch (err) {
        console.trace(err);
        return;
      }
    }).filter(a => a);
    if (data.length < 1) return window.location.href = '/start';
    data.forEach(({ payload, token }) => {
      const card = $('<a class="card"></a>');
      card.attr('href', `/winstreaks/${token}`);
      console.log('Fetched', payload);
      card.append($('<p></p>').text(payload.username));
      card.append($('<i class="game"></i>').text(payload.game));
      $('.players-grid').append(card);
    });
    gamesCallback();
  } catch (err) {
    console.trace(err);
    window.location.href = '/clear';
  }
})();