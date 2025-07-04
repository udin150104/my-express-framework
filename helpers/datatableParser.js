// utils/datatableParser.js
function parseDataTableQuery(query) {
  const columns = [];
  const columnCount = Object.keys(query).filter(k => k.startsWith('columns[') && k.endsWith('[data]')).length;

  for (let i = 0; i < columnCount; i++) {
    columns.push({
      data: query[`columns[${i}][data]`],
      searchable: query[`columns[${i}][searchable]`] === 'true',
      orderable: query[`columns[${i}][orderable]`] === 'true',
      searchValue: query[`columns[${i}][search][value]`] || ''
    });
  }

  const order = {
    columnIndex: parseInt(query['order[0][column]'] || 0),
    dir: query['order[0][dir]'] || 'asc'
  };

  return {
    draw: parseInt(query.draw) || 0,
    start: parseInt(query.start) || 0,
    length: parseInt(query.length) || 10,
    searchValue: query['search[value]'] || '',
    columns,
    order
  };
}

module.exports = parseDataTableQuery;
