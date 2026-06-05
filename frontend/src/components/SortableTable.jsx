import { useState, useMemo } from 'react';

const SortableTable = ({ columns, data, renderRow, emptyMsg = 'No records found.' }) => {
  const [sortKey, setSortKey] = useState(columns[0]?.key || '');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map(({ key, label, sortable = true }) => (
              <th
                key={key}
                className={sortable ? 'sortable' : ''}
                onClick={() => sortable && handleSort(key)}
              >
                {label}
                {sortable && (
                  <span className="sort-icon">
                    {sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>{emptyMsg}</p>
                </div>
              </td>
            </tr>
          ) : (
            sorted.map(row => renderRow(row))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SortableTable;
