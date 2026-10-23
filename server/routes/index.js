const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const archiver = require('archiver');
const QRCode = require('qrcode');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

// Import Mongoose Models
const Template = require('../models/Template');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Multer memory storage configuration for spreadsheet uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const isSpreadsheet =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'text/csv' ||
      file.originalname.match(/\.(xlsx|xls|csv)$/i);

    if (isSpreadsheet) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.'));
    }
  },
});

/**
 * Normalizes header keys to clean identifiers.
 */
const normalizeHeader = (header) => {
  if (!header) return '';
  return String(header).trim();
};

/**
 * Extracts and sanitizes cell values from ExcelJS row data.
 */
const getCellValue = (cell) => {
  if (cell === null || cell === undefined) return '';
  if (typeof cell === 'object') {
    if (cell.text !== undefined) return String(cell.text).trim();
    if (cell.result !== undefined) return String(cell.result).trim();
    if (cell.values !== undefined) return String(cell.values).trim();
    return JSON.stringify(cell);
  }
  return String(cell).trim();
};

/**
 * Helper to fetch or read an image (local file, base64 data URI, or remote HTTP URL) into a Buffer.
 */
const fetchImageBuffer = async (imageSource) => {
  if (!imageSource || typeof imageSource !== 'string') return null;

  try {
    // 1. Base64 Data URI
    if (imageSource.startsWith('data:image/')) {
      const base64Data = imageSource.split(';base64,').pop();
      return Buffer.from(base64Data, 'base64');
    }

    // 2. HTTP / HTTPS URL
    if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
      const response = await axios.get(imageSource, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });
      return Buffer.from(response.data);
    }

    // 3. Local filesystem path
    if (fs.existsSync(imageSource)) {
      return fs.readFileSync(imageSource);
    }

    return null;
  } catch (err) {
    console.warn(`[Warning] Could not load background image from ${imageSource}:`, err.message);
    return null;
  }
};

/**
 * Sanitizes participant filenames for cross-platform ZIP extraction.
 */
const sanitizeFilename = (name) => {
  if (!name) return 'participant';
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
};

/**
 * @route   POST /api/events
 * @desc    Create a new Event linking title, date, organization, and a templateId
 * @access  Protected
 */
