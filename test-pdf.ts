import { PDFParse } from 'pdf-parse';

console.log('PDFParse export:', PDFParse);

if (typeof PDFParse === 'function') {
    console.log('PDFParse is a function/class');
    // We can't really run it without a real PDF buffer easily here, 
    // but this confirms it's available.
} else {
    console.log('PDFParse is NOT a function/class');
}
