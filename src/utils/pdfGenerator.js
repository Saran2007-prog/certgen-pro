import { jsPDF } from 'jspdf';

/**
 * Generates a real vector PDF certificate based on the selected template layout
 * @param {Object} params
 * @param {Object} params.cert - Recipient information
 * @param {Object} params.eventDetails - Event title, date, org, signatory, category
 * @param {Object} params.template - Selected template configuration
 * @returns {jsPDF}
 */
export const createCertificatePdf = ({ cert, eventDetails, template }) => {
  // A4 Landscape dimensions: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const templateId = template?.id || 'classic-gold';

  if (templateId === 'modern-tech') {
    // Dark Blueprint theme
    // Background
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, width, height, 'F');

    // Outer Neon Border
    doc.setDrawColor(56, 189, 248); // #38bdf8
    doc.setLineWidth(2);
    doc.rect(10, 10, width - 20, height - 20);

    // Inner subtle border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.8);
    doc.rect(14, 14, width - 28, height - 28);

    // Header Organization
    doc.setTextColor(148, 163, 184); // #94a3b8
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text((eventDetails?.organization || 'TECH INSTITUTION').toUpperCase(), width / 2, 32, { align: 'center' });

    // Category
    doc.setTextColor(56, 189, 248);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text((eventDetails?.category || 'CERTIFICATE OF EXCELLENCE').toUpperCase(), width / 2, 46, { align: 'center' });

    // Presentation text
    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(13);
    doc.text('This credential is awarded in recognition of achievement to', width / 2, 60, { align: 'center' });

    // Recipient Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(cert?.name || 'Recipient Name', width / 2, 78, { align: 'center' });

    // Underline accent
    doc.setDrawColor(56, 189, 248);
    doc.setLineWidth(1);
    doc.line((width / 2) - 50, 83, (width / 2) + 50, 83);

    // Description text
    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.text(
      `for distinguished participation as a ${cert?.role || 'Contributor'} in`,
      width / 2,
      96,
      { align: 'center' }
    );

    doc.setTextColor(56, 189, 248);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(eventDetails?.title || 'Global Tech Summit', width / 2, 108, { align: 'center' });

    // Certificate ID & Security stamp
    doc.setTextColor(148, 163, 184);
    doc.setFont('courier', 'normal');
    doc.setFontSize(10);
    doc.text(`ID: ${cert?.certificateId || 'CERT-VERIFIED'}`, width / 2, 126, { align: 'center' });

    // Footer Signatures & Date
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(0.5);
    doc.line(25, 160, 95, 160);
    doc.line(width - 95, 160, width - 25, 160);

    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(eventDetails?.date || '2026-10-22', 60, 166, { align: 'center' });
    doc.text(eventDetails?.signatory || 'Authorized Officer', width - 60, 166, { align: 'center' });

    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('DATE OF ISSUANCE', 60, 172, { align: 'center' });
    doc.text('AUTHORIZED SIGNATORY', width - 60, 172, { align: 'center' });

  } else if (templateId === 'minimal-executive') {
    // Minimalist Indigo theme
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, 'F');

    // Outer border
    doc.setDrawColor(79, 70, 229); // #4f46e5
    doc.setLineWidth(1.8);
    doc.rect(12, 12, width - 24, height - 24);

    // Organization
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text((eventDetails?.organization || 'PROFESSIONAL ACADEMY').toUpperCase(), width / 2, 34, { align: 'center' });

    // Category
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text((eventDetails?.category || 'CERTIFICATE OF COMPLETION').toUpperCase(), width / 2, 48, { align: 'center' });

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('PROUDLY PRESENTED TO', width / 2, 63, { align: 'center' });

    // Recipient Name
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(cert?.name || 'Recipient Name', width / 2, 80, { align: 'center' });

    // Underline
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.8);
    doc.line((width / 2) - 60, 85, (width / 2) + 60, 85);

    // Event & Details
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.text(
      `for successfully completing all requirements as ${cert?.role || 'Participant'} during`,
      width / 2,
      98,
      { align: 'center' }
    );

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(eventDetails?.title || 'Certification Program', width / 2, 109, { align: 'center' });

    // Badge / Grade
    if (cert?.grade) {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`Evaluation Grade: ${cert.grade}`, width / 2, 120, { align: 'center' });
    }

    doc.setTextColor(148, 163, 184);
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.text(`Credential ID: ${cert?.certificateId || 'CERT-ID'}`, width / 2, 132, { align: 'center' });

    // Footer
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(30, 164, 90, 164);
    doc.line(width - 90, 164, width - 30, 164);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(eventDetails?.date || '2026-10-22', 60, 170, { align: 'center' });
    doc.text(eventDetails?.signatory || 'Director of Program', width - 60, 170, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('ISSUE DATE', 60, 175, { align: 'center' });
    doc.text('AUTHORIZED SIGNATORY', width - 60, 175, { align: 'center' });

  } else {
    // Classic Royal Gold theme
    doc.setFillColor(254, 252, 246); // Parchment warm tone
    doc.rect(0, 0, width, height, 'F');

    // Ornate Golden Borders
    doc.setDrawColor(180, 140, 45); // Warm gold
    doc.setLineWidth(2.5);
    doc.rect(10, 10, width - 20, height - 20);

    doc.setDrawColor(218, 185, 100);
    doc.setLineWidth(0.8);
    doc.rect(13, 13, width - 26, height - 26);

    // Organization Header
    doc.setTextColor(120, 90, 25);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text((eventDetails?.organization || 'ACADEMIC CONSORTIUM').toUpperCase(), width / 2, 32, { align: 'center' });

    // Certificate Title
    doc.setTextColor(40, 30, 15);
    doc.setFont('times', 'bold');
    doc.setFontSize(26);
    doc.text((eventDetails?.category || 'CERTIFICATE OF ACHIEVEMENT').toUpperCase(), width / 2, 48, { align: 'center' });

    doc.setTextColor(100, 85, 60);
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    doc.text('This certificate is proudly conferred upon', width / 2, 62, { align: 'center' });

    // Recipient Name
    doc.setTextColor(30, 20, 10);
    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.text(cert?.name || 'Recipient Name', width / 2, 80, { align: 'center' });

    // Golden underline ornament
    doc.setDrawColor(180, 140, 45);
    doc.setLineWidth(1.2);
    doc.line((width / 2) - 55, 85, (width / 2) + 55, 85);

    // Event & Reason
    doc.setTextColor(60, 50, 40);
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.text(
      `in recognition of exceptional contribution and participation as ${cert?.role || 'Attendee'} at`,
      width / 2,
      98,
      { align: 'center' }
    );

    doc.setTextColor(140, 95, 20);
    doc.setFont('times', 'bold');
    doc.setFontSize(17);
    doc.text(eventDetails?.title || 'Global Symposium', width / 2, 110, { align: 'center' });

    // Cert ID
    doc.setTextColor(130, 115, 95);
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.text(`Official Certificate Identifier: ${cert?.certificateId || 'CERT-ROYAL-001'}`, width / 2, 125, { align: 'center' });

    // Signatures & Issuance Footer
    doc.setDrawColor(180, 140, 45);
    doc.setLineWidth(0.6);
    doc.line(30, 165, 90, 165);
    doc.line(width - 90, 165, width - 30, 165);

    doc.setTextColor(40, 30, 15);
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.text(eventDetails?.date || '2026-10-22', 60, 171, { align: 'center' });
    doc.text(eventDetails?.signatory || 'Dean & Authorized Signatory', width - 60, 171, { align: 'center' });

    doc.setTextColor(120, 100, 75);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text('DATE OF ISSUANCE', 60, 177, { align: 'center' });
    doc.text('AUTHORIZED SIGNATORY', width - 60, 177, { align: 'center' });
  }

  return doc;
};
