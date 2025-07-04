const fields = ['#name', '#username', '#password', "#password_confirm", '#gender', '#birth_date', '#phone'];

function toggleFields(enabled) {
  fields.forEach(selector => {
    const $el = $(selector);
    if (enabled) {
      $el.removeClass('form-control-plaintext')
        .addClass('form-control')
        .prop('disabled', false);
    } else {
      $el.removeClass('form-control')
        .addClass('form-control-plaintext')
        .prop('disabled', true);
      if (selector === '#password') $el.val('');
      if (selector === '#password_confirm') $el.val('');
    }
  });

  $('#usernameRow').toggleClass('d-none', !enabled);
  $('#passwordRow').toggleClass('d-none', !enabled);
  $('#passwordConfirmRow').toggleClass('d-none', !enabled);
  $('#submitGroup').toggleClass('d-none', !enabled);
}

$(document).ready(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get('error') === '1') {
    // Ganti #target-element dengan ID atau class tombol/elemen yang ingin di-trigger
    setTimeout(() => {
      $('#editBtn').trigger('click');
    },50)
  }
});

$('#editBtn').on('click', function () {
  toggleFields(true);
  $(this).addClass("d-none");
  $("#name").focus();
});

$('#cancelBtn').on('click', function () {
  toggleFields(false);
  $("#editBtn").removeClass("d-none");
   // 1. Hapus semua class is-invalid
  document.querySelectorAll('.is-invalid').forEach(el => {
    el.classList.remove('is-invalid');
  });

  // 2. Hapus semua invalid-feedback
  document.querySelectorAll('.invalid-feedback').forEach(el => {
    el.remove();
  });

});

$('#showPasswordBtn').on('click', function (e) {
  e.preventDefault();

  const $password = $('#password');
  const $confirm = $('#password_confirm');
  const $icon = $(this).find('i');
  const isVisible = $password.attr('type') === 'text';

  // Toggle input type
  $password.attr('type', isVisible ? 'password' : 'text');
  $confirm.attr('type', isVisible ? 'password' : 'text');

  // Toggle icon & text
  if (isVisible) {
    $icon.removeClass('bi-eye-slash').addClass('bi-eye');
    $(this).html('<i class="bi bi-eye me-2"></i>Tampilkan Kata Sandi');
  } else {
    $icon.removeClass('bi-eye').addClass('bi-eye-slash');
    $(this).html('<i class="bi bi-eye-slash me-2"></i>Sembunyikan Kata Sandi');
  }
});

flatpickr(".datepicker", {
  dateFormat: "Y-m-d",
  maxDate: "today"
});