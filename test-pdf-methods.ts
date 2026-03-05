import { PDFParse } from 'pdf-parse';
import * as fs from 'fs';

async function test() {
    // This is just a placeholder to check if the method exists and what it returns
    const parser = new PDFParse({ data: new Uint8Array() });
    console.log('getTable exists:', typeof (parser as any).getTable === 'function');

    // Check for other methods
    console.log('Methods:', Object.getOwnPropertyNames(PDFParse.prototype));
}

test();
