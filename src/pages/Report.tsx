
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ValidationReport } from '../types';

interface ReportProps {
  report: ValidationReport;
  onStartNew: () => void;
  onBack: () => void;
}

const Report: React.FC<ReportProps> = ({ report, onStartNew, onBack }) => {
  const handleDownloadPDF = () => {
    // Create a simple HTML structure for PDF generation
    const reportContent = `
      <html>
        <head>
          <title>Idea Validation Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #4338ca; border-bottom: 2px solid #4338ca; padding-bottom: 10px; }
            h2 { color: #6366f1; margin-top: 30px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            .section { margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>Idea Validation Report</h1>
          
          <div class="section">
            <h2>Idea Summary</h2>
            <p>${report.ideaSummary}</p>
          </div>
          
          <div class="section">
            <h2>Strengths</h2>
            <ul>
              ${report.strengths.map(strength => `<li>${strength}</li>`).join('')}
            </ul>
          </div>
          
          <div class="section">
            <h2>Potential Concerns</h2>
            <ul>
              ${report.concerns.map(concern => `<li>${concern}</li>`).join('')}
            </ul>
          </div>
          
          <div class="section">
            <h2>Key Insights</h2>
            <p>${report.insights}</p>
          </div>
          
          <div class="section">
            <h2>Suggested Next Steps</h2>
            <p>${report.nextSteps}</p>
          </div>
        </body>
      </html>
    `;

    // Create a blob and download it
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'idea-validation-report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </Button>
        </div>

        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            Your Validation Report
          </h1>
          <p className="text-gray-600 text-center mb-12">
            Here's your personalized idea validation analysis
          </p>

          <div className="space-y-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">Idea Summary</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {report.ideaSummary}
              </p>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold text-emerald-700 mb-4">Strengths</h2>
              <ul className="space-y-3">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold text-amber-700 mb-4">Potential Concerns</h2>
              <ul className="space-y-3">
                {report.concerns.map((concern, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{concern}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">Key Insights</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {report.insights}
              </p>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Suggested Next Steps</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {report.nextSteps}
              </p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button
              onClick={handleDownloadPDF}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Report
            </Button>
            <Button
              onClick={onStartNew}
              size="lg"
              variant="outline"
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3"
            >
              Start a New Idea
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
