import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

/**
 * Generates a branded PDF invoice for a transaction.
 * @param {Object} transaction - The transaction object with populated bookId, memberId, and issuedBy.
 */
export async function generateInvoice(transaction) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.padding = '40px';
  container.style.background = '#ffffff';
  container.style.color = '#0F172A';
  container.style.fontFamily = "'Inter', sans-serif";

  const totalFine = transaction.fineAmount || 0;
  const isLost = transaction.status === 'lost';
  const bookPrice = transaction.bookId?.price || 0;
  const grandTotal = isLost ? (bookPrice + totalFine) : totalFine;

  container.innerHTML = `
    <div style="border: 2px solid #0F172A; padding: 30px; border-radius: 8px;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F59E0B; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <h1 style="margin: 0; color: #0F172A; font-size: 32px; font-weight: 800; letter-spacing: -0.02em;">MIT <span style="color: #F59E0B;">COLLEGE</span></h1>
          <p style="margin: 5px 0 0 0; color: #64748B; font-size: 14px; font-weight: 500;">Dharampeth, Nagpur, Maharashtra 440010</p>
          <p style="margin: 2px 0 0 0; color: #64748B; font-size: 14px;">Contact: +91 98765 43210 | library@mitcollege.edu</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; color: #0F172A; font-size: 24px; text-transform: uppercase; letter-spacing: 0.1em;">Invoice</h2>
          <p style="margin: 5px 0 0 0; font-weight: 700;"># ${transaction.transactionId}</p>
          <p style="margin: 2px 0 0 0; color: #64748B;">Date: ${format(new Date(), 'dd MMM yyyy')}</p>
        </div>
      </div>

      <!-- Content -->
      <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <!-- Member Details -->
        <div>
          <h3 style="text-transform: uppercase; font-size: 12px; color: #F59E0B; margin-bottom: 10px; letter-spacing: 0.1em;">Issued To</h3>
          <p style="margin: 0; font-size: 18px; font-weight: 700;">${transaction.memberId?.name}</p>
          <p style="margin: 5px 0 0 0; color: #475569;">ID: ${transaction.memberId?.memberId}</p>
          <p style="margin: 2px 0 0 0; color: #475569;">Class: ${transaction.memberId?.className}</p>
          <p style="margin: 2px 0 0 0; color: #475569;">Email: ${transaction.memberId?.email}</p>
          <p style="margin: 2px 0 0 0; color: #475569;">Address: ${transaction.memberId?.address || 'N/A'}</p>
        </div>
        
        <!-- Transaction Status -->
        <div style="text-align: right;">
          <h3 style="text-transform: uppercase; font-size: 12px; color: #F59E0B; margin-bottom: 10px; letter-spacing: 0.1em;">Transaction Info</h3>
          <p style="margin: 0; font-size: 16px; font-weight: 700; color: ${transaction.status === 'issued' ? '#F59E0B' : transaction.status === 'returned' ? '#10B981' : '#EF4444'}; text-transform: uppercase;">
            Status: ${transaction.status}
          </p>
          <p style="margin: 5px 0 0 0; color: #475569;">Issue Date: ${format(new Date(transaction.issueDate), 'dd MMM yyyy')}</p>
          <p style="margin: 2px 0 0 0; color: #475569;">Due Date: ${format(new Date(transaction.dueDate), 'dd MMM yyyy')}</p>
          ${transaction.returnDate ? `<p style="margin: 2px 0 0 0; color: #475569;">Return Date: ${format(new Date(transaction.returnDate), 'dd MMM yyyy')}</p>` : ''}
        </div>
      </div>

      <!-- Item Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <thead>
          <tr style="background: #0F172A; color: #ffffff;">
            <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase;">Description</th>
            <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase;">Status</th>
            <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #E2E8F0;">
            <td style="padding: 15px 12px;">
              <p style="margin: 0; font-weight: 700;">Book: ${transaction.bookId?.title}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748B;">ISBN: ${transaction.bookId?.isbn}</p>
            </td>
            <td style="padding: 15px 12px; text-align: center;">Standard Issue</td>
            <td style="padding: 15px 12px; text-align: right;">-</td>
          </tr>
          ${totalFine > 0 ? `
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 15px 12px;">Late Return Penalty</td>
              <td style="padding: 15px 12px; text-align: center;">Overdue</td>
              <td style="padding: 15px 12px; text-align: right;">₹ ${totalFine}</td>
            </tr>
          ` : ''}
          ${isLost ? `
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 15px 12px;">
                <p style="margin: 0;">Lost Book Compensation</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #EF4444;">Reason: ${transaction.remarks || 'No remarks provided'}</p>
              </td>
              <td style="padding: 15px 12px; text-align: center;">Lost</td>
              <td style="padding: 15px 12px; text-align: right;">₹ ${bookPrice}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>

      <!-- Summary -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 60px;">
        <div style="width: 250px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E2E8F0;">
            <span style="color: #64748B;">Fines & Penalties</span>
            <span style="font-weight: 700;">₹ ${totalFine}</span>
          </div>
          ${isLost ? `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E2E8F0;">
              <span style="color: #64748B;">Book Replacement</span>
              <span style="font-weight: 700;">₹ ${bookPrice}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding: 20px 0; color: #0F172A;">
            <span style="font-size: 18px; font-weight: 800; text-transform: uppercase;">Total Payable</span>
            <span style="font-size: 20px; font-weight: 800;">₹ ${grandTotal}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <p style="margin: 0; color: #0F172A; font-weight: 700;">Issued By:</p>
          <p style="margin: 5px 0 0 0; color: #64748B;">${transaction.issuedBy?.name || 'Authorized Librarian'}</p>
        </div>
        <div style="text-align: center; border-top: 1px solid #0F172A; width: 200px; padding-top: 10px;">
          <p style="margin: 0; font-size: 12px; color: #0F172A; font-weight: 700; text-transform: uppercase;">Authorized Signature</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`MIT_Invoice_${transaction.transactionId}.pdf`);
  } catch (error) {
    console.error('Invoice Generation Error:', error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}
