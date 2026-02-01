import React from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  Target, 
  Users, 
  Award, 
  Heart, 
  Briefcase, 
  TrendingUp,
  CheckCircle,
  Star
} from 'lucide-react';


export function Privacy() {
  return (
    <div className="p-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy BAHATH JOBZ</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
           Your privacy matters — we protect your data and ensure a secure job search journey.
          </p>
        </div>
      </div>

        <Card className="max-w-6xl mx-auto p-8 mb-16">
        {/* <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Privacy Policy</h2> */}
        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            <p><strong>Effective Date:</strong> 2025-01-01</p>

            <p>
            Bahath Jobz (“we”, “our”, “us”) respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal data when you use our website and services.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">1. Information We Collect</h3>
            <ul className="list-disc list-inside space-y-2">
            <li><strong>Personal Information:</strong> Name, email, phone number, resume, job preferences, etc.</li>
            <li><strong>Usage Data:</strong> Pages visited, device info, IP address, browser type, etc.</li>
            <li><strong>Cookies:</strong> We use cookies to enhance your experience and for analytics.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h3>
            <ul className="list-disc list-inside space-y-2">
            <li>To provide and improve our job platform services</li>
            <li>To connect job seekers with relevant employers</li>
            <li>To communicate with you regarding your account or job opportunities</li>
            <li>To prevent fraud and maintain security</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900">3. Sharing Your Data</h3>
            <p>
            We share your data with trusted partners such as employers, service providers, and legal authorities when required. We never sell your personal data.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">4. Data Retention</h3>
            <p>
            Your data is retained as long as necessary to fulfill services and legal obligations. You may request account deletion at any time.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">5. Your Rights</h3>
            <p>
            Depending on your location, you may have rights to access, correct, delete, or restrict the use of your data. Contact us to exercise your rights.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">6. Children's Privacy</h3>
            <p>
            We do not knowingly collect data from children under 13. If discovered, such data will be deleted promptly.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">7. Updates to This Policy</h3>
            <p>
            We may update this Privacy Policy occasionally. Changes will be posted on this page with an updated effective date.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">8. Contact Us</h3>
            <p>
            If you have any questions about this policy or your data, contact us at:
            <br />
            <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:Inquiries@bahathjobz.com" className="text-blue-600 hover:underline">
                    Inquiries@bahathjobz.com
                </a>
                <br />
                <strong>Website:</strong>{' '}
                <a href="https://bahathjobz.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    https://bahathjobz.com
                </a>
                </p>
            </p>
        </div>
        </Card>

    </div>
  );
}