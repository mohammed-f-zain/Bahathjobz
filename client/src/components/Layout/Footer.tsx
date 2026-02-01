import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  User, 
  Mail, 
  Facebook, 
  Linkedin, 
  Instagram,
  Heart
} from 'lucide-react';

// Modern Color Palette from Color Hunt
const COLORS = {
  dark: '#1b3c53',      // Dark navy blue
  medium: '#234c6a',    // Medium blue
  light: '#456882',     // Light blue
  bg: '#e3e3e3',        // Light gray background
  white: '#ffffff',
  text: '#1f2937',
  textLight: '#6b7280',
};

export function Footer() {
  return (
    <footer 
      className="text-white"
      style={{ 
        background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.medium} 50%, ${COLORS.light} 100%)`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6 group">
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Search className="h-6 w-6 sm:h-8 sm:w-8 relative z-10 transition-transform duration-300 group-hover:scale-110" style={{ color: COLORS.white }} />
                <User className="h-3 w-3 sm:h-4 sm:w-4 absolute -top-1 -right-1 relative z-10" style={{ color: COLORS.bg }} />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.white }}>BAHATH</span>
                <span className="text-xl sm:text-2xl font-bold ml-1" style={{ color: COLORS.bg }}>JOBZ</span>
              </div>
            </Link>
            <p 
              className="mb-6 leading-relaxed text-sm sm:text-base"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Connecting talented professionals with their dream careers and helping companies 
              find the perfect candidates.
            </p>
            <div className="flex space-x-4">
              {[
                { 
                  icon: Facebook, 
                  href: 'https://www.facebook.com/profile.php?id=61583863352076', 
                  name: 'Facebook',
                  ariaLabel: 'Visit our Facebook page'
                },
                { 
                  icon: Linkedin, 
                  href: 'https://www.linkedin.com/company/105683846', 
                  name: 'LinkedIn',
                  ariaLabel: 'Visit our LinkedIn company page'
                },
                { 
                  icon: Instagram, 
                  href: 'https://www.instagram.com/bahathjobz/', 
                  name: 'Instagram',
                  ariaLabel: 'Visit our Instagram page'
                },
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    className="transition-all duration-300 p-2 rounded-lg hover:scale-110"
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = COLORS.white;
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 
              className="text-base sm:text-lg font-semibold mb-4 sm:mb-6"
              style={{ color: COLORS.white }}
            >
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm sm:text-base">
              {[
                { to: '/jobs', label: 'Find Jobs' },
                { to: '/blog', label: 'Career Blog' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="transition-all duration-300 inline-block relative group"
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = COLORS.white;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}
                  >
                    {link.label}
                    <span 
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: COLORS.bg }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Signup / Login */}
          <div>
            <h3 
              className="text-base sm:text-lg font-semibold mb-4 sm:mb-6"
              style={{ color: COLORS.white }}
            >
              Signup / Login
            </h3>
            <ul className="space-y-3 text-sm sm:text-base">
              <li>
                <Link 
                  to="/auth/register" 
                  className="transition-all duration-300 inline-block relative group"
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.white;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  Signup
                  <span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: COLORS.bg }}
                  />
                </Link>
              </li>
              <li>
                <Link 
                  to="/auth/login" 
                  className="transition-all duration-300 inline-block relative group"
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.white;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  Login
                  <span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: COLORS.bg }}
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 md:col-span-1">
            <h3 
              className="text-base sm:text-lg font-semibold mb-4 sm:mb-6"
              style={{ color: COLORS.white }}
            >
              Contact Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div 
                  className="p-2 rounded-lg transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <Mail className="h-4 w-4" style={{ color: COLORS.bg }} />
                </div>
                <a 
                  href="mailto:Inquiries@bahathjobz.com" 
                  className="transition-all duration-300 text-sm sm:text-base break-all"
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.white;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  Inquiries@bahathjobz.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          className="border-t mt-8 sm:mt-12 pt-6 sm:pt-8"
          style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              {[
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/cookies', label: 'Cookie Policy' },
              ].map((link, index, array) => (
                <React.Fragment key={link.to}>
                  <Link 
                    to={link.to} 
                    className="transition-all duration-300"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = COLORS.white;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    }}
                  >
                    {link.label}
                  </Link>
                  {index < array.length - 1 && (
                    <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <p 
              className="text-xs sm:text-sm text-center flex items-center gap-2"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              © 2025 BAHATH JOBZ. All rights reserved.
              <Heart className="h-3 w-3 inline" style={{ color: '#ef4444' }} />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
