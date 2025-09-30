import jsPDF from 'jspdf'

// Type guard for jsPDF
const getJsPDF = () => {
  if (typeof window === 'undefined') {
    throw new Error('jsPDF can only be used in browser environment')
  }
  return jsPDF
}

export interface InvoiceData {
  id: string
  type: 'receipt' | 'invoice' | 'refund'
  reservationId: string
  guestName: string
  guestEmail: string
  propertyName: string
  checkIn: string
  checkOut: string
  nights: number
  totalAmount: number
  paidAmount?: number
  outstandingBalance?: number
  generatedAt: string
  generatedBy: string
  additionalNotes?: string
  includeBreakdown?: boolean
  payments?: Array<{
    id: number
    amount: number
    method: string
    date: string
    reference?: string
    description?: string
  }>
}

export class PDFInvoiceGenerator {
  private doc: jsPDF
  private currentY: number = 0
  private pageWidth: number = 210 // A4 width in mm
  private pageHeight: number = 297 // A4 height in mm
  private margin: number = 20

  constructor() {
    console.log('🔧 Initializing PDF Generator...')
    try {
      this.doc = new jsPDF()
      this.currentY = this.margin
      console.log('✅ PDF Generator initialized successfully')
    } catch (error) {
      console.error('❌ Error initializing jsPDF:', error)
      throw error
    }
  }

