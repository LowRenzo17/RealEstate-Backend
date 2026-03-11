import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class ReceiptService {
  constructor() {
    this.receiptDir = path.join(process.cwd(), 'uploads/receipts');
    if (!fs.existsSync(this.receiptDir)) {
      fs.mkdirSync(this.receiptDir, { recursive: true });
    }
  }

  async generateReceipt(payment, tenant, unit) {
    const fileName = `receipt_${payment._id}.pdf`;
    const filePath = path.join(this.receiptDir, fileName);
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(filePath));

    // Receipt Header
    doc.fontSize(20).text('RENTAL PAYMENT RECEIPT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`);
    doc.text(`Receipt No: ${payment._id}`);
    doc.moveDown();

    // Tenant Details
    doc.fontSize(14).text('Tenant Details:', { underline: true });
    doc.fontSize(12).text(`Name: ${tenant.name}`);
    doc.text(`Email: ${tenant.email}`);
    doc.text(`Unit Number: ${unit.unitNumber}`);
    doc.moveDown();

    // Payment Details
    doc.fontSize(14).text('Payment Details:', { underline: true });
    doc.fontSize(12).text(`Amount Paid: KES ${payment.amount.toLocaleString()}`);
    doc.text(`Payment Method: ${payment.paymentMethod.toUpperCase()}`);
    
    if (payment.mpesaReceipt) {
      doc.text(`M-Pesa Receipt: ${payment.mpesaReceipt}`);
    }
    if (payment.transactionId) {
      doc.text(`Transaction ID: ${payment.transactionId}`);
    }
    
    doc.text(`Status: ${payment.status.toUpperCase()}`);
    doc.moveDown();

    // Footer
    doc.fontSize(10).text('Thank you for your payment!', { align: 'center' });
    doc.end();

    return { fileName, filePath };
  }
}

export default new ReceiptService();
