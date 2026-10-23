import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { 
  Upload, 
  Type, 
  QrCode, 
  Save, 
  Trash2, 
  Bold, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Layers, 
  BringToFront, 
  SendToBack,
  FileJson,
  CheckCircle2,
  Sliders,
  Undo2,
  Redo2,
  Loader2
} from 'lucide-react';
import { saveTemplate } from '../services/api';

export const TemplateStudio = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Canvas dimensions fixed to A4 Landscape ratio (800 x 565)
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 565;

  // Active object state
  const [activeObject, setActiveObject] = useState(null);
  const [isTextObject, setIsTextObject] = useState(false);

  // Styling state synced with active object
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(28);
  const [textColor, setTextColor] = useState('#0f172a');
  const [isBold, setIsBold] = useState(false);
  const [textAlign, setTextAlign] = useState('center');

  // Undo / Redo History stack
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const isHistoryActionRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Serialization modal state
  const [savedJson, setSavedJson] = useState(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [templateName, setTemplateName] = useState('Standard Academic Certificate');
  const [isSaving, setIsSaving] = useState(false);
  const [saveAlert, setSaveAlert] = useState(null);

  // Save Canvas State to History
  const saveState = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || isHistoryActionRef.current) return;

    try {
      const json = canvas.toJSON(['tokenKey', 'isQrPlaceholder', 'isTemplateBorder', 'isBackgroundImageLayer']);
      const currentHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      
      // Limit history to 30 states to keep memory clean
      if (currentHistory.length > 30) {
        currentHistory.shift();
      }

      currentHistory.push(JSON.stringify(json));
      historyRef.current = currentHistory;
      historyIndexRef.current = currentHistory.length - 1;

      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false);
    } catch (err) {
      console.warn('Could not record history snapshot:', err);
    }
  }, []);

  // Sync state from Fabric object
  const syncStylesFromObject = useCallback((obj) => {
    if (!obj) {
      setActiveObject(null);
      setIsTextObject(false);
      return;
    }

    setActiveObject(obj);
    const isText = obj.type === 'i-text' || obj.type === 'text';
    setIsTextObject(isText);

    if (isText) {
      setFontFamily(obj.fontFamily || 'Inter');
      setFontSize(obj.fontSize || 28);
      setTextColor(obj.fill || '#0f172a');
      setIsBold(obj.fontWeight === 'bold' || obj.fontWeight === 700 || obj.fontWeight === '700');
      setTextAlign(obj.textAlign || 'center');
    }
  }, []);

  // Undo action
  const handleUndo = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;

    isHistoryActionRef.current = true;
    historyIndexRef.current -= 1;
    const previousState = historyRef.current[historyIndexRef.current];

    try {
      await canvas.loadFromJSON(JSON.parse(previousState));
      canvas.renderAll();
      setActiveObject(canvas.getActiveObject() || null);
    } catch (err) {
      console.error('Failed to undo canvas state:', err);
    } finally {
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      isHistoryActionRef.current = false;
    }
  }, []);

  // Redo action
  const handleRedo = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;

    isHistoryActionRef.current = true;
    historyIndexRef.current += 1;
    const nextState = historyRef.current[historyIndexRef.current];

    try {
      await canvas.loadFromJSON(JSON.parse(nextState));
      canvas.renderAll();
      setActiveObject(canvas.getActiveObject() || null);
    } catch (err) {
      console.error('Failed to redo canvas state:', err);
    } finally {
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      isHistoryActionRef.current = false;
    }
  }, []);

  // Initialize Fabric Canvas with strict cleanup to prevent React strict-mode double-render bugs
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    });

    fabricCanvasRef.current = canvas;

    // Default template elements
    const title = new fabric.IText('CERTIFICATE OF ACHIEVEMENT', {
      left: CANVAS_WIDTH / 2,
      top: 75,
      originX: 'center',
      fontSize: 26,
      fontWeight: 'bold',
      fill: '#0f172a',
      fontFamily: 'Inter',
      textAlign: 'center',
      tokenKey: 'certificateTitle',
    });

    const presentedTo = new fabric.IText('PROUDLY PRESENTED TO', {
      left: CANVAS_WIDTH / 2,
      top: 140,
      originX: 'center',
      fontSize: 13,
      fill: '#64748b',
      fontFamily: 'Inter',
      textAlign: 'center',
      tokenKey: 'staticLabel',
    });

    const recipient = new fabric.IText('{{participantName}}', {
      left: CANVAS_WIDTH / 2,
      top: 215,
      originX: 'center',
      fontSize: 34,
      fontWeight: 'bold',
      fill: '#059669',
      fontFamily: 'Inter',
      textAlign: 'center',
      tokenKey: '{{participantName}}',
    });

    const eventDesc = new fabric.IText('in recognition of outstanding participation and accomplishment in {{eventName}}', {
      left: CANVAS_WIDTH / 2,
      top: 295,
      originX: 'center',
      fontSize: 14,
      fill: '#475569',
      fontFamily: 'Inter',
      textAlign: 'center',
      tokenKey: '{{eventDescription}}',
    });

    canvas.add(title, presentedTo, recipient, eventDesc);
    canvas.renderAll();

    // Initial snapshot into history
    const initialJson = canvas.toJSON(['tokenKey', 'isQrPlaceholder', 'isTemplateBorder', 'isBackgroundImageLayer']);
    historyRef.current = [JSON.stringify(initialJson)];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);

    // Event listeners
    const onSelectionCreated = (e) => syncStylesFromObject(e.selected?.[0] || null);
    const onSelectionUpdated = (e) => syncStylesFromObject(e.selected?.[0] || null);
    const onSelectionCleared = () => {
      setActiveObject(null);
      setIsTextObject(false);
    };

    const onObjectModified = () => saveState();

    canvas.on('selection:created', onSelectionCreated);
    canvas.on('selection:updated', onSelectionUpdated);
    canvas.on('selection:cleared', onSelectionCleared);
    canvas.on('object:modified', onObjectModified);

    // Keyboard shortcut listener (Delete / Backspace, Undo Ctrl+Z, Redo Ctrl+Y)
    const handleKeyDown = (e) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleUndo();
          return;
        }
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleRedo();
          return;
        }
      }

      // Do not trigger deletion if user is typing inside an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      const active = canvas.getActiveObject();
      if (active && (e.key === 'Delete' || e.key === 'Backspace')) {
        // If user is editing inside the text itself, let standard text backspacing occur
        if (active.isEditing) {
          return;
        }
        e.preventDefault();
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.renderAll();
        setActiveObject(null);
        setIsTextObject(false);
        saveState();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.off('selection:created', onSelectionCreated);
      canvas.off('selection:updated', onSelectionUpdated);
      canvas.off('selection:cleared', onSelectionCleared);
      canvas.off('object:modified', onObjectModified);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [syncStylesFromObject, saveState, handleUndo, handleRedo]);

  // Handle Background Image Upload & Lock to Canvas
  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      setBackgroundUrl(dataUrl);
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      try {
        // Remove any previous custom background image layer
        const existingBg = canvas.getObjects().find(o => o.isBackgroundImageLayer);
        if (existingBg) canvas.remove(existingBg);

        const img = await fabric.FabricImage.fromURL(dataUrl);
        img.set({
          left: 0,
          top: 0,
          originX: 'left',
          originY: 'top',
          selectable: false,       // Crucial: User cannot move it
          evented: false,          // Crucial: Non-clickable
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          isBackgroundImageLayer: true,
        });

        // Scale perfectly to fit canvas dimensions
        img.scaleToWidth(CANVAS_WIDTH);
        img.scaleToHeight(CANVAS_HEIGHT);

        // Add to canvas and send to bottom layer
        canvas.add(img);
        canvas.sendObjectToBack(img);
        canvas.renderAll();
        saveState();
      } catch (err) {
        console.error('Failed to load background image:', err);
      }
    };

    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input to allow re-uploading same file
  };

  // Insert Dynamic Variable Token at canvas center
  const handleAddVariable = (token) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const newText = new fabric.IText(token, {
      left: CANVAS_WIDTH / 2,
      top: CANVAS_HEIGHT / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 26,
      fill: token.includes('Name') ? '#059669' : '#0f172a',
      fontWeight: 'bold',
      fontFamily: fontFamily || 'Inter',
      textAlign: 'center',
      tokenKey: token,
    });

    canvas.add(newText);
    canvas.setActiveObject(newText);
    canvas.renderAll();
    saveState();
  };

  // Insert Distinct QR Code Verification Placeholder Box
  const handleAddQrPlaceholder = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const QR_SIZE = 95;

    // Outer check/border box
    const outerBox = new fabric.Rect({
      width: QR_SIZE,
      height: QR_SIZE,
      fill: '#ffffff',
      stroke: '#0f172a',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    });

    // Checkered corner boxes imitating real QR code
    const corner1 = new fabric.Rect({ width: 20, height: 20, fill: '#059669', left: -26, top: -26, originX: 'center', originY: 'center' });
    const corner2 = new fabric.Rect({ width: 20, height: 20, fill: '#059669', left: 26, top: -26, originX: 'center', originY: 'center' });
    const corner3 = new fabric.Rect({ width: 20, height: 20, fill: '#059669', left: -26, top: 26, originX: 'center', originY: 'center' });

    const qrText = new fabric.IText('QR VERIFY', {
      fontSize: 11,
      fontWeight: 'bold',
      fill: '#064e3b',
      originX: 'center',
      originY: 'center',
      fontFamily: 'monospace',
    });

    const qrGroup = new fabric.Group([outerBox, corner1, corner2, corner3, qrText], {
      left: CANVAS_WIDTH - 120,
      top: CANVAS_HEIGHT - 100,
      originX: 'center',
      originY: 'center',
      tokenKey: '{{qrCode}}',
      isQrPlaceholder: true,
    });

    canvas.add(qrGroup);
    canvas.setActiveObject(qrGroup);
    canvas.renderAll();
    saveState();
  };

  // Real-time Styling Controls Handlers
  const handleFontFamilyChange = (val) => {
    setFontFamily(val);
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (active && (active.type === 'i-text' || active.type === 'text')) {
      active.set('fontFamily', val);
      canvas.renderAll();
      saveState();
    }
  };

  const handleFontSizeChange = (val) => {
    const size = parseInt(val, 10);
    setFontSize(size);
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (active && (active.type === 'i-text' || active.type === 'text')) {
      active.set('fontSize', size);
      canvas.renderAll();
      saveState();
    }
  };

  const handleColorChange = (val) => {
    setTextColor(val);
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (active && (active.type === 'i-text' || active.type === 'text')) {
      active.set('fill', val);
      canvas.renderAll();
      saveState();
    }
  };

  const handleToggleBold = () => {
    const nextBold = !isBold;
    setIsBold(nextBold);
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (active && (active.type === 'i-text' || active.type === 'text')) {
      active.set('fontWeight', nextBold ? 'bold' : 'normal');
      canvas.renderAll();
      saveState();
    }
  };

  const handleTextAlignChange = (alignment) => {
    setTextAlign(alignment);
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (active && (active.type === 'i-text' || active.type === 'text')) {
      active.set('textAlign', alignment);
      canvas.renderAll();
      saveState();
    }
  };

  // Z-Index Management (Bring to Front / Send to Back)
  const handleBringToFront = () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      canvas.bringObjectToFront(active);
      canvas.renderAll();
      saveState();
    }
  };

  const handleSendToBack = () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      // Ensure we do not send behind the locked background image
      const bgImg = canvas.getObjects().find(o => o.isBackgroundImageLayer);
      if (bgImg) {
        canvas.sendObjectToBack(active);
        canvas.sendObjectToBack(bgImg);
      } else {
        canvas.sendObjectToBack(active);
      }
      canvas.renderAll();
      saveState();
    }
  };

  // Delete Element
  const handleDeleteActive = () => {
    const canvas = fabricCanvasRef.current;
    const active = canvas?.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.renderAll();
      setActiveObject(null);
      setIsTextObject(false);
      saveState();
    }
  };

  // Export Schema / Save Template JSON to MongoDB via Backend API
  const handleSaveTemplate = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      setIsSaving(true);
      setSaveAlert(null);

      // Serialize canvas state, preserving custom properties
      const serializedJson = canvas.toJSON(['tokenKey', 'isQrPlaceholder', 'isTemplateBorder', 'isBackgroundImageLayer']);
      console.log('--- SAVING CERTIFICATE TEMPLATE SCHEMA ---', serializedJson);

      const payload = {
        name: templateName || 'Custom Certificate Template',
        backgroundImageUrl: backgroundUrl || '',
        canvasWidth: CANVAS_WIDTH,
        canvasHeight: CANVAS_HEIGHT,
        canvasState: serializedJson,
      };

      const result = await saveTemplate(payload);

      setSavedJson(serializedJson);
      setSaveAlert({
        type: 'success',
        message: `Template saved successfully! Database ID: ${result?.data?.templateId || 'Saved'}`,
      });
      setShowJsonModal(true);
    } catch (err) {
      console.error('Failed to save template to backend:', err);
      setSaveAlert({
        type: 'danger',
        message: `Error saving template: ${err.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-4 bg-light min-vh-100">
      {/* Top Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom bg-white p-3 rounded-3 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 bg-success text-white rounded-3 d-flex align-items-center justify-content-center shadow-xs">
            <Layers size={22} />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-dark">Interactive Certificate Template Studio</h4>
            <p className="text-secondary small mb-0">Canva-style visual editor with undo/redo history and dynamic variable tokens.</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Undo / Redo Buttons */}
          <div className="btn-group me-2" role="group">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="btn btn-outline-secondary btn-sm px-3 py-2 d-flex align-items-center gap-1.5 rounded-start-2 fw-medium"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
              <span>Undo</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="btn btn-outline-secondary btn-sm px-3 py-2 d-flex align-items-center gap-1.5 rounded-end-2 fw-medium"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={16} />
              <span>Redo</span>
            </button>
          </div>

          {/* Hidden File Input for Background Image */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBackgroundUpload}
            accept="image/png, image/jpeg, image/jpg"
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-outline-secondary btn-sm px-3.5 py-2 d-flex align-items-center gap-2 rounded-2 fw-medium"
          >
            <Upload size={16} />
            <span>Upload Background (PNG/JPG)</span>
          </button>

          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="btn btn-success btn-sm px-4 py-2 d-flex align-items-center gap-2 rounded-2 fw-semibold text-white shadow-xs"
          >
            {isSaving ? <Loader2 size={16} className="spinner-border spinner-border-sm" /> : <Save size={16} />}
            <span>{isSaving ? 'Saving to Database...' : 'Save Template Schema'}</span>
          </button>
        </div>
      </div>

      {saveAlert && (
        <div className={`alert alert-${saveAlert.type} alert-dismissible fade show d-flex align-items-center justify-content-between mb-4 shadow-xs`} role="alert">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={18} />
            <span>{saveAlert.message}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setSaveAlert(null)}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Left Toolbar Column (Dynamic Variables & Active Styling) */}
        <div className="col-12 col-xl-3 col-lg-4">
          
          {/* 1. Dynamic Variables Palette */}
          <div className="card border-0 shadow-sm rounded-3 p-3.5 bg-white mb-3">
            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
              <Type size={18} className="text-success" />
              <span>Dynamic Variables</span>
            </h6>
            <p className="text-muted small mb-2.5">
              Click any token below to insert it onto the canvas:
            </p>

            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-outline-primary btn-sm text-start py-2 px-3 rounded-2 fw-semibold d-flex justify-content-between align-items-center"
                onClick={() => handleAddVariable('{{participantName}}')}
              >
                <span>&#123;&#123;participantName&#125;&#125;</span>
                <span className="badge bg-success-subtle text-success small">Name</span>
              </button>

              <button
                className="btn btn-outline-secondary btn-sm text-start py-2 px-3 rounded-2 fw-semibold d-flex justify-content-between align-items-center"
                onClick={() => handleAddVariable('{{eventName}}')}
              >
                <span>&#123;&#123;eventName&#125;&#125;</span>
                <span className="badge bg-light text-secondary small">Event</span>
              </button>

              <button
                className="btn btn-outline-secondary btn-sm text-start py-2 px-3 rounded-2 fw-semibold d-flex justify-content-between align-items-center"
                onClick={() => handleAddVariable('{{date}}')}
              >
                <span>&#123;&#123;date&#125;&#125;</span>
                <span className="badge bg-light text-secondary small">Date</span>
              </button>

              <button
                className="btn btn-outline-secondary btn-sm text-start py-2 px-3 rounded-2 fw-semibold d-flex justify-content-between align-items-center"
                onClick={() => handleAddVariable('{{signatoryTitle}}')}
              >
                <span>&#123;&#123;signatoryTitle&#125;&#125;</span>
                <span className="badge bg-light text-secondary small">Signatory</span>
              </button>

              <button
                className="btn btn-outline-success btn-sm text-start py-2 px-3 rounded-2 fw-semibold d-flex justify-content-between align-items-center"
                onClick={handleAddQrPlaceholder}
              >
                <span className="d-flex align-items-center gap-1.5">
                  <QrCode size={15} /> &#123;&#123;qrCode&#125;&#125;
                </span>
                <span className="badge bg-success-subtle text-success small">Verification</span>
              </button>
            </div>
          </div>

          {/* 2. Active Styling Controls Panel (The "Canva" feel) */}
          <div className="card border-0 shadow-sm rounded-3 p-3.5 bg-white">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <Sliders size={18} className="text-success" />
              <span>Typography & Styling</span>
            </h6>

            {activeObject && isTextObject ? (
              <div>
                {/* Font Family Dropdown */}
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold mb-1">Font Family</label>
                  <select
                    className="form-select form-select-sm"
                    value={fontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                  >
                    <option value="Inter">Inter (Clean Modern)</option>
                    <option value="Arial">Arial (Standard Sans)</option>
                    <option value="Times New Roman">Times New Roman (Serif)</option>
                    <option value="Courier">Courier (Monospace)</option>
                  </select>
                </div>

                {/* Font Size Slider & Number input */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small text-secondary fw-semibold mb-0">Font Size</label>
                    <span className="badge bg-light text-dark border small">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(e.target.value)}
                  />
                </div>

                {/* Color Picker */}
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold mb-1 d-block">Text Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color p-1"
                      style={{ width: '42px', height: '36px' }}
                      value={textColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace text-uppercase"
                      value={textColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                    />
                  </div>
                </div>

                {/* Font Weight & Text Alignment */}
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold mb-1">Formatting & Alignment</label>
                  <div className="d-flex gap-1 mb-2">
                    <button
                      className={`btn btn-sm ${isBold ? 'btn-dark' : 'btn-outline-secondary'} flex-grow-1 d-flex align-items-center justify-content-center gap-1`}
                      onClick={handleToggleBold}
                    >
                      <Bold size={14} /> Bold
                    </button>
                    <button
                      className={`btn btn-sm ${textAlign === 'left' ? 'btn-dark' : 'btn-outline-secondary'}`}
                      onClick={() => handleTextAlignChange('left')}
                      title="Align Left"
                    >
                      <AlignLeft size={15} />
                    </button>
                    <button
                      className={`btn btn-sm ${textAlign === 'center' ? 'btn-dark' : 'btn-outline-secondary'}`}
                      onClick={() => handleTextAlignChange('center')}
                      title="Align Center"
                    >
                      <AlignCenter size={15} />
                    </button>
                    <button
                      className={`btn btn-sm ${textAlign === 'right' ? 'btn-dark' : 'btn-outline-secondary'}`}
                      onClick={() => handleTextAlignChange('right')}
                      title="Align Right"
                    >
                      <AlignRight size={15} />
                    </button>
                  </div>
                </div>

                {/* Z-Index Controls & Trash */}
                <div className="pt-2 border-top">
                  <label className="form-label small text-secondary fw-semibold mb-1.5 d-block">Layer Ordering</label>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                      onClick={handleBringToFront}
                      title="Bring to Front"
                    >
                      <BringToFront size={14} /> Front
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                      onClick={handleSendToBack}
                      title="Send to Back"
                    >
                      <SendToBack size={14} /> Back
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm px-2.5"
                      onClick={handleDeleteActive}
                      title="Delete Object (or press Delete / Backspace key)"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : activeObject ? (
              // Selected object is not text (e.g., QR Code placeholder group)
              <div>
                <div className="p-3 bg-light rounded-2 text-center mb-3 border">
                  <QrCode size={28} className="text-success mb-1" />
                  <div className="fw-semibold text-dark small">QR Code Verification Stamp</div>
                  <div className="text-muted text-xs">Position this where the verification stamp should render</div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    onClick={handleBringToFront}
                  >
                    <BringToFront size={14} /> Front
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    onClick={handleSendToBack}
                  >
                    <SendToBack size={14} /> Back
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm px-2.5"
                    onClick={handleDeleteActive}
                    title="Delete object"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="text-center py-4 text-muted small">
                <Sliders size={28} className="text-muted opacity-50 mb-2" />
                <div>Select an element on the canvas to edit its styles.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Canvas Column */}
        <div className="col-12 col-xl-9 col-lg-8 d-flex flex-column align-items-center">
          <div className="card border-0 shadow-sm rounded-4 p-3.5 bg-white w-100 overflow-auto d-flex justify-content-center align-items-center">
            {/* Fabric HTML5 Canvas Container */}
            <div 
              style={{ 
                width: CANVAS_WIDTH, 
                height: CANVAS_HEIGHT, 
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                position: 'relative'
              }}
            >
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="text-muted small mt-2.5 d-flex align-items-center gap-3">
            <span>Canvas Size: <strong>{CANVAS_WIDTH} × {CANVAS_HEIGHT} px</strong> (A4 Landscape)</span>
            <span>•</span>
            <span>Shortcuts: <kbd>Ctrl+Z</kbd> Undo, <kbd>Ctrl+Y</kbd> Redo, <kbd>Delete</kbd> Remove</span>
          </div>
        </div>
      </div>

      {/* JSON Schema Serialization Modal */}
      {showJsonModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <FileJson size={20} className="text-success" />
                  <span>Serialized Template JSON Schema</span>
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowJsonModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                <p className="text-secondary small mb-2">
                  Serialized canvas state containing coordinates, styles, and custom token metadata (also logged to DevTools Console):
                </p>
                <pre
                  className="bg-dark text-success p-3 rounded-3 small overflow-auto font-monospace"
                  style={{ maxHeight: '360px' }}
                >
                  {JSON.stringify(savedJson, null, 2)}
                </pre>
              </div>

              <div className="modal-footer border-top d-flex justify-content-between">
                <span className="small text-muted">
                  {copiedNotification && (
                    <span className="text-success fw-bold d-flex align-items-center gap-1">
                      <CheckCircle2 size={15} /> Copied to clipboard!
                    </span>
                  )}
                </span>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowJsonModal(false)}>
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm text-white"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(savedJson, null, 2));
                      setCopiedNotification(true);
                      setTimeout(() => setCopiedNotification(false), 2500);
                    }}
                  >
                    Copy JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
