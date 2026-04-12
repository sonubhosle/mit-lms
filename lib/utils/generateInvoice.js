import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { format } from 'date-fns';

/**
 * Generates a professional PDF invoice for a library transaction.
 * @param {Object} transaction - The fully-populated transaction object.
 */
export async function generateInvoice(transaction) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';  // A4 width at 96dpi
  container.style.background = '#ffffff';
  container.style.fontFamily = "'Helvetica Neue', Arial, sans-serif";
  container.style.fontSize = '13px';
  container.style.color = '#1a1a2e';

  const fineAmount  = transaction.fineAmount || 0;
  const isLost      = transaction.status === 'lost';
  const bookPrice   = transaction.bookId?.price || 0;

  // fineAmount for lost = bookPrice + latePenalty (already combined in DB)
  // So grandTotal = fineAmount, never double-count
  const grandTotal    = fineAmount;
  const isPaid        = transaction.finePaid || grandTotal === 0;
  const paymentStatus = isPaid ? 'PAID' : 'UNPAID';

  // For lost books, try to show breakdown: late penalty = fineAmount - bookPrice
  const latePenalty = isLost ? Math.max(0, fineAmount - bookPrice) : fineAmount;

  const statusColor = isPaid ? '#16a34a' : '#dc2626';
  const txStatus    = (transaction.status || '').toUpperCase();
  const txStatusBg  = transaction.status === 'returned' ? '#dcfce7' :
                      transaction.status === 'lost'     ? '#fee2e2' : '#fef9c3';
  const txStatusFg  = transaction.status === 'returned' ? '#166534' :
                      transaction.status === 'lost'     ? '#991b1b' : '#854d0e';

  container.innerHTML = `
    <div style="padding: 48px 52px; background:#fff; position:relative; min-height:1100px;">

      <!-- Watermark -->
      <div style="
        position:absolute; top:50%; left:50%;
        transform:translate(-50%,-50%) rotate(-35deg);
        font-size:130px; font-weight:900; letter-spacing:6px;
        color:${isPaid ? 'rgba(22,163,74,0.04)' : 'rgba(220,38,38,0.04)'};
        pointer-events:none; white-space:nowrap; z-index:0;
      ">${paymentStatus}</div>

      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:24px; border-bottom:2px solid #0f172a; margin-bottom:32px;">
        <div>
          <div style="font-size:26px; font-weight:800; color:#0f172a; letter-spacing:-0.5px;">
            MIT <span style="color:#f59e0b;">LIBRARY</span>
          </div>
          <div style="font-size:12px; color:#64748b; margin-top:4px; font-weight:400;">Maharashtra Institute of Technology</div>
          <div style="font-size:11px; color:#94a3b8; margin-top:2px;">Dharampeth, Nagpur &nbsp;|&nbsp; +91 98765 43210</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:20px; font-weight:700; color:#0f172a; text-transform:uppercase; letter-spacing:1px;">Official Receipt</div>
          <div style="font-size:12px; color:#f59e0b; font-weight:700; margin-top:6px;">${transaction.transactionId}</div>
          <div style="font-size:11px; color:#94a3b8; margin-top:3px;">Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}</div>
          <div style="display:inline-block; margin-top:10px; padding:4px 14px; border-radius:4px; background:${txStatusBg}; color:${txStatusFg}; font-size:11px; font-weight:700; letter-spacing:1px;">${txStatus}</div>
        </div>
      </div>

      <!-- Member + Transaction Info: 2 columns -->
      <div style="display:flex; gap:32px; margin-bottom:32px;">

        <!-- Member Info -->
        <div style="flex:1.1; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px 24px;">
          <div style="font-size:10px; font-weight:700; color:#94a3b8; letter-spacing:2px; text-transform:uppercase; margin-bottom:14px;">Member Information</div>
          <div style="font-size:17px; font-weight:700; color:#0f172a; margin-bottom:12px;">${transaction.memberId?.name || 'N/A'}</div>
          <table style="width:100%; border-collapse:collapse; font-size:12px; color:#475569;">
            <tr><td style="padding:3px 0; color:#94a3b8; width:70px;">Member ID</td><td style="padding:3px 0; font-weight:600; color:#1e293b;">${transaction.memberId?.memberId || 'N/A'}</td></tr>
            <tr><td style="padding:3px 0; color:#94a3b8;">Course</td><td style="padding:3px 0; font-weight:600; color:#1e293b;">${transaction.memberId?.className || 'N/A'}</td></tr>
            <tr><td style="padding:3px 0; color:#94a3b8;">Email</td><td style="padding:3px 0; color:#1e293b;">${transaction.memberId?.email || 'N/A'}</td></tr>
            <tr><td style="padding:3px 0; color:#94a3b8;">Phone</td><td style="padding:3px 0; color:#1e293b;">${transaction.memberId?.phone || 'N/A'}</td></tr>
            <tr><td style="padding:3px 0; color:#94a3b8; vertical-align:top;">Address</td><td style="padding:3px 0; color:#1e293b; line-height:1.5;">${transaction.memberId?.address || '—'}</td></tr>
          </table>
        </div>

        <!-- Transaction Dates -->
        <div style="flex:0.9; display:flex; flex-direction:column; gap:12px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px 24px; flex:1;">
            <div style="font-size:10px; font-weight:700; color:#94a3b8; letter-spacing:2px; text-transform:uppercase; margin-bottom:14px;">Transaction Dates</div>
            <table style="width:100%; border-collapse:collapse; font-size:12px;">
              <tr>
                <td style="padding:4px 0; color:#94a3b8;">Issue Date</td>
                <td style="padding:4px 0; font-weight:600; color:#0f172a; text-align:right;">${transaction.issueDate ? format(new Date(transaction.issueDate), 'dd MMM yyyy') : '—'}</td>
              </tr>
              <tr>
                <td style="padding:4px 0; color:#94a3b8;">Due Date</td>
                <td style="padding:4px 0; font-weight:600; color:#0f172a; text-align:right;">${transaction.dueDate ? format(new Date(transaction.dueDate), 'dd MMM yyyy') : '—'}</td>
              </tr>
              ${transaction.returnDate ? `
              <tr>
                <td style="padding:4px 0; color:#16a34a;">Return Date</td>
                <td style="padding:4px 0; font-weight:600; color:#16a34a; text-align:right;">${format(new Date(transaction.returnDate), 'dd MMM yyyy')}</td>
              </tr>` : ''}
            </table>
          </div>
          ${transaction.daysLate > 0 ? `
          <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:14px 24px; text-align:center;">
            <div style="font-size:10px; font-weight:700; color:#c2410c; letter-spacing:2px; text-transform:uppercase;">Days Overdue</div>
            <div style="font-size:28px; font-weight:800; color:#ea580c; margin-top:4px;">${transaction.daysLate}</div>
            <div style="font-size:11px; color:#c2410c; margin-top:2px;">₹10 / day penalty</div>
          </div>` : ''}
        </div>
      </div>

      <!-- Items Table -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:28px; font-size:12.5px;">
        <thead>
          <tr style="background:#0f172a; color:#fff;">
            <th style="padding:12px 16px; text-align:left; font-weight:600; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; border-radius-top-left:6px;">Description</th>
            <th style="padding:12px 16px; text-align:center; font-weight:600; font-size:10px; letter-spacing:1.5px; text-transform:uppercase;">Qty</th>
            <th style="padding:12px 16px; text-align:right; font-weight:600; font-size:10px; letter-spacing:1.5px; text-transform:uppercase;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <!-- Book Row -->
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:16px;">
              <div style="font-weight:600; color:#0f172a;">Library Book — Borrowing Service</div>
              <div style="font-size:11px; color:#64748b; margin-top:3px;">${transaction.bookId?.title || 'N/A'} &nbsp;|&nbsp; ISBN: ${transaction.bookId?.isbn || 'N/A'}</div>
            </td>
            <td style="padding:16px; text-align:center; color:#475569;">1</td>
            <td style="padding:16px; text-align:right; color:#475569;">₹ 0.00</td>
          </tr>

          ${isLost ? `
          <!-- Lost: Book Replacement -->
          <tr style="border-bottom:1px solid #f1f5f9; background:#fef2f2;">
            <td style="padding:16px;">
              <div style="font-weight:600; color:#dc2626;">Book Replacement Cost</div>
              <div style="font-size:11px; color:#ef4444; margin-top:3px;">Full replacement value — book reported lost</div>
            </td>
            <td style="padding:16px; text-align:center; color:#dc2626;">1</td>
            <td style="padding:16px; text-align:right; font-weight:700; color:#dc2626;">₹ ${bookPrice.toFixed(2)}</td>
          </tr>
          ${latePenalty > 0 ? `
          <!-- Lost: additional late penalty on top of book price -->
          <tr style="border-bottom:1px solid #f1f5f9; background:#fff7ed;">
            <td style="padding:16px;">
              <div style="font-weight:600; color:#ea580c;">Late Return Penalty</div>
              <div style="font-size:11px; color:#f97316; margin-top:3px;">₹10/day × ${transaction.daysLate || Math.round(latePenalty / 10)} day(s)</div>
            </td>
            <td style="padding:16px; text-align:center; color:#ea580c;">—</td>
            <td style="padding:16px; text-align:right; font-weight:700; color:#ea580c;">₹ ${latePenalty.toFixed(2)}</td>
          </tr>` : ''}
          ` : fineAmount > 0 ? `
          <!-- Late Return Only -->
          <tr style="border-bottom:1px solid #f1f5f9; background:#fff7ed;">
            <td style="padding:16px;">
              <div style="font-weight:600; color:#ea580c;">Late Return Penalty</div>
              <div style="font-size:11px; color:#f97316; margin-top:3px;">₹10/day × ${transaction.daysLate || Math.round(fineAmount / 10)} day(s) overdue</div>
            </td>
            <td style="padding:16px; text-align:center; color:#ea580c;">—</td>
            <td style="padding:16px; text-align:right; font-weight:700; color:#ea580c;">₹ ${fineAmount.toFixed(2)}</td>
          </tr>` : ''}
        </tbody>
      </table>

      <!-- Bottom: Remarks (left) | Total (right) -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:48px;">

        <!-- Remarks -->
        <div style="width:48%; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:18px 20px;">
          <div style="font-size:10px; font-weight:700; color:#94a3b8; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px;">Librarian Remarks</div>
          <div style="font-size:12px; color:#475569; font-style:italic; line-height:1.7;">
            "${transaction.remarks || 'Transaction processed without specific remarks.'}"
          </div>
        </div>

        <!-- Totals -->
        <div style="width:44%;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            ${isLost ? `
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:8px 0; color:#64748b;">Book Value</td>
              <td style="padding:8px 0; text-align:right; color:#0f172a; font-weight:500;">₹ ${bookPrice.toFixed(2)}</td>
            </tr>
            ${latePenalty > 0 ? `
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:8px 0; color:#64748b;">Late Penalty</td>
              <td style="padding:8px 0; text-align:right; color:#0f172a; font-weight:500;">₹ ${latePenalty.toFixed(2)}</td>
            </tr>` : ''}
            ` : ''}
            <tr style="border-top:2px solid #0f172a; margin-top:8px;">
              <td style="padding:14px 0 4px 0; font-size:15px; font-weight:700; color:#0f172a; text-transform:uppercase; letter-spacing:0.5px;">Total Amount</td>
              <td style="padding:14px 0 4px 0; text-align:right; font-size:22px; font-weight:800; color:#f59e0b;">₹ ${grandTotal.toFixed(2)}</td>
            </tr>
          </table>
          <div style="text-align:right; margin-top:10px;">
            <span style="
              display:inline-block; padding:5px 16px; border-radius:4px;
              border:2px solid ${statusColor}; color:${statusColor};
              font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase;
            ">
              ${paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer: Authorised (left) | Stamp (right) -->
      <div style="border-top:1px solid #e2e8f0; padding-top:24px; display:flex; justify-content:space-between; align-items:flex-end;">
        <div>
          <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px;">Authorized Representative</div>
          <div style="font-size:14px; font-weight:600; color:#0f172a;">${transaction.issuedBy?.name || 'Library Staff'}</div>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">MIT Library, Nagpur</div>
        </div>
        <div style="text-align:right;">
          <div style="width:180px; border-top:1.5px solid #94a3b8; margin-left:auto; padding-top:8px; margin-bottom:4px;"></div>
          <div style="font-size:10px; color:#94a3b8; letter-spacing:1.5px; text-transform:uppercase;">Stamp / Signature</div>
          <div style="font-size:9px; color:#cbd5e1; margin-top:8px;">This is a computer-generated document.</div>
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
    const pdfWidth  = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`MIT_Receipt_${transaction.transactionId}.pdf`);
  } catch (error) {
    console.error('Invoice generation error:', error);
    throw error;
  } finally {
    if (container.parentNode) document.body.removeChild(container);
  }
}
