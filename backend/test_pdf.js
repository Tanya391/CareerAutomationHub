const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

async function testPdf() {
  try {
    // Let's create a minimal valid PDF first
    const pdfData = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 21 >>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \n0000000302 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n374\n%%EOF', 'utf-8');
    
    console.log('Testing pdf-parse with mock PDF buffer...');
    const result = await pdfParse(pdfData);
    console.log('Text extracted:', result.text);
  } catch (error) {
    console.error('Error parsing PDF:', error);
  }
}

testPdf();
