import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export const UploadDropzone = ({ onDataParsed, onFileUpload, currentFile, isUploading = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (onFileUpload) {
        onFileUpload(file);
      } else {
        processFile(file);
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (onFileUpload) {
        onFileUpload(file);
      } else {
        processFile(file);
      }
    }
  };

  const validateParticipantRow = (row, existingPairs) => {
    const errors = [];
    const name = (row.participantName || row.Name || row['Full Name'] || '').trim();
    const email = (row.email || row.Email || row['Email Address'] || '').trim();
    const role = (row.role || row.Role || 'Participant').trim();
    const issueDate = (row.issueDate || row.Date || new Date().toISOString().split('T')[0]).trim();
    const grade = (row.grade || row.Grade || 'Pass').trim();

    if (!name) {
      errors.push("Missing participant name");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.push("Missing email address");
    } else if (!emailRegex.test(email)) {
      errors.push("Invalid email format");
    }

    const pairKey = `${name.toLowerCase()}_${email.toLowerCase()}`;
    let isDuplicate = false;
    if (existingPairs.has(pairKey)) {
      isDuplicate = true;
      errors.push("Duplicate record with same name and email");
    } else if (name && email) {
      existingPairs.add(pairKey);
    }

    return {
      participantName: name,
      email: email,
      role: role,
      issueDate: issueDate,
      grade: grade,
      status: errors.length > 0 ? (isDuplicate ? 'duplicate' : 'error') : 'valid',
      errors: errors
    };
  };

  const processFile = (file) => {
    setErrorMessage('');
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage("Please upload a valid .csv or .xlsx spreadsheet file.");
      return;
    }

    setIsParsing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet);

        if (!rawJson || rawJson.length === 0) {
          setErrorMessage("The uploaded file contains no data rows.");
          setIsParsing(false);
          return;
        }

        const existingPairs = new Set();
        const parsedRows = rawJson.map((row, idx) => {
          const validated = validateParticipantRow(row, existingPairs);
          return {
            id: idx + 1,
            ...validated
          };
        });

        onDataParsed(parsedRows, {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          totalRows: parsedRows.length,
          uploadedAt: new Date().toLocaleTimeString()
        });

        setIsParsing(false);
      } catch (err) {
        console.error(err);
        setErrorMessage("Error parsing spreadsheet. Please check file structure.");
        setIsParsing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="w-100">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        style={{ display: 'none' }}
      />

      <div
        className={`dropzone-container ${isDragOver ? 'is-dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <div className="d-flex flex-column align-items-center justify-content-center">
          <div className="p-3 bg-white rounded-circle shadow-sm mb-3 text-primary border">
            {isParsing || isUploading ? (
              <div className="spinner-border text-primary" role="status" style={{ width: 36, height: 36 }}></div>
            ) : (
              <UploadCloud size={38} className="text-primary" />
            )}
          </div>
          <h5 className="fw-bold mb-1">
            {isUploading ? "Uploading & Parsing on Server..." : isParsing ? "Analyzing Spreadsheet..." : "Click or drag participant spreadsheet here"}
          </h5>
          <p className="text-muted small mb-3">
            Supports <code>.csv</code> and <code>.xlsx</code> formats (Name, Email, Role, Grade columns)
          </p>

          <span className="btn btn-outline-primary btn-sm px-4 rounded-pill fw-semibold">
            Browse Computer
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger mt-3 d-flex align-items-center gap-2 py-2 px-3 small rounded-3">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {currentFile && (
        <div className="card mt-3 border-0 bg-white shadow-sm rounded-3 p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2.5 rounded-3 bg-light text-success border">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <div className="fw-bold text-dark">{currentFile.fileName}</div>
                <div className="text-muted small">{currentFile.fileSize} • Uploaded {currentFile.uploadedAt}</div>
              </div>
            </div>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 rounded-pill d-flex align-items-center gap-1 small">
              <Check size={14} /> Ready for Validation
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
