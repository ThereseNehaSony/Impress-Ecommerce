// reportController.js
const path = require('path');
const fs = require('fs');
const Order = require('../models/order');
const generatePDF = require('../services/generatePDF');

const reportController = {
    generateSalesReport: async (req, res) => {
        try {
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;

            const salesData = await Order.find({
                orderDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            });

            const fileName = `sales_report_${startDate}_${endDate}.pdf`;
            const filePath = path.join(__dirname, `../pdfreports/${fileName}`);

           
            generatePDF(salesData, filePath, startDate, endDate);

            res.status(200).json({ message: 'Sales report generated successfully', fileName });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    downloadSalesReport: (req, res) => {
        console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiii")
        try {
            const fileName = req.params.fileName;
            const filePath = path.join(__dirname, `../pdfreports/${fileName}`);

         console.log("downloaded...................")
            res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
            res.setHeader('Content-type', 'application/pdf');

          
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

module.exports = reportController;
