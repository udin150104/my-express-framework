const dtButtons = [];

const permEl = document.getElementById('permissions');
const canCreate = permEl?.dataset.canCreateUser === 'true';
const canEdit = permEl?.dataset.canEditUser === 'true';
const canDelete = permEl?.dataset.canDeleteUser === 'true';
const canSetAccess = permEl?.dataset.canSetPermissionUser === 'true';

if (canCreate) {
  dtButtons.push({
    text: 'Tambah Pengguna',
    className: 'btn btn-sm btn-dark rounded-0',
    action: function () {
      window.location.href = '/pengaturan/users/create';
    }
  });
}
const table = $('#userTable').DataTable({
  processing: true,
  serverSide: true,
  ajax: {
    url: '/api/pengaturan/users',
    type: 'GET'
  },
  dom: '<"row mb-2 align-items-center"' +
    '<"col-md-6 d-flex align-items-center gap-2"B>' +    // Buttons kiri
    '<"col-md-6 d-flex justify-content-end gap-2"lf>' +  // Length + Filter kanan
    '>' +
    'rt' +
    '<"row mt-2 align-items-center"' +
    '<"col-md-6"i> ' +
    '<"col-md-6 d-flex justify-content-end"p>' +
    '>',
  buttons: dtButtons,
  columns: [
    { data: 'name' },
    { data: 'username' },
    {
      data: 'role',
      render: function (data, type, row) {
        const roleMap = {
          superadmin: '<span class="badge bg-secondary">Super Administrator</span>',
          admin: '<span class="badge bg-secondary">Administrator</span>',
          operator: '<span class="badge bg-secondary">Operator</span>',
          approver: '<span class="badge bg-secondary">Approver</span>',
          viewer: '<span class="badge bg-secondary">Viewer</span>'
        };
        return roleMap[data] || data; // fallback ke original jika tidak ada di mapping
      }

    },
    {
      data: null, // tidak diambil dari kolom tabel, tapi custom
      orderable: false,
      searchable: false,
      className: 'text-center',
      render: function (data, type, row) {
        let html = ``;
        if(canSetAccess){
          html += `
          <a href="/pengaturan/users/${row.id}/permission" class="btn btn-sm btn-dark me-1 rounded-0">
            <i class="bi bi-universal-access-circle"></i> Atur Izin Akses
          </a>`
        }
        if(canEdit){
          html += `
          <a href="/pengaturan/users/${row.id}/edit" class="btn btn-sm btn-dark me-1 rounded-0">
            <i class="bi bi-pencil"></i> Ubah
          </a>`
        }
        if(canDelete){
          html += `          
          <button class="btn btn-sm btn-default text-danger rounded-0 btn-delete-user" data-id="${row.id}">
            <i class="bi bi-trash"></i> Hapus
          </button>
          `
        }
        return html;
      }
    }
  ],
  initComplete: function () {
    this.api().columns().every(function () {
      const column = this;
      $('input', column.footer()).on('keyup change clear', function () {
        if (column.search() !== this.value) {
          column.search(this.value).draw();
        }
      });
    });
  },
  language: {
    processing: "Memuat...",
    search: "Cari:",
    lengthMenu: "Tampilkan _MENU_  ",
    info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
    infoEmpty: "Menampilkan 0 sampai 0 dari 0 data",
    infoFiltered: "(disaring dari _MAX_ total data)",
    infoPostFix: "",
    loadingRecords: "Memuat data...",
    zeroRecords: "Tidak ada data ditemukan",
    emptyTable: "Tidak ada data tersedia",
    paginate: {
      first: "Pertama",
      previous: "Sebelumnya",
      next: "Berikutnya",
      last: "Terakhir"
    },
    aria: {
      sortAscending: ": aktifkan untuk urutkan naik",
      sortDescending: ": aktifkan untuk urutkan turun"
    }
  }
});

$('#clearFilterBtn').on('click', function () {
  $('#userTable tfoot input, #userTable tfoot select').val('');
  table.columns().search('').draw();
});

$('#userTable tfoot input').on('keyup change', function () {
  // const colIndex = $(this).parent().index();
  const $cell = $(this).closest('th');
  const colIndex = $cell.index();
  table.column(colIndex).search(this.value).draw();
});

$('#userTable tfoot select').on('change', function () {
  // const colIndex = $(this).parent().index();
    const $cell = $(this).closest('th');
  const colIndex = $cell.index();
  table.column(colIndex).search(this.value).draw();
});

let selectedUserId = null;

// Ketika tombol hapus ditekan
$(document).on('click', '.btn-delete-user', function () {
  selectedUserId = $(this).data('id'); // Ambil ID user
  $('#deleteUserModal').modal('show'); // Tampilkan modal Bootstrap
});

// Ketika konfirmasi hapus ditekan
$('#confirmDeleteUser').on('click', function () {
  if (!selectedUserId) return;
  const csrfToken = $('meta[name="csrf-token"]').attr('content');
  $.ajax({
    url: `/api/pengaturan/users/${selectedUserId}`,
    type: 'DELETE',
    contentType: 'application/json',
    headers: {
      'CSRF-Token': csrfToken // ← penting!
    },
    success: function (res) {
      if (res.success) {
        $('#deleteUserModal').modal('hide');

        // Jika pakai DataTable:
        if ($.fn.DataTable.isDataTable('#userTable')) {
          $('#userTable').DataTable().ajax.reload();
        } else {
          location.reload();
        }
      } else {
        console.log(res.message || 'Gagal menghapus pengguna.');
      }
    },
    error: function (err) {
      console.error(err);
      console.log('Terjadi kesalahan saat menghapus.');
    }
  });
});