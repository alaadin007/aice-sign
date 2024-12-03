import { jsPDF } from 'jspdf';
import type { KIUResult } from './kiu';

export function generateCertificate(
  name: string, 
  title: string, 
  score: number, 
  summary: string,
  kiu: KIUResult
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Set background
  doc.setFillColor(252, 253, 254);
  doc.rect(0, 0, 297, 210, 'F');

  // Add decorative border
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2);
  doc.rect(15, 15, 267, 180);
  
  // Add inner border
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.rect(20, 20, 257, 170);

  // Add header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  doc.setTextColor(30, 64, 175);
  doc.text('Certificate of Achievement', 148.5, 50, { align: 'center' });

  // Add decorative line under header
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(74, 55, 223, 55);

  // Add name section
  doc.setFontSize(24);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'normal');
  doc.text('This is to certify that', 148.5, 80, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.text(name, 148.5, 95, { align: 'center' });

  // Add course title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text('has successfully completed', 148.5, 115, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  const formattedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  doc.text(formattedTitle, 148.5, 130, { align: 'center' });

  // Add score and KIU
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(18);
  doc.text(`with a score of ${score}%`, 148.5, 145, { align: 'center' });
  doc.setFontSize(14);
  doc.text(`Knowledge Impact Units (KIU): ${kiu.graduatedScore}`, 148.5, 155, { align: 'center' });
  doc.text(`Level: ${kiu.level}`, 148.5, 162, { align: 'center' });

  // Add summary
  doc.setFontSize(12);
  const splitSummary = doc.splitTextToSize(summary, 200);
  doc.text(splitSummary, 148.5, 175, { align: 'center' });

  // Add date
  doc.setFontSize(14);
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Issued on ${date}`, 148.5, 185, { align: 'center' });

  // Generate filename
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const filename = `${sanitizedTitle}-certificate.pdf`;
  
  return { doc, filename };
}