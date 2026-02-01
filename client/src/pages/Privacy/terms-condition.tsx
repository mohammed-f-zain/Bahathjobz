import React from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';

export function TermsAndConditions() {
  return (
    <div className="p-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Terms and Conditions BAHATH JOBZ</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
           Your trust matters. Know how we protect it through our Terms & Conditions.
          </p>
        </div>  
      </div>

        <Card className="max-w-6xl mx-auto p-8 mb-16">
  <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
    <p><strong>Effective Date:</strong> 2025-01-01</p>

   <p>
  These Terms and Conditions (“Terms”) govern your use of the Bahath Jobz platform (“we”, “our”, “us”) available at  
  <a
    href="https://bahathjobz.com"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:underline mx-2"
  >
    https://bahathjobz.com
  </a>
  By using our services, you agree to be bound by these Terms.
</p>


    <h3 className="text-lg font-semibold text-gray-900">1. Eligibility</h3>
    <p>
      You must be at least 18 years old and legally capable of entering into a binding agreement to use our platform.
    </p>

    <h3 className="text-lg font-semibold text-gray-900">2. User Accounts</h3>
    <ul className="list-disc list-inside space-y-2">
      <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
      <li>Notify us immediately if you suspect unauthorized access to your account.</li>
      <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
    </ul>

    <h3 className="text-lg font-semibold text-gray-900">3. Use of the Platform</h3>
    <ul className="list-disc list-inside space-y-2">
      <li>Job seekers may search for jobs, submit applications, and upload resumes.</li>
      <li>Employers may post job listings, search resumes, and contact candidates.</li>
      <li>Do not use the platform for unlawful, harmful, or fraudulent activities.</li>
    </ul>

    <h3 className="text-lg font-semibold text-gray-900">4. Content Ownership</h3>
    <p>
      You retain ownership of any content you submit but grant us a license to use it to provide and promote our services.
    </p>

    <h3 className="text-lg font-semibold text-gray-900">5. Payments & Subscriptions</h3>
    <ul className="list-disc list-inside space-y-2">
      <li>Premium services may require payment. All fees are non-refundable unless stated otherwise.</li>
      <li>We may change pricing at any time with prior notice for future purchases.</li>
    </ul>

    <h3 className="text-lg font-semibold text-gray-900">6. Termination</h3>
    <p>
      We may suspend or terminate your access if you violate these Terms or misuse the platform. Terminated users may not create new accounts without permission.
    </p>

    <h3 className="text-lg font-semibold text-gray-900">7. Limitation of Liability</h3>
    <p>
      We are not liable for indirect or consequential damages arising from your use of the platform. Services are provided “as is” without warranties of any kind.
    </p>

    <h3 className="text-lg font-semibold text-gray-900">8. Privacy</h3>
    <p>
      Your use of the platform is also governed by our 
      <a href="/privacy-policy" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>.
    </p>

    <h3 className="text-lg font-semibold text-gray-900">9. Governing Law</h3>
    <p>
      These Terms shall be governed by and interpreted in accordance with the laws of your jurisdiction.
    </p>

    <h3 className="text-lg font-semibold text-gray-900">10. Changes to Terms</h3>
    <p>
      We may update these Terms periodically. Changes take effect when posted on this page. Continued use after changes means you accept the updated Terms.
    </p>

    <h3 className="text-lg font-semibold text-gray-900">11. Contact Information</h3>
    <p>
      For questions or concerns regarding these Terms, contact us:
    </p>
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
  </div>
</Card>


    </div>
  );
}