  generateInvoice(invoiceData: InvoiceData): void {
    console.log('📄 Starting invoice generation...', invoiceData)
    
    try {
      this.setupDocument(invoiceData)
      console.log('✅ Document setup complete')
      
      this.addHeader(invoiceData)
      console.log('✅ Header added')
      
      this.addCompanyInfo()
      console.log('✅ Company info added')
      
      this.addGuestInfo(invoiceData)
      console.log('✅ Guest info added')
      
      this.addReservationDetails(invoiceData)
      console.log('✅ Reservation details added')
      
      if (invoiceData.includeBreakdown && invoiceData.payments) {
        this.addPaymentBreakdown(invoiceData)
        console.log('✅ Payment breakdown added')
      }
      
      this.addAmountSummary(invoiceData)
      console.log('✅ Amount summary added')
      
      this.addFooter(invoiceData)
      console.log('✅ Footer added')
      
      // Download the PDF
      const fileName = `${invoiceData.type.toUpperCase()}_${invoiceData.reservationId}_${new Date().toISOString().split('T')[0]}.pdf`
      console.log('💾 Saving PDF as:', fileName)
      
      this.doc.save(fileName)
      console.log('✅ PDF saved successfully!')
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error)
      throw error
    }
  }

  private setupDocument(invoiceData: InvoiceData): void {
    // Add colored header bar
    this.doc.setFillColor(255, 140, 0) // Orange color
    this.doc.rect(0, 0, this.pageWidth, 25, 'F')
    
    // Set document title based on type
    const title = this.getDocumentTitle(invoiceData.type)
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.text(title, this.pageWidth / 2, 15, { align: 'center' })
    
    // Reset text color
    this.doc.setTextColor(0, 0, 0)
    this.currentY = 35
  }

  private getDocumentTitle(type: string): string {
    switch (type) {
      case 'receipt':
        return 'PAYMENT RECEIPT'
      case 'invoice':
        return 'INVOICE'
      case 'refund':
        return 'REFUND RECEIPT'
      default:
        return 'DOCUMENT'
    }
  }

  private addHeader(invoiceData: InvoiceData): void {
    // Add background for header info
    this.doc.setFillColor(245, 245, 245) // Light gray
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 18, 'F')
    
    // Invoice number and date
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(60, 60, 60)
    
    this.doc.text(`Invoice #: ${invoiceData.id || 'N/A'}`, this.margin + 3, this.currentY + 3)
    this.doc.text(`Date: ${new Date(invoiceData.generatedAt).toLocaleDateString()}`, this.pageWidth - this.margin - 3, this.currentY + 3, { align: 'right' })
    this.currentY += 8
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Reservation ID: ${invoiceData.reservationId || 'N/A'}`, this.margin + 3, this.currentY + 3)
    
    // Reset text color
    this.doc.setTextColor(0, 0, 0)
    this.currentY += 20
  }

  private addCompanyInfo(): void {
    // Company name in orange
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 140, 0) // Orange
    this.doc.text('ROOMY PROPERTY MANAGEMENT', this.margin, this.currentY)
    this.doc.setTextColor(0, 0, 0) // Reset to black
    this.currentY += 8
    
    // Contact details
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(80, 80, 80) // Dark gray
    this.doc.text('123 Business Bay, Dubai, UAE', this.margin, this.currentY)
    this.currentY += 4
    this.doc.text('Phone: +971 4 123 4567 | Email: info@roomy.ae | Web: www.roomy.ae', this.margin, this.currentY)
    this.doc.setTextColor(0, 0, 0) // Reset to black
    this.currentY += 15
    
    // Separator line
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 10
  }

  private addGuestInfo(invoiceData: InvoiceData): void {
    // BILL TO section header with background
    this.doc.setFillColor(255, 248, 240) // Light orange background
    this.doc.rect(this.margin, this.currentY - 3, 80, 10, 'F')
    
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 140, 0) // Orange
    this.doc.text('BILL TO:', this.margin + 2, this.currentY + 4)
    this.doc.setTextColor(0, 0, 0) // Reset
    this.currentY += 12
    
    // Guest details
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(invoiceData.guestName || 'N/A', this.margin, this.currentY)
    this.currentY += 6
    
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(80, 80, 80)
    this.doc.text(invoiceData.guestEmail || 'N/A', this.margin, this.currentY)
    this.doc.setTextColor(0, 0, 0) // Reset
    this.currentY += 15
  }

  private addReservationDetails(invoiceData: InvoiceData): void {
    // Section header with background
    this.doc.setFillColor(255, 248, 240) // Light orange background
    this.doc.rect(this.margin, this.currentY - 3, 120, 10, 'F')
    
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 140, 0) // Orange
    this.doc.text('RESERVATION DETAILS:', this.margin + 2, this.currentY + 4)
    this.doc.setTextColor(0, 0, 0) // Reset
    this.currentY += 12
    
    // Create table-like layout
    this.doc.setFillColor(250, 250, 250) // Very light gray
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 'F')
    
    this.doc.setFontSize(9)
    
    const details = [
      ['Property:', invoiceData.propertyName || 'N/A'],
      ['Check-in:', invoiceData.checkIn ? new Date(invoiceData.checkIn).toLocaleDateString() : 'N/A'],
      ['Check-out:', invoiceData.checkOut ? new Date(invoiceData.checkOut).toLocaleDateString() : 'N/A'],
      ['Nights:', invoiceData.nights ? invoiceData.nights.toString() : '0'],
      ['Generated by:', invoiceData.generatedBy || 'System']
    ]
    
    this.currentY += 5
    details.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(label, this.margin + 3, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(value, this.margin + 40, this.currentY)
      this.currentY += 6
    })
    
    this.currentY += 10
  }

  private addPaymentBreakdown(invoiceData: InvoiceData): void {
    if (!invoiceData.payments || invoiceData.payments.length === 0) return
    
    // Section header with background
    this.doc.setFillColor(255, 248, 240) // Light orange background
    this.doc.rect(this.margin, this.currentY - 3, 100, 10, 'F')
    
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 140, 0) // Orange
    this.doc.text('PAYMENT BREAKDOWN:', this.margin + 2, this.currentY + 4)
    this.doc.setTextColor(0, 0, 0) // Reset
    this.currentY += 12
    
    // Table header with background
    this.doc.setFillColor(255, 140, 0) // Orange
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 'F')
    
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 255, 255) // White
    this.doc.text('DATE', this.margin + 2, this.currentY + 5)
    this.doc.text('METHOD', this.margin + 32, this.currentY + 5)
    this.doc.text('REFERENCE', this.margin + 62, this.currentY + 5)
    this.doc.text('AMOUNT', this.margin + 102, this.currentY + 5)
    this.doc.text('DESCRIPTION', this.margin + 132, this.currentY + 5)
    this.doc.setTextColor(0, 0, 0) // Reset
    this.currentY += 10
    
    // Payment rows with alternating background
    this.doc.setFontSize(8)
    this.doc.setFont('helvetica', 'normal')
    
    invoiceData.payments.forEach((payment, index) => {
      // Alternating row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(250, 250, 250)
        this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 7, 'F')
      }
      
      this.doc.text(payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A', this.margin + 2, this.currentY + 3)
      this.doc.text((payment.method || 'N/A').toUpperCase(), this.margin + 32, this.currentY + 3)
      this.doc.text(payment.reference || '-', this.margin + 62, this.currentY + 3)
      
      // Amount in bold
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`$${payment.amount || 0}`, this.margin + 102, this.currentY + 3)
      this.doc.setFont('helvetica', 'normal')
      
      this.doc.text(payment.description || 'Payment', this.margin + 132, this.currentY + 3)
      this.currentY += 7
    })
    
    this.currentY += 10
  }

  private addAmountSummary(invoiceData: InvoiceData): void {
    // Section header with background
    this.doc.setFillColor(255, 248, 240) // Light orange background
    this.doc.rect(this.margin, this.currentY - 3, 100, 10, 'F')
    
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.setTextColor(255, 140, 0) // Orange
    this.doc.text('AMOUNT SUMMARY:', this.margin + 2, this.currentY + 4)
    this.doc.setTextColor(0, 0, 0) // Reset
    this.currentY += 12
    
    // Summary box
    const summaryBoxStart = this.currentY
    this.doc.setFillColor(250, 250, 250)
    this.doc.rect(this.margin + 80, this.currentY, this.pageWidth - this.margin - 80, 30, 'F')
    
    this.doc.setFontSize(10)
    this.currentY += 6
    
    // Total amount
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Total Amount:', this.margin + 85, this.currentY)
    this.doc.text(`AED ${invoiceData.totalAmount || 0}`, this.pageWidth - this.margin - 5, this.currentY, { align: 'right' })
    this.currentY += 7
    
    // Paid amount (if applicable)
    if (invoiceData.paidAmount !== undefined && invoiceData.paidAmount !== null) {
      this.doc.setFont('helvetica', 'normal')
      this.doc.setTextColor(0, 150, 0) // Green
      this.doc.text('Paid Amount:', this.margin + 85, this.currentY)
      this.doc.text(`AED ${invoiceData.paidAmount}`, this.pageWidth - this.margin - 5, this.currentY, { align: 'right' })
      this.doc.setTextColor(0, 0, 0) // Reset
      this.currentY += 7
    }
    
    // Outstanding balance (if applicable)
    if (invoiceData.outstandingBalance !== undefined && invoiceData.outstandingBalance !== null) {
      this.doc.setFont('helvetica', 'bold')
      if (invoiceData.outstandingBalance > 0) {
        this.doc.setTextColor(220, 38, 38) // Red for outstanding
      } else {
        this.doc.setTextColor(0, 150, 0) // Green for fully paid
      }
      this.doc.text('Outstanding Balance:', this.margin + 85, this.currentY)
      this.doc.text(`AED ${invoiceData.outstandingBalance}`, this.pageWidth - this.margin - 5, this.currentY, { align: 'right' })
      this.doc.setTextColor(0, 0, 0) // Reset to black
      this.currentY += 7
    }
    
    this.currentY += 10
  }

  private addFooter(invoiceData: InvoiceData): void {
    // Additional notes in a box
    if (invoiceData.additionalNotes && invoiceData.additionalNotes.trim()) {
      this.doc.setFillColor(255, 255, 240) // Light yellow background
      this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 25, 'F')
      this.doc.setDrawColor(255, 200, 100)
      this.doc.rect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 25, 'S')
      
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Additional Notes:', this.margin + 3, this.currentY + 3)
      this.currentY += 7
      
      this.doc.setFont('helvetica', 'normal')
      const lines = this.doc.splitTextToSize(invoiceData.additionalNotes, this.pageWidth - 2 * this.margin - 10)
      this.doc.text(lines, this.margin + 3, this.currentY)
      this.currentY += lines.length * 4 + 10
    }
    
    // Status message based on type with colored box
    let statusMessage = ''
    let statusColor: [number, number, number] = [0, 150, 0] // Green default
    
    switch (invoiceData.type) {
      case 'receipt':
        statusMessage = '✓ Thank you for your payment. This receipt confirms your transaction.'
        statusColor = [0, 150, 0] // Green
        break
      case 'invoice':
        statusMessage = 'Please remit payment by the due date. Thank you for your business.'
        statusColor = [255, 140, 0] // Orange
        break
      case 'refund':
        statusMessage = 'Refund has been processed and will be credited to your account within 3-5 business days.'
        statusColor = [0, 100, 200] // Blue
        break
    }
    
    if (statusMessage) {
      this.doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 12, 'F')
      
      this.doc.setFontSize(9)
      this.doc.setFont('helvetica', 'bold')
      this.doc.setTextColor(255, 255, 255) // White text
      this.doc.text(statusMessage, this.pageWidth / 2, this.currentY + 7, { align: 'center' })
      this.doc.setTextColor(0, 0, 0) // Reset
      this.currentY += 15
    }
    
    // Footer bar
    this.doc.setFillColor(240, 240, 240)
    this.doc.rect(0, this.pageHeight - 25, this.pageWidth, 25, 'F')
    
    this.doc.setFontSize(7)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(100, 100, 100)
    this.doc.text('This is a computer-generated document. No signature required.', this.pageWidth / 2, this.pageHeight - 15, { align: 'center' })
    this.doc.text(`Generated on ${new Date().toLocaleString()}`, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' })
    this.doc.text('ROOMY Property Management • Dubai, UAE', this.pageWidth / 2, this.pageHeight - 5, { align: 'center' })
    this.doc.setTextColor(0, 0, 0) // Reset
  }
}

// Export function for easy use
export function generateInvoicePDF(invoiceData: InvoiceData): void {
  const generator = new PDFInvoiceGenerator()
  generator.generateInvoice(invoiceData)
}
