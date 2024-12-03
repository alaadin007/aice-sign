import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateCertificate } from '../utils/certificate';
import { saveCertificate } from '../services/certificates';
import { calculateKIU } from '../utils/kiu';
import type { User } from '../types/auth';

interface CertificateFormProps {
  score: number;
  totalQuestions: number;
  originalText: string;
  user: User;
}

export function CertificateForm({ score, totalQuestions, originalText, user }: CertificateFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const percentage = Math.round((score / totalQuestions) * 100);

  const handleGenerateCertificate = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Generate a proper title from the original text
      const title = originalText
        .split('.')[0]  // Take first sentence
        .slice(0, 100)  // Limit length
        .trim();

      // Calculate KIU
      const kiu = calculateKIU(originalText);

      // Save certificate data to Firebase
      await saveCertificate({
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        title,
        score: percentage,
        date: new Date(),
        originalText,
        kiu
      });

      const summary = `This assessment evaluated comprehension and knowledge of key concepts at ${kiu.level} (${kiu.graduatedScore} KIU). The material demonstrated a complexity score of ${kiu.materialComplexity} with a baseline knowledge requirement of ${kiu.baselineKnowledge} KIU.`;

      const { doc, filename } = generateCertificate(
        `${user.firstName} ${user.lastName}`, 
        title, 
        percentage, 
        summary,
        kiu
      );
      doc.save(filename);
    } catch (error) {
      console.error('Error generating certificate:', error);
      setError('Failed to generate certificate. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (percentage < 80) return null;

  return (
    <div className="p-6 bg-white border border-green-200 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-green-800 mb-4">
        🎉 Congratulations! You've qualified for a certificate!
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleGenerateCertificate}
        disabled={isSaving}
        className={cn(
          "flex items-center justify-center gap-2 w-full px-4 py-2 text-white bg-green-600 rounded-lg",
          "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isSaving ? (
          "Generating..."
        ) : (
          <>
            Download Certificate
            <Download className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}