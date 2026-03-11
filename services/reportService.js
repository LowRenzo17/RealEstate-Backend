import { Parser } from '@json2csv/plainjs';
import path from 'path';
import fs from 'fs';

class ReportService {
  constructor() {
    this.reportDir = path.join(process.cwd(), 'uploads/reports');
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async generateFinancialReport(payments, organizationId) {
    const fields = [
      { label: 'Payment ID', value: '_id' },
      { label: 'Tenant Name', value: (row) => row.tenantId?.name || 'N/A' },
      { label: 'Amount (KES)', value: 'amount' },
      { label: 'Date', value: (row) => new Date(row.paymentDate).toLocaleDateString() },
      { label: 'Method', value: (row) => row.paymentMethod.toUpperCase() },
      { label: 'Status', value: (row) => row.status.toUpperCase() },
      { label: 'M-Pesa Receipt', value: (row) => row.mpesaReceipt || 'N/A' }
    ];

    try {
      const parser = new Parser({ fields });
      const csv = parser.parse(payments);

      const fileName = `financial_report_${organizationId}_${Date.now()}.csv`;
      const filePath = path.join(this.reportDir, fileName);
      
      await fs.promises.writeFile(filePath, csv);

      return { fileName, filePath };
    } catch (err) {
      console.error('CSV Generation Error:', err);
      throw new Error('Failed to generate CSV report');
    }
  }
}

export default new ReportService();
