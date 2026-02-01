import React from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';

export function CookiePolicy() {
  return (
    <div className="p-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Cookie Policy BAHATH JOBZ</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
           Cookies on Bahath Jobz: What they are and how we use them.
          </p>
        </div>  
      </div>

        <Card className="max-w-6xl mx-auto p-8 mb-16">
        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            <p><strong>Last updated:</strong> 2025-01-01</p>

            <p>
            Bahath Jobz (“we”, “our”, “us”) uses cookies and similar technologies on our website
            <a href="https://bahathjobz.com" className="text-blue-600 hover:underline ml-1">
                https://bahathjobz.com
            </a> to improve user experience, analyze usage, and provide relevant content. This Cookie Policy explains what cookies are, how we use them, and your choices.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">1. What are Cookies</h3>
            <p>
            Cookies are small text files placed on your device by websites you visit. They help the website remember you and your preferences, improving your experience on future visits.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">2. Types of Cookies We Use</h3>
            <ul className="list-disc list-inside space-y-2">
            <li><strong>Essential / Strictly Necessary:</strong> Required for site operation, login sessions, security, etc.</li>
            <li><strong>Functional:</strong> For preferences like language, theme settings, etc.</li>
            <li><strong>Performance / Analytics:</strong> To collect data on site usage for improvement.</li>
            <li><strong>Marketing / Advertising:</strong> To show relevant content or ads, track effectiveness of ads.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900">3. How We Use Cookies</h3>
            <ul className="list-disc list-inside space-y-2">
            <li>To securely operate the Site and protect users</li>
            <li>To remember your preferences and personalize your experience</li>
            <li>To analyze how the Site is used and improve its performance</li>
            <li>To deliver relevant content / ads (where applicable)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900">4. Third‑Party Cookies</h3>
            <p>
            Some cookies are set by third parties (analytics, advertising partners). Those third parties set their own cookies and follow their own policies.
            </p>

            <h3 className="text-lg font-semibold text-gray‑900">5. Your Cookie Choices</h3>
            <p>
            You can manage your cookie preferences via browser settings, by using any cookie consent banner on our site, or deleting cookies. Note: Disabling essential cookies may limit or disable some features of the Site.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">6. Data Retention</h3>
            <p>
            We keep cookie information only as long as needed to fulfill the purposes described. Cookies may expire or be deleted earlier by you.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">7. Changes to This Policy</h3>
            <p>
            We may update this Cookie Policy over time. We will post changes on this page with an updated date. Using the Site after updates means you accept them.
            </p>

            <h3 className="text-lg font-semibold text-gray-900">8. Contact Us</h3>
            <p>
            If you have any questions about this Cookie Policy:
            <br />
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