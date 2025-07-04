$('#role').on('change', function () {
  const role = $(this).val();

  // Uncheck semua checkbox dulu
  $('.perm-checkbox').prop('checked', false);

  if (!role) return;

  // Ambil data permission_role dari API
  $.get(`/api/pengaturan/permissions-role/${role}`, function (permissions) {
    permissions.forEach(function (perm) {
      const selector = `.perm-checkbox[data-slug="${perm.slug}"][data-permission="${perm.permission}"]`;
      $(selector).prop('checked', true);
    });
  }).fail(function () {
    console.log('Gagal mengambil data permission.');
  });
});
