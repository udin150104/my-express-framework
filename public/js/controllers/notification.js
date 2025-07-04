$(document).on("click", "#btn-look-detail", function () {
  let _this = $(this);
  $(this).prop('disabled', true);
  $("#detail-tamp").html("");
  let init = $(this).data('init');
  $.get(`/api/notifications/${init}`, function (data) {
    let html = generateHtml(data.notification);
    $("#detail-tamp").html(html);
    if(data.minus || data.minus === 'true'){
      let count = $("#count-notif").text()
      count = parseInt(count)-1;
      $("#count-notif").html(count)
        // Cari elemen card terdekat
      let $card = _this.closest(".card");

      // Ganti class border dari 'border-danger-subtle' ke 'border-dark-subtle'
      $card
        .removeClass("border-danger-subtle")
        .addClass("border-dark-subtle");
    }

    // Hilangkan placeholder setelah 1.5 detik
    setTimeout(() => {
      $("#detail-tamp .placeholder, #detail-tamp .placeholder-glow").removeClass("placeholder placeholder-glow");
      _this.prop('disabled', false);
    }, 1500); // 1500 ms = 1.5 detik
  });
});

function generateHtml(data) {
  let date = new Date(data.created_at).toLocaleString('id-ID');
  console.log(data);
  let htmllink = ``;
  if(data.type === 'visit'){
    htmllink +=`<a href="${data.link}" class="float-end placeholder mx-3 small text-secondary"><i class="bi bi-box-arrow-up-right"></i></a>`
  }
  let html = `
    <div class="card my-2 rounded-0">
      <div class="card-header">
        <small class="placeholder text-secondary">Kepada ${data.user.name} @${data.user.username}</small>
          <div class="small placeholder text-secondary float-end">${date}</div>
          ${htmllink}
      </div>
      <div class="card-body placeholder-glow ">
          <h5 class="card-title placeholder">${data.title}</h5>
          <hr>
          <p class="placeholder">${data.message}</p>
      </div>
    </div>
  `;

  return html;
}