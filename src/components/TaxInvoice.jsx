'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, Download, X, FileText, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './TaxInvoice.css';

/**
 * Converts a numeric amount to Indian Currency Words
 * Example: 190 -> "One Hundred Ninety"
 */
function numberToWords(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Zero';
  num = Math.round(Number(num));
  if (num === 0) return 'Zero';

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertSection(n) {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10] + ' ';
    return a[Math.floor(n / 100)] + ' Hundred ' + convertSection(n % 100);
  }

  let words = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore > 0) words += convertSection(crore).trim() + ' Crore ';
  if (lakh > 0) words += convertSection(lakh).trim() + ' Lakh ';
  if (thousand > 0) words += convertSection(thousand).trim() + ' Thousand ';
  if (num > 0) words += convertSection(num).trim() + ' ';

  return words.trim();
}

/**
 * Returns appropriate HSN Code based on product name/category
 */
function getHsnCode(name = '', category = '') {
  const lower = (name + ' ' + category).toLowerCase();
  if (lower.includes('coconut') || lower.includes('thellingey')) return '1513';
  if (lower.includes('groundnut') || lower.includes('kadala')) return '1508';
  if (lower.includes('gingelly') || lower.includes('sesame') || lower.includes('nallennai')) return '1515';
  if (lower.includes('turmeric') || lower.includes('manjal')) return '0910';
  if (lower.includes('chilli') || lower.includes('milagai')) return '0904';
  if (lower.includes('coriander') || lower.includes('dhaniya')) return '0909';
  if (lower.includes('masala') || lower.includes('sambar') || lower.includes('powder')) return '2103';
  if (lower.includes('honey') || lower.includes('then')) return '0409';
  if (lower.includes('ghee') || lower.includes('nei')) return '0405';
  if (lower.includes('jaggery') || lower.includes('nattuchakkarai')) return '1701';
  return '1513'; // Standard food/agricultural code fallback
}

/**
 * Formats a Date object to DD/MM/YYYY
 */
