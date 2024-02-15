
const PDFDocument = require('pdfkit');
const fs = require('fs');

const generatePDF = (salesData, filePath, startDate, endDate) => {
    const doc = new PDFDocument();

    

   
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

 
    doc.fontSize(20).text('Sales Report', { align: 'center' });
    doc.fontSize(14).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).text(`Period: ${startDate} to ${endDate}`, { align: 'center' });
    doc.moveDown();

   
    doc.fontSize(14).text('Product ID', 50, doc.y, { continued: true });
    // doc.text('User ID', 120, doc.y, { continued: true });
    doc.text('Quantity', 150, doc.y, { continued: true });
    doc.text('Price', 250, doc.y, { continued: true });
    doc.text('Total Price', 350, doc.y);

    doc.moveDown();

   
    salesData.forEach((entry) => {
        const product = entry.products[0]; 
        doc.fontSize(12).text(shortenId(product.productId), 50, doc.y, { continued: true });
        // doc.text(shortenId(entry.userId), 120, doc.y, { continued: true });
        doc.text((product.quantity || '').toString(), 150, doc.y, { continued: true });
        doc.text((product.price || '').toString(),280, doc.y, { continued: true });
        doc.text((entry.totalPrice || '').toString(), 400, doc.y);
    
        doc.moveDown();
    });
    function shortenId(id) {
        return id ? `${id.toString().substring(0, 10)}...` : '';
    }
   
    const totalAmount = salesData.reduce((sum, entry) => sum + (entry.totalPrice || 0), 0);
    doc.fontSize(14).text(`Total Price of All Orders: ${totalAmount}`, { align: 'right' });

   
    doc.end();
    
};
const generateInvoicePDF = (order, filePath) => {
    const doc = new PDFDocument();
  
    // Set up fonts and styling
    doc.font('Helvetica-Bold');
    doc.fontSize(20).text('Invoice', { align: 'center' });
  
    // Add order details to the PDF
    doc.moveDown();
    doc.fontSize(14).text(`Order ID: ${order._id}`);
    doc.text(`Order Date: ${order.orderDate.toLocaleString()}`);
    doc.text(`Customer Name: ${order.userId.name}`);
    doc.text(`Total Price: ₹${order.totalPrice.toFixed(2)}`);
  
    // Add a manual table for order items
    doc.moveDown();
    doc.fontSize(16).text('Order Items', { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica'); // Set a different font for the table
  
    const columnWidths = [200, 80, 80, 100]; // Adjust the column widths as needed
  
    // Headers
    doc.text('Product', 50, doc.y, { width: columnWidths[0] });
    doc.text('Quantity', 250, doc.y, { width: columnWidths[1] });
    doc.text('Price', 350, doc.y, { width: columnWidths[2] });
    doc.text('Total', 450, doc.y, { width: columnWidths[3] });
  
    doc.moveDown();
  
    // Rows
    order.products.forEach(product => {
      doc.text(product.productId.name, 50, doc.y, { width: columnWidths[0] });
      doc.text(product.quantity.toString(), 250, doc.y, { width: columnWidths[1] });
      doc.text(`₹${product.price.toFixed(2)}`, 350, doc.y, { width: columnWidths[2] });
      doc.text(`₹${(product.quantity * product.price).toFixed(2)}`, 450, doc.y, { width: columnWidths[3] });
  
      doc.moveDown();
    });
  
    // Save the PDF to the specified file path
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.end();
  };

module.exports = {generatePDF , generateInvoicePDF }
                        
