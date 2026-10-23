import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const DataTable = ({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = "Search records...",
  itemsPerPage = 6,
  renderRowClass = null,
  emptyMessage = "No records found"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter records based on search
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecords = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="w-100">
      {searchable && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="position-relative" style={{ maxWidth: '300px', width: '100%' }}>
            <Search className="position-absolute text-muted" size={16} style={{ top: '10px', left: '10px' }} />
            <input
              type="text"
              className="form-control ps-5 py-1.5"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="text-secondary small">
            Showing <strong>{filteredData.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> items
          </div>
        </div>
      )}

      <div className="table-responsive rounded border bg-white shadow-none">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase text-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={`py-2.5 px-3 ${col.className || ''}`} style={col.style || {}}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((item, rowIdx) => (
                <tr key={item.id || rowIdx} className={renderRowClass ? renderRowClass(item) : ''}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-2.5 px-3 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(item, rowIdx) : item[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-muted small">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-secondary small">
            Page {currentPage} of {totalPages}
          </span>
          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
