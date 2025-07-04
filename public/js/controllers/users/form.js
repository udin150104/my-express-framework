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