router.post('/events', authMiddleware, async (req, res) => {
  try {
    const { title, date, organization, templateId, category, signatory } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Event title is required.',
      });
    }

    if (!organization || !organization.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Issuing organization is required.',
      });
    }

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: A linked templateId ObjectId is required.',
      });
    }

    // Verify template existence or validate ObjectId format
    const templateExists = await Template.findById(templateId);
    if (!templateExists) {
      return res.status(404).json({
        success: false,
        message: `Template with ID "${templateId}" not found in database.`,
      });
    }

    const newEvent = new Event({
      title: title.trim(),
      date: date ? new Date(date) : new Date(),
      organization: organization.trim(),
      templateId,
    });

    const savedEvent = await newEvent.save();

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: savedEvent,
      eventId: savedEvent._id,
    });
  } catch (error) {
    console.error('[Error: POST /api/events]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/events
 * @desc    Fetch all events sorted by date descending, populating referenced template
 * @access  Protected
 */
router.get('/events', authMiddleware, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('templateId', 'name canvasWidth canvasHeight backgroundImageUrl')
      .sort({ createdAt: -1, date: -1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('[Error: GET /api/events]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/templates
 * @desc    Save Canva-style layout / Fabric.js canvas state
 * @access  Protected
 */
router.post('/templates', authMiddleware, async (req, res) => {
  try {
    const { name, backgroundImageUrl, canvasWidth, canvasHeight, canvasState } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: Template name is required.',
      });
    }

    if (!canvasState) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error: canvasState object is required.',
      });
    }

    const newTemplate = new Template({
      name: name.trim(),
      backgroundImageUrl: backgroundImageUrl || '',
      canvasWidth: canvasWidth || 1123,
      canvasHeight: canvasHeight || 794,
      canvasState,
    });

    const savedTemplate = await newTemplate.save();

    return res.status(201).json({
      success: true,
      message: 'Template saved successfully',
      data: {
        templateId: savedTemplate._id,
        name: savedTemplate.name,
        canvasWidth: savedTemplate.canvasWidth,
        canvasHeight: savedTemplate.canvasHeight,
        createdAt: savedTemplate.createdAt,
      },
    });
  } catch (error) {
    console.error('[Error: POST /api/templates]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save template',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/events/:eventId/upload
 * @desc    Handle CSV/Excel file upload, parse spreadsheet rows, and validate participant data
 * @access  Public / Protected
 */
router.post('/events/:eventId/upload', upload.single('file'), async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a CSV or Excel file.',
      });
    }

    const filename = req.file.originalname.toLowerCase();
    const isCsv = filename.endsWith('.csv') || req.file.mimetype === 'text/csv';
    const workbook = new ExcelJS.Workbook();

    if (isCsv) {
      const stream = Readable.from(req.file.buffer);
      await workbook.csv.read(stream);
    } else {
      await workbook.xlsx.load(req.file.buffer);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet has no readable sheets or data.',
      });
    }

    const headers = [];
    const validRecords = [];
    const invalidRecords = [];

    // Extract headers from Row 1
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      headers[colNumber] = normalizeHeader(getCellValue(cell.value));
    });

    if (headers.filter(Boolean).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Spreadsheet is missing header row columns.',
      });
    }

    // Flexible identifier for participant name column
    const nameColIndex = headers.findIndex((h) =>
      h && /^(participant(\s|_|-)?name|full(\s|_|-)?name|name|student(\s|_|-)?name)$/i.test(h)
    );

    // Identifier for email column
    const emailColIndex = headers.findIndex((h) =>
      h && /^(participant(\s|_|-)?email|email(\s|_|-)?address|email)$/i.test(h)
    );

    // Process participant rows
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip headers

      const rowData = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const headerKey = headers[colNumber];
        if (headerKey) {
          rowData[headerKey] = getCellValue(cell.value);
        }
      });

      let participantName = '';
      if (nameColIndex !== -1 && row.getCell(nameColIndex).value) {
        participantName = getCellValue(row.getCell(nameColIndex).value);
      } else {
        participantName =
          rowData['participantName'] ||
          rowData['Participant Name'] ||
          rowData['ParticipantName'] ||
          rowData['Name'] ||
          rowData['name'] ||
          rowData['Full Name'] ||
          '';
      }

      let participantEmail = '';
      if (emailColIndex !== -1 && row.getCell(emailColIndex).value) {
        participantEmail = getCellValue(row.getCell(emailColIndex).value);
      } else {
        participantEmail =
          rowData['participantEmail'] ||
          rowData['Participant Email'] ||
          rowData['Email'] ||
          rowData['email'] ||
          '';
      }

      const recordItem = {
        rowNumber,
        participantName: participantName.trim(),
        participantEmail: participantEmail.trim(),
        data: rowData,
      };

      if (recordItem.participantName) {
        validRecords.push(recordItem);
      } else {
        invalidRecords.push({
          ...recordItem,
          reason: 'Missing or empty participant name column value',
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Spreadsheet parsed and validated successfully',
      eventId,
      summary: {
        totalRows: validRecords.length + invalidRecords.length,
        validCount: validRecords.length,
        invalidCount: invalidRecords.length,
        detectedHeaders: headers.filter(Boolean),
      },
      validRecords,
      invalidRecords,
    });
  } catch (error) {
    console.error('[Error: POST /api/events/:eventId/upload]:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing spreadsheet file',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/events/:eventId/generate
 * @desc    Bulk generate PDF certificates with QR codes, record in MongoDB, and stream zipped archive
 * @access  Public / Protected
 */
router.post('/events/:eventId/generate', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { participants } = req.body;

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A non-empty participants array is required in req.body.',
      });
    }

    // 1. Database Lookup: Find Event and populate Template
    const event = await Event.findById(eventId).populate('templateId');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event with ID "${eventId}" not found.`,
      });
    }

    const template = event.templateId;
    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'The associated event does not have a linked certificate template.',
      });
    }

    const canvasWidth = template.canvasWidth || 1123;
    const canvasHeight = template.canvasHeight || 794;
    const canvasObjects = template.canvasState?.objects || [];

    // Optional background image resolution
    let bgBuffer = null;
    const bgUrl = template.backgroundImageUrl || template.canvasState?.backgroundImage?.src;
    if (bgUrl) {
      bgBuffer = await fetchImageBuffer(bgUrl);
    }

    // Base verification URL domain
    const clientBaseUrl =
      process.env.CLIENT_URL ||
      process.env.APP_URL ||
      `http://${req.headers.host || 'localhost:5000'}`;

    // 2. Archiver & Response Stream Setup
    const archive = archiver('zip', {
      zlib: { level: 6 }, // Balanced compression & speed
    });

    archive.on('error', (err) => {
      console.error('[Archiver Stream Error]:', err);
      if (!res.headersSent) {
        res.status(500).send({ success: false, error: err.message });
      }
    });

    // Set streaming HTTP headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificates_${event.title.replace(/[^a-z0-9]/gi, '_')}.zip"`
    );

    // Pipe archive to Express response stream
    archive.pipe(res);

    // 3. Batch Certificate Generation Loop
    for (const participant of participants) {
      const participantName =
        participant.participantName ||
        participant['Participant Name'] ||
        participant.name ||
        'Valued Participant';

      const participantEmail = participant.participantEmail || participant.email || '';

      // Generate unique certificate ID
      const certificateId = `CERT-${crypto.randomUUID().split('-')[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      // Initialize PDFDocument with template dimensions
      const doc = new PDFDocument({
        size: [canvasWidth, canvasHeight],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        autoFirstPage: true,
      });

      // Stream the PDF document directly into the ZIP archive
      const safeFilename = sanitizeFilename(participantName);
      archive.append(doc, {
        name: `${safeFilename}_${certificateId.slice(-6)}.pdf`,
      });

      // Embed background image if present
      if (bgBuffer) {
        try {
          doc.image(bgBuffer, 0, 0, {
            width: canvasWidth,
            height: canvasHeight,
          });
        } catch (imgErr) {
          console.warn('[Warning] Failed to render background image in PDF:', imgErr.message);
        }
      }

      // Generate QR Code Buffer for verification URL
      const verifyUrl = `${clientBaseUrl}/verify/${certificateId}`;
      const qrCodeBuffer = await QRCode.toBuffer(verifyUrl, {
        width: 130,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      let qrPlaced = false;

      // Render Fabric.js Canvas Objects
      for (const obj of canvasObjects) {
        const x = obj.left || 0;
        const y = obj.top || 0;

        // Check if element is a QR Code placeholder
        if (
          obj.id === 'qr-code' ||
          obj.name === 'qr-code' ||
          obj.isQrPlaceholder === true ||
          (typeof obj.text === 'string' && /{{qrCode|qr_code|qrcode}}/i.test(obj.text))
        ) {
          const qrWidth = (obj.width || 120) * (obj.scaleX || 1);
          const qrHeight = (obj.height || 120) * (obj.scaleY || 1);

          doc.image(qrCodeBuffer, x, y, {
            width: qrWidth,
            height: qrHeight,
          });
          qrPlaced = true;
          continue;
        }

        // Text & Dynamic Token Elements
        if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
          let text = obj.text || '';

          // Dynamic token replacement
          text = text.replace(/{{participantName}}|{{participant_name}}|{{name}}/gi, participantName);
          text = text.replace(/{{certificateId}}|{{certificate_id}}|{{id}}/gi, certificateId);
          text = text.replace(/{{eventTitle}}|{{event_title}}/gi, event.title);
          text = text.replace(/{{organization}}/gi, event.organization);
          text = text.replace(
            /{{issueDate}}|{{date}}/gi,
            new Date(event.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          );

          // Custom metadata token replacement if available
          if (participant.data && typeof participant.data === 'object') {
            for (const [key, val] of Object.entries(participant.data)) {
              const regex = new RegExp(`{{${key}}}`, 'gi');
              text = text.replace(regex, val);
            }
          }

          const fontSize = (obj.fontSize || 20) * (obj.scaleY || 1);
          const fill = obj.fill || '#000000';
          const align = obj.textAlign || 'left';
          const width = obj.width ? obj.width * (obj.scaleX || 1) : undefined;

          doc
            .fontSize(fontSize)
            .fillColor(fill)
            .text(text, x, y, {
              width,
              align,
              lineBreak: true,
            });
        }
      }

      // Default QR placement in bottom corner if no explicit canvas placeholder was found
      if (!qrPlaced) {
        doc.image(qrCodeBuffer, canvasWidth - 140, canvasHeight - 140, {
          width: 100,
          height: 100,
        });
      }

      // Finalize current participant's PDF document
      doc.end();

      // Persist certificate details in MongoDB
      await Certificate.create({
        eventId: event._id,
        participantName,
        participantEmail,
        certificateId,
        issueDate: new Date(),
        status: 'generated',
        metadata: participant.data || {},
      });
    }

    // 4. Finalize the ZIP archive stream
    await archive.finalize();
  } catch (error) {
    console.error('[Error: POST /api/events/:eventId/generate]:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Bulk generation engine failed',
        error: error.message,
      });
    }
  }
});

/**
 * @route   GET /api/verify/:certificateId
 * @desc    Lookup for the QR verification portal
 * @access  Public
 */
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId || !certificateId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID parameter is required.',
      });
    }

    const certificate = await Certificate.findOne({
      certificateId: certificateId.trim(),
    }).populate('eventId', 'title date organization');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate is invalid, expired, or has been tampered with.',
        isValid: false,
      });
    }

    return res.status(200).json({
      success: true,
      isValid: true,
      message: 'Certificate verified successfully',
      data: {
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        participantEmail: certificate.participantEmail,
        issueDate: certificate.issueDate,
        status: certificate.status,
        metadata: certificate.metadata,
        event: certificate.eventId
          ? {
              title: certificate.eventId.title,
              date: certificate.eventId.date,
              organization: certificate.eventId.organization,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[Error: GET /api/verify/:certificateId]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: error.message,
    });
  }
});

module.exports = router;
