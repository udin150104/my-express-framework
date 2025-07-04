
const table = $('#tableLogs').DataTable({
  processing: true,
  serverSide: true,
  ajax: {
    url: '/api/log-activity',
    type: 'GET'
  },
  dom: '<"row mb-2 align-items-center"' +
    '<"col-md-6 d-flex align-items-center gap-2">' +    // Buttons kiri
    '<"col-md-6 d-flex justify-content-end gap-2"lf>' +  // Length + Filter kanan
    '>' +
    'rt' +
    '<"row mt-2 align-items-center"' +
    '<"col-md-6"i> ' +
    '<"col-md-6 d-flex justify-content-end"p>' +
    '>',
  columns: [
    {
      data: 'user',
      title: 'User',
      render: data => `<i class="bi bi-person-circle me-1 text-dark"></i> ${data || '<i class="text-muted">Tidak Diketahui</i>'}`
    },
    {
      data: 'description',
      title: 'Aktivitas',
      render: data => `
      <pre>
      <code class="d-block text-truncate" class="w-log" title="${data}">
        ${data}
      </code>
      </pre>
    `
    },
    {
      data: 'ip_address',
      title: 'IP',
      render: data => `<span class="badge bg-light text-dark">${data}</span>`
    },
    {
      data: 'user_agent',
      title: 'Perangkat',
      render: data => `
      <pre>
        <code class="d-block text-truncate"  class="w-log" title="${data}">
          ${data}
        </code>
      </pre>
    `
    },
    {
      data: 'created_at',
      title: 'Waktu',
      render: data => {
        const d = new Date(data);
        return `
        <span title="${d.toLocaleString()}">
          ${d.toLocaleDateString()} ${d.toLocaleTimeString()}
        </span>
      `;
      }
    }
  ],
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