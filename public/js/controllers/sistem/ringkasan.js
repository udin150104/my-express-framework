function loadMonitor() {
  $.get('/monitor', function (data) {
    $('#uptime').text(data.uptime);
    // $('#requests').text(data.totalRequests);
    $('#memory').text(data.memory.rss + ' / ' + data.memory.heapUsed);
    const cpuLoad = data.cpuLoad.map(n => n.toFixed(2));
    const cpuText = `
      1 Menit: ${cpuLoad[0]}<br>
      5 Menit: ${cpuLoad[1]}<br>
      15 Menit: ${cpuLoad[2]}
    `;
    $('#cpu').html(cpuText);
  });
}

loadMonitor(); // initial
setInterval(loadMonitor, 5000); // every 5 seconds

const form = $('#clean-log-activity');
const modal = new bootstrap.Modal(document.getElementById('confirmResetLogModal'));

form.on('submit', function (e) {
  e.preventDefault(); // cegah submit langsung
  modal.show();       // tampilkan modal
});

$('#confirmResetLog').on('click', function () {
  modal.hide();       // sembunyikan modal
  form.off('submit'); // hapus preventDefault
  form.submit();      // submit form benar-benar
});