import React, { useState, useEffect } from 'react';
import { getCertificates } from '../services/certificates';
import { Award, Calendar, Download } from 'lucide-react';
import { generateCertificate } from '../utils/certificate';
import type { CertificateData } from '../services/certificates';
import { calculateKIU } from '../utils/kiu';
import { cn } from '../lib/utils';
import type { User } from '../types/auth';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, [user.email]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const userCertificates = await getCertificates(user.email);
      setCertificates(userCertificates);
    } catch (err) {
      setError('Failed to fetch certificates. Please try again.');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificate: CertificateData) => {
    // Ensure KIU exists, calculate if missing
    const kiu = certificate.kiu || calculateKIU(certificate.originalText);
    
    const summary = `This assessment evaluated comprehension and knowledge of key concepts at ${kiu.level} (${kiu.graduatedScore} KIU). The material demonstrated a complexity score of ${kiu.materialComplexity} with a baseline knowledge requirement of ${kiu.baselineKnowledge} KIU.`;
    
    const { doc, filename } = generateCertificate(
      certificate.name,
      certificate.title,
      certificate.score,
      summary,
      kiu
    );
    doc.save(filename);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Your Certificates</h1>
          </div>
          <p className="text-gray-600">View and download your earned certificates</p>
        </div>

        {error && (
          <div className="max-w-xl mx-auto px-4 py-3 mb-6 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your certificates...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert, index) => {
              // Ensure KIU exists, calculate if missing
              const kiu = cert.kiu || calculateKIU(cert.originalText);
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {cert.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">
                      <span className="font-medium">Score:</span> {cert.score}%
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">KIU Level:</span> {kiu.level}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">KIU Score:</span> {kiu.graduatedScore}
                    </p>
                    <p className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {cert.date instanceof Date 
                        ? cert.date.toLocaleDateString() 
                        : new Date(cert.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(cert)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Download
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && certificates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">You haven't earned any certificates yet.</p>
            <p className="text-gray-600 mt-2">Complete an assessment with a score of 80% or higher to earn your first certificate!</p>
          </div>
        )}
      </div>
    </div>
  );
}