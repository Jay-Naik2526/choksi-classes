const PDFDocument = require('pdfkit');

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const generateFeeInvoice = (fee, student) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const TC = '#C1440E';
        const DARK = '#2C1810';

        // Header bar
        doc.rect(0, 0, 595, 80).fill(DARK);
        doc.fillColor('#F5F0E8').fontSize(26).font('Helvetica-Bold')
            .text('Choksi Classes', 50, 22);
        doc.fillColor('#C1440E').fontSize(10).font('Helvetica')
            .text('Navsari, Gujarat, India', 50, 55);
        doc.fillColor('#E8A020').fontSize(10)
            .text('choksiclasses@gmail.com', 400, 42, { align: 'right', width: 145 });

        // Invoice badge
        doc.rect(400, 90, 145, 45).fill(TC);
        doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold')
            .text('INVOICE', 400, 100, { align: 'center', width: 145 });

        // Invoice meta
        doc.fillColor(DARK).fontSize(10).font('Helvetica')
            .text(`Invoice No: INV-${fee._id.toString().slice(-6).toUpperCase()}`, 50, 100)
            .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 50, 118)
            .text(`Period: ${MONTHS[fee.month - 1]} ${fee.year}`, 50, 136);

        // Divider
        doc.rect(50, 155, 495, 1.5).fill(TC);

        // Student info
        doc.fillColor(TC).fontSize(11).font('Helvetica-Bold').text('BILL TO', 50, 170);
        doc.fillColor(DARK).fontSize(10).font('Helvetica')
            .text(student.name, 50, 188)
            .text(student.email, 50, 204)
            .text(student.phone || '', 50, 220)
            .text(student.rollNumber ? `Roll No: ${student.rollNumber}` : '', 50, 236);

        // Table header
        doc.rect(50, 265, 495, 28).fill('#F5F0E8');
        doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold')
            .text('DESCRIPTION', 60, 274)
            .text('PERIOD', 250, 274)
            .text('AMOUNT', 430, 274);

        // Table row
        doc.rect(50, 293, 495, 1).fill('#e0d8ce');
        doc.fillColor(DARK).fontSize(10).font('Helvetica')
            .text('Tuition Fee', 60, 310)
            .text(`${MONTHS[fee.month - 1]} ${fee.year}`, 250, 310)
            .text(`₹ ${fee.amount.toLocaleString('en-IN')}`, 430, 310);

        // Total box
        doc.rect(350, 350, 195, 40).fill(DARK);
        doc.fillColor('#F5F0E8').fontSize(12).font('Helvetica-Bold')
            .text('TOTAL', 365, 362)
            .text(`₹ ${fee.amount.toLocaleString('en-IN')}`, 460, 362);

        // Status badge
        const statusColor = fee.status === 'paid' ? '#16a34a' : '#C1440E';
        doc.rect(50, 355, 80, 30).fill(statusColor);
        doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold')
            .text(fee.status.toUpperCase(), 50, 363, { align: 'center', width: 80 });

        if (fee.status === 'paid' && fee.paidAt) {
            doc.fillColor('#16a34a').fontSize(9).font('Helvetica')
                .text(`Paid on: ${new Date(fee.paidAt).toLocaleDateString('en-IN')}`, 140, 365);
        }

        if (fee.notes) {
            doc.fillColor(DARK).fontSize(9).font('Helvetica-Oblique')
                .text(`Note: ${fee.notes}`, 50, 410);
        }

        // Footer
        doc.rect(0, 750, 595, 92).fill('#F5F0E8');
        doc.rect(0, 750, 595, 2).fill(TC);
        doc.fillColor(DARK).fontSize(8).font('Helvetica')
            .text('Thank you for your trust in Choksi Classes. This is a computer-generated invoice.', 50, 768, { align: 'center', width: 495 })
            .text('For queries, contact: choksiclasses@gmail.com', 50, 784, { align: 'center', width: 495 });

        doc.end();
    });
};

module.exports = { generateFeeInvoice };
