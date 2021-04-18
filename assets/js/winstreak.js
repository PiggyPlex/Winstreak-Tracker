(() => {
  try {
    const parts = token.split('.');
    if (!parts[1]) return window.location.href = '/clear';
    const payload = JSON.parse(atob(parts[1]));
    $('.username').text(payload.username);
    $.get('/api/games', ({ games }) => {
      $('.game').text(games[payload.game]);
    });
    $.get(`https://apiv2.nethergames.org/players/${payload.username}/stats`)
    .done(({ wins, bio, kills, deaths, lastJoin, firstJoin, level, lastServer, rankColors, ranks, xp, statusCredits, tier, voted, extra }) => {
      let gameWins, gameLosses;
      if (payload.game === 'bwSolo') {
        gameWins = extra.bwSoloWins;
        gameLosses = extra.bwSoloDeaths;
      } else {
        gameWins = extra[`${payload.game}Wins`];
        gameLosses = extra[`${payload.game}Losses`];
      }
      gameWins = gameWins && typeof gameWins === 'number' ? gameWins : 0;
      gameLosses = gameLosses && typeof gameLosses === 'number' ? gameLosses : 0;
      console.log(gameLosses, payload.losses)
      if (gameLosses - payload.losses > 0) {
        // User has lost their winstreak!
        confirm('This player has lost their winstreak!');
        window.location.href = '/winstreaks';
        return;
      };
      $('.winstreak').text(`${gameWins - payload.wins} wins`);
      $('.game-wins').text(`${gameWins} wins`);
      $('.game-losses').text(`${gameLosses} losses`);
      $('.wins').text(`${wins} wins`);
      $('.kdr').text(`${Math.round(kills/deaths * 10) / 10} KDR (${kills}:${deaths})`);
    })
    .fail((err) => {
      alert('Something went wrong whilst querying the NetherGames API.')
      console.trace(err);
    });
  } catch (err) {
    console.trace(err);
  }
})();

const copyWinstreakLink = () => {
  $('.winstreak-link').select();
  document.execCommand('copy');
}

$(document).on('click', '.verify-btn', (e) => {
  const $el = $(e.currentTarget);
  $.get(`/api/winstreaks/${token}`)
  .done((res) => {
    alert('Your winstreak has been verified.\nNote there is a 5 minute cooldown between verifying winstreaks.\n\nMake sure you\'re in our Discord server to see your winstreak.')
  })
  .fail((err) => {
    console.error(err);
    alert('Your winstreak could not be verified.\nThis could be because you must wait 5 minutes between verify attempts.\n\nPlease let us know in our Discord server.');
  });
  $el.attr('disabled', true);
});