function formatDate(d) {
  if (!d) d = new Date();
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return new Date().toLocaleDateString('en-GB');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function TaxInvoice({ order, isOpen, onClose }) {
  const invoiceRef = useRef(null);
  const printSheetRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Freeze background page scroll completely while invoice modal is open
  useEffect(() => {
    if (!isOpen) return;
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !order || !mounted) return null;

  const invoiceNo = (order.orderId || order._id || 'VEN').toString().slice(-8).toUpperCase();
  const invoiceDate = formatDate(order.createdAt || order.date);
  const challanNo = `CH-${invoiceNo}`;
  const challanDate = invoiceDate;

  const buyerName = order.customerName || order.customer?.name || order.shippingAddress?.fullName || 'Valued Patron';
  const buyerPhone = order.phone || order.customer?.phone || order.shippingAddress?.phone || 'Not Provided';
  
  const addressObj = order.deliveryAddress || order.shippingAddress || order.address || {};
  const buyerAddress = [
    addressObj.address || addressObj.street,
    addressObj.locality,
    addressObj.city,
    addressObj.state || 'Tamil Nadu',
    addressObj.zipCode ? `- ${addressObj.zipCode}` : ''
  ].filter(Boolean).join(', ') || 'Address on file';

  const paymentMethod = order.paymentMethod || 'Cash on Delivery';
  const isPaid = paymentMethod.toLowerCase().includes('razorpay') || 
                 paymentMethod.toLowerCase().includes('online') || 
                 paymentMethod.toLowerCase().includes('paid') ||
                 order.paymentStatus === 'Paid';

  const rawItems = order.items || order.orderItems || [];
  
  // Calculate line items with 5% GST (2.5% CGST + 2.5% SGST)
  const gstRate = 0.05;
  const cgstRate = 0.025;
  const sgstRate = 0.025;

  let totalTaxableValue = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalLineItemsGross = 0;

  const processedItems = rawItems.map((item, idx) => {
    const qty = Number(item.quantity) || 1;
    const itemTotal = (Number(item.price) || 0) * qty;
    
    // Reverse calculation from gross to taxable
    const taxableValue = itemTotal / (1 + gstRate);
    const cgst = taxableValue * cgstRate;
    const sgst = taxableValue * sgstRate;

    totalTaxableValue += taxableValue;
    totalCgst += cgst;
    totalSgst += sgst;
    totalLineItemsGross += itemTotal;

    const variantLabel = item.variant?.label || item.variant || item.selectedWeight || '';
    const hsn = item.hsn || getHsnCode(item.name, item.category);

    return {
      sNo: idx + 1,
      name: item.name || 'Organic Farm Harvest',
      variant: variantLabel,
      hsn,
      qty,
      rate: Number(item.price) || 0,
      taxableValue,
      cgst,
      sgst,
      total: itemTotal
    };
  });

  const grandTotal = Number(order.totalAmount || order.amount || totalLineItemsGross);
  const totalTax = totalCgst + totalSgst;
  const amountInWords = numberToWords(grandTotal);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const targetElement = printSheetRef.current || invoiceRef.current;
    if (!targetElement) return;
    try {
      setIsDownloading(true);
      
      // Temporarily ensure pristine high-res A4 render
      const originalDisplay = targetElement.style.display;
      targetElement.style.display = 'block';
      
      const canvas = await html2canvas(targetElement, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      targetElement.style.display = originalDisplay;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Tax_Invoice_${invoiceNo}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Failed to download PDF. Please try the Print option instead.');
    } finally {
      setIsDownloading(false);
    }
  };

  return createPortal(
    <div className="tax-invoice-modal-overlay" onClick={onClose}>
      <div className="tax-invoice-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Sticky Action Toolbar (Screen Only) */}
        <div className="invoice-action-toolbar no-print">
          <div className="invoice-toolbar-top-row">
            <div className="invoice-toolbar-title">
              <FileText size={18} color="#064e3b" />
              <span className="toolbar-title-text">Official Tax Invoice</span>
              <span className="invoice-pill-badge">#VEN-{invoiceNo}</span>
            </div>
            
            <button 
              type="button" 
              className="btn-invoice-close" 
              onClick={onClose} 
              aria-label="Close invoice"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          <div className="invoice-toolbar-actions">
            <button 
              type="button" 
              className="btn-invoice-action primary" 
              onClick={handleDownloadPdf} 
              disabled={isDownloading}
            >
              {isDownloading ? <Loader2 size={14} className="invoice-spin-icon" /> : <Download size={14} />}
              <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>

            <button 
              type="button" 
              className="btn-invoice-action secondary" 
              onClick={handlePrint}
            >
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* ── Visual Invoice Sheet (100% Native Width on Mobile, No Horizontal Scroll) ── */}
        <div className="tax-invoice-sheet" ref={invoiceRef}>
        
          {/* Top GST Banner Header */}
          <div className="tax-invoice-top-banner">
            <div className="banner-title">TAX INVOICE</div>
            <div className="banner-sub">[ Original for Recipient &bull; Bill of Supply under Section 31 of CGST Act, 2017 ]</div>
          </div>

          {/* Company Brand & Address Header */}
          <div className="tax-invoice-header-row">
            <div className="company-logo-block">
              <div className="logo-circle-frame">
                <img 
                  src="/logo.png" 
                  alt="Venthulir Logo" 
                  className="invoice-logo-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="company-crest-text">VENTHULIR</div>
            </div>

            <div className="company-info-block">
              <h1 className="company-brand-name">
                <span className="brand-primary">VENTHULIR</span>{' '}
                <span className="brand-accent">ORGANIC HARVEST</span>
              </h1>
              <div className="company-tagline">100% Pure Heritage Masala Powders &amp; Wood Cold-Pressed Oils</div>
              <div className="company-address-text">
                <strong>Registered Office:</strong> IInd Floor, OM Shiva Towers, 259-B, Advaitha Ashram Rd, Fairlands, Salem, Tamil Nadu - 636004<br />
                <strong>GSTIN:</strong> 33AAFTO2026V1Z8 &nbsp;|&nbsp; <strong>State:</strong> Tamil Nadu (33) &nbsp;|&nbsp; <strong>FSSAI:</strong> 12423018000421<br />
                <strong>Phone:</strong> +91 8778476414 &nbsp;|&nbsp; <strong>Email:</strong> theventhulir@gmail.com
              </div>
            </div>
          </div>

          {/* Structured Meta Details Grid */}
          <table className="tax-grid-table">
            <tbody>
              {/* Row 1: Invoice & Dispatch Metadata */}
              <tr className="meta-row-1">
                <td className="grid-cell">
                  <span className="cell-label">INVOICE NUMBER</span>
                  <div className="cell-value font-mono">VEN-{invoiceNo}</div>
                </td>
                <td className="grid-cell">
                  <span className="cell-label">INVOICE DATE</span>
                  <div className="cell-value">{invoiceDate}</div>
                </td>
                <td className="grid-cell desktop-cell">
                  <span className="cell-label">CHALLAN / ORDER ID</span>
                  <div className="cell-value font-mono">{challanNo}</div>
                </td>
                <td className="grid-cell desktop-cell">
                  <span className="cell-label">PLACE OF SUPPLY</span>
                  <div className="cell-value">Tamil Nadu (33)</div>
                </td>
              </tr>

              {/* Row 2: Customer / Buyer & Payment */}
              <tr className="meta-row-2">
                <td className="grid-cell" colSpan={2}>
                  <span className="cell-label">BILLED TO / CUSTOMER NAME</span>
                  <div className="cell-value buyer-name">{buyerName}</div>
                </td>
                <td className="grid-cell desktop-cell">
                  <span className="cell-label">DELIVERY MODE</span>
                  <div className="cell-value">Express Delivery</div>
                </td>
                <td className="grid-cell">
                  <span className="cell-label">PAYMENT STATUS</span>
                  <div className={`cell-value invoice-payment-badge ${isPaid ? 'paid' : 'cod'}`}>
                    {isPaid ? '✔ Paid Online' : 'Cash on Delivery'}
                  </div>
                </td>
              </tr>

              {/* Row 3: Address & Phone */}
              <tr className="meta-row-3">
                <td className="grid-cell address-cell" colSpan={2}>
                  <span className="cell-label">DELIVERY ADDRESS</span>
                  <div className="cell-value-text">{buyerAddress}</div>
                </td>
                <td className="grid-cell" colSpan={2}>
                  <span className="cell-label">CUSTOMER PHONE</span>
                  <div className="cell-value font-mono">{buyerPhone}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Main Desktop Items Table (Full 9-Column) */}
          <table className="tax-items-table tax-items-desktop-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>S.NO</th>
                <th style={{ textAlign: 'left' }}>PRODUCT DESCRIPTION</th>
                <th style={{ width: '70px', textAlign: 'center' }}>HSN/SAC</th>
                <th style={{ width: '45px', textAlign: 'center' }}>QTY</th>
                <th style={{ width: '80px', textAlign: 'right' }}>RATE (₹)</th>
                <th style={{ width: '90px', textAlign: 'right' }}>TAXABLE VALUE</th>
                <th style={{ width: '65px', textAlign: 'right' }}>CGST 2.5%</th>
                <th style={{ width: '65px', textAlign: 'right' }}>SGST 2.5%</th>
                <th style={{ width: '85px', textAlign: 'right' }}>TOTAL (₹)</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map((item) => (
                <tr key={item.sNo}>
                  <td className="text-center font-mono">{item.sNo}</td>
                  <td className="item-name-cell">
                    <span className="item-title">{item.name}</span>
                    {item.variant && <span className="item-variant"> ({item.variant})</span>}
                  </td>
                  <td className="text-center tabular-num">{item.hsn}</td>
                  <td className="text-center tabular-num font-bold">{item.qty}</td>
                  <td className="text-right tabular-num">{item.rate.toFixed(2)}</td>
                  <td className="text-right tabular-num">{item.taxableValue.toFixed(2)}</td>
                  <td className="text-right tabular-num">{item.cgst.toFixed(2)}</td>
                  <td className="text-right tabular-num">{item.sgst.toFixed(2)}</td>
                  <td className="text-right tabular-num font-bold">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="tr-subtotal-row">
                <td colSpan={5} className="text-right font-bold subtotal-label">SUBTOTAL</td>
                <td className="text-right font-bold tabular-num">₹{totalTaxableValue.toFixed(2)}</td>
                <td className="text-right font-bold tabular-num">₹{totalCgst.toFixed(2)}</td>
                <td className="text-right font-bold tabular-num">₹{totalSgst.toFixed(2)}</td>
                <td className="text-right font-bold tabular-num total-highlight">₹{totalLineItemsGross.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Mobile Items Table (Clean 100% Width Fit for Phones) */}
          <div className="tax-items-mobile-view">
            <div className="mobile-items-header">
              <span>ITEMS ORDERED</span>
              <span>TOTAL (₹)</span>
            </div>
            {processedItems.map((item) => (
              <div key={item.sNo} className="mobile-item-card">
                <div className="mobile-item-main">
                  <div className="mobile-item-name">
                    <strong>{item.name}</strong>
                    {item.variant && <span className="mobile-item-variant"> ({item.variant})</span>}
                  </div>
                  <div className="mobile-item-meta">
                    <span>HSN: {item.hsn}</span>
                    <span>&bull;</span>
                    <span>Qty: <strong>{item.qty}</strong></span>
                    <span>&bull;</span>
                    <span>Rate: ₹{item.rate.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mobile-item-price font-bold">
                  ₹{item.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Summary Grid */}
          <div className="tax-bottom-summary-grid">
            
            {/* Left Column: Words & Legal Declaration */}
            <div className="summary-left-column">
              <div className="amount-in-words-box">
                <span className="words-label">AMOUNT IN WORDS</span>
                <div className="words-content">
                  <span className="words-currency-prefix">Indian Rupees</span>
                  <span className="words-amount-value">{amountInWords} Only</span>
                </div>
              </div>

              <div className="invoice-terms-box">
                <span className="terms-label">DECLARATION &amp; TERMS:</span>
                <ul className="terms-list">
                  <li>Certified 100% natural heritage organic harvest &amp; traditional wood cold-pressed extraction.</li>
                  <li>We declare that this invoice shows the actual price of goods and all particulars are true and correct.</li>
                  <li>This is a computer-generated authentic tax invoice issued under GST Rules.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Breakdown & Signature */}
            <div className="summary-right-column">
              <div className="tax-totals-breakdown-box">
                <div className="total-line-row">
                  <span>Taxable Value:</span>
                  <span>₹{totalTaxableValue.toFixed(2)}</span>
                </div>
                <div className="total-line-row">
                  <span>CGST (2.5%):</span>
                  <span>₹{totalCgst.toFixed(2)}</span>
                </div>
                <div className="total-line-row">
                  <span>SGST (2.5%):</span>
                  <span>₹{totalSgst.toFixed(2)}</span>
                </div>
                <div className="total-line-row gst-combined">
                  <span>Total Tax (GST 5%):</span>
                  <span>₹{totalTax.toFixed(2)}</span>
                </div>
                {order.shippingCharge > 0 && (
                  <div className="total-line-row">
                    <span>Shipping &amp; Handling:</span>
                    <span>₹{order.shippingCharge.toFixed(2)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="total-line-row discount-row">
                    <span>Promotional Discount:</span>
                    <span>-₹{order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="grand-total-divider" />
                <div className="grand-total-row">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Digital Signatory Stamp Box */}
              <div className="authorisation-sign-box">
                <div className="sign-company-title">For VENTHULIR ORGANIC HARVEST</div>
                <div className="digital-seal-badge">
                  <ShieldCheck size={14} color="#166534" />
                  <span>DIGITALLY SIGNED &amp; VERIFIED</span>
                </div>
                <div className="sign-label">Authorised Signatory</div>
              </div>
            </div>

          </div>

          {/* Footer Notes */}
          <div className="tax-invoice-footer-notes">
            <p>Thank you for choosing Venthulir. Delivering purity and wellness direct from heritage farms.</p>
            <p>Support / Queries: <strong>+91 8778476414</strong> &bull; <strong>theventhulir@gmail.com</strong></p>
          </div>

        </div>

        {/* Hidden Pristine A4 Document Container (Dedicated for High-Res PDF Generation) */}
        <div 
          ref={printSheetRef} 
          className="print-only-a4-sheet"
          style={{ display: 'none', position: 'fixed', left: '-9999px', width: '800px', background: '#ffffff', padding: '24px 30px' }}
        >
          {/* Top GST Banner Header */}
          <div className="tax-invoice-top-banner">
            <div className="banner-title">TAX INVOICE</div>
            <div className="banner-sub">[ Original for Recipient &bull; Bill of Supply under Section 31 of CGST Act, 2017 ]</div>
          </div>

          <div className="tax-invoice-header-row">
            <div className="company-logo-block">
              <div className="logo-circle-frame">
                <img src="/logo.png" alt="Venthulir Logo" className="invoice-logo-img" />
              </div>
              <div className="company-crest-text">VENTHULIR</div>
            </div>

            <div className="company-info-block">
              <h1 className="company-brand-name">
                <span className="brand-primary">VENTHULIR</span>{' '}
                <span className="brand-accent">ORGANIC HARVEST</span>
              </h1>
              <div className="company-tagline">100% Pure Heritage Masala Powders &amp; Wood Cold-Pressed Oils</div>
              <div className="company-address-text">
                <strong>Registered Office:</strong> IInd Floor, OM Shiva Towers, 259-B, Advaitha Ashram Rd, Fairlands, Salem, Tamil Nadu - 636004<br />
                <strong>GSTIN:</strong> 33AAFTO2026V1Z8 &nbsp;|&nbsp; <strong>State:</strong> Tamil Nadu (33) &nbsp;|&nbsp; <strong>FSSAI:</strong> 12423018000421<br />
                <strong>Phone:</strong> +91 8778476414 &nbsp;|&nbsp; <strong>Email:</strong> theventhulir@gmail.com
              </div>
            </div>
          </div>

          <table className="tax-grid-table">
            <tbody>
              <tr>
                <td className="grid-cell w-25"><span className="cell-label">INVOICE NUMBER</span><div className="cell-value font-mono">VEN-{invoiceNo}</div></td>
                <td className="grid-cell w-25"><span className="cell-label">INVOICE DATE</span><div className="cell-value">{invoiceDate}</div></td>
                <td className="grid-cell w-25"><span className="cell-label">CHALLAN ID</span><div className="cell-value font-mono">{challanNo}</div></td>
                <td className="grid-cell w-25"><span className="cell-label">PLACE OF SUPPLY</span><div className="cell-value">Tamil Nadu (33)</div></td>
              </tr>
              <tr>
                <td className="grid-cell" colSpan={2}><span className="cell-label">BILLED TO</span><div className="cell-value buyer-name">{buyerName}</div></td>
                <td className="grid-cell"><span className="cell-label">DELIVERY MODE</span><div className="cell-value">Express Delivery</div></td>
                <td className="grid-cell"><span className="cell-label">PAYMENT STATUS</span><div className="cell-value font-bold">{isPaid ? 'Paid Online' : 'Cash on Delivery'}</div></td>
              </tr>
              <tr>
                <td className="grid-cell" colSpan={2}><span className="cell-label">DELIVERY ADDRESS</span><div className="cell-value-text">{buyerAddress}</div></td>
                <td className="grid-cell" colSpan={2}><span className="cell-label">CUSTOMER PHONE</span><div className="cell-value font-mono">{buyerPhone}</div></td>
              </tr>
            </tbody>
          </table>

          <table className="tax-items-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>S.NO</th>
                <th style={{ textAlign: 'left' }}>PRODUCT DESCRIPTION</th>
                <th style={{ width: '70px', textAlign: 'center' }}>HSN/SAC</th>
                <th style={{ width: '45px', textAlign: 'center' }}>QTY</th>
                <th style={{ width: '80px', textAlign: 'right' }}>RATE (₹)</th>
                <th style={{ width: '90px', textAlign: 'right' }}>TAXABLE VALUE</th>
                <th style={{ width: '65px', textAlign: 'right' }}>CGST 2.5%</th>
                <th style={{ width: '65px', textAlign: 'right' }}>SGST 2.5%</th>
                <th style={{ width: '85px', textAlign: 'right' }}>TOTAL (₹)</th>
              </tr>
            </thead>
            <tbody>
              {processedItems.map((item) => (
                <tr key={item.sNo}>
                  <td className="text-center font-mono">{item.sNo}</td>
                  <td>{item.name} {item.variant && `(${item.variant})`}</td>
                  <td className="text-center">{item.hsn}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-right">{item.rate.toFixed(2)}</td>
                  <td className="text-right">{item.taxableValue.toFixed(2)}</td>
                  <td className="text-right">{item.cgst.toFixed(2)}</td>
                  <td className="text-right">{item.sgst.toFixed(2)}</td>
                  <td className="text-right font-bold">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="tr-subtotal-row">
                <td colSpan={5} className="text-right font-bold">SUBTOTAL</td>
                <td className="text-right font-bold">₹{totalTaxableValue.toFixed(2)}</td>
                <td className="text-right font-bold">₹{totalCgst.toFixed(2)}</td>
                <td className="text-right font-bold">₹{totalSgst.toFixed(2)}</td>
                <td className="text-right font-bold">₹{totalLineItemsGross.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="tax-bottom-summary-grid">
            <div className="summary-left-column">
              <div className="amount-in-words-box">
                <span className="words-label">AMOUNT IN WORDS</span>
                <div className="words-content">
                  <span className="words-currency-prefix">Indian Rupees</span>
                  <span className="words-amount-value">{amountInWords} Only</span>
                </div>
              </div>
            </div>
            <div className="summary-right-column">
              <div className="tax-totals-breakdown-box">
                <div className="total-line-row"><span>Taxable Value:</span><span>₹{totalTaxableValue.toFixed(2)}</span></div>
                <div className="total-line-row"><span>CGST (2.5%):</span><span>₹{totalCgst.toFixed(2)}</span></div>
                <div className="total-line-row"><span>SGST (2.5%):</span><span>₹{totalSgst.toFixed(2)}</span></div>
                <div className="total-line-row font-bold"><span>Total GST (5%):</span><span>₹{totalTax.toFixed(2)}</span></div>
                {order.shippingCharge > 0 && <div className="total-line-row"><span>Shipping:</span><span>₹{order.shippingCharge.toFixed(2)}</span></div>}
                <div className="grand-total-divider" />
                <div className="grand-total-row"><span>Grand Total:</span><span>₹{grandTotal.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
