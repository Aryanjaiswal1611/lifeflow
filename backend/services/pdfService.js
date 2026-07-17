const PDFDocument = require('pdfkit');

const generateDonationCertificate = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      doc.rect(0, 0, pageWidth, pageHeight).fill('#fff');

      doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(3).stroke('#dc2626');

      doc.fontSize(36).font('Helvetica-Bold').fillColor('#dc2626')
        .text('LIFEFLOW', 0, 60, { align: 'center' });
      doc.fontSize(16).font('Helvetica').fillColor('#666')
        .text('Blood Donation Certificate', 0, 100, { align: 'center' });

      doc.moveTo(200, 130).lineTo(pageWidth - 200, 130).stroke('#dc2626');

      doc.fontSize(14).fillColor('#333')
        .text('This is to certify that', 0, 160, { align: 'center' });

      doc.fontSize(28).font('Helvetica-Bold').fillColor('#dc2626')
        .text(data.donorName, 0, 190, { align: 'center' });

      doc.fontSize(14).font('Helvetica').fillColor('#333')
        .text('has voluntarily donated blood and contributed to saving lives.', 0, 230, { align: 'center' });

      doc.fontSize(12).fillColor('#555')
        .text(`Blood Group: ${data.bloodGroup}`, 100, 290)
        .text(`Units Donated: ${data.units}`, 100, 310)
        .text(`Date: ${new Date(data.date).toLocaleDateString()}`, 100, 330)
        .text(`Hospital: ${data.hospitalName}`, 100, 350);

      doc.fontSize(10).fillColor('#999')
        .text(`Certificate ID: ${data.certificateId}`, 0, 420, { align: 'center' });

      doc.fontSize(10).fillColor('#aaa')
        .text('Thank you for your generous contribution to humanity.', 0, 450, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateDonationCertificate };
