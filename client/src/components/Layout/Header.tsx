import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Bell, User, LogOut, Settings, Briefcase, Lock, Menu, X } from 'lucide-react';

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

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMobileMenu(false);
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'super_admin':
        return '/admin';
      case 'employer':
        return '/employer';
      case 'job_seeker':
        return '/dashboard';
      default:
        return '/';
    }
  };

  const closeMobileMenu = () => setShowMobileMenu(false);

  return (
    <header 
      className="shadow-md border-b sticky top-0 z-50 backdrop-blur-md transition-all duration-300"
      style={{ 
        backgroundColor: COLORS.white,
        borderColor: COLORS.bg
      }}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: `${COLORS.light}20` }}
                />
                <Search className="h-6 w-6 sm:h-8 sm:w-8 relative z-10 transition-transform duration-300 group-hover:scale-110" style={{ color: COLORS.dark }} />
                <User className="h-3 w-3 sm:h-4 sm:w-4 absolute -top-1 -right-1 relative z-10" style={{ color: COLORS.medium }} />
              </div>
              <div>
                <span className="text-lg sm:text-2xl font-bold transition-colors duration-300" style={{ color: COLORS.dark }}>BAHATH</span>
                <span className="text-lg sm:text-2xl font-bold ml-0.5 sm:ml-1 transition-colors duration-300" style={{ color: COLORS.medium }}>JOBZ</span>
              </div>
            </div>
          </Link>
    
          {/* Desktop Navigation */}
          {!user && (
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {[
                { to: '/', label: 'Home' },
                { to: '/jobs', label: 'Find Jobs' },
                { to: '/blog', label: 'Blog' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
              ].map((item) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className="text-sm xl:text-base font-medium transition-all duration-300 relative group"
                  style={{ color: COLORS.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.medium;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = COLORS.text;
                  }}
                >
                  {item.label}
                  <span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: COLORS.medium }}
                  />
                </Link>
              ))}
            </nav>
          )}

          {user?.role === 'job_seeker' && (
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {[
                { to: '/dashboard', label: 'Home' },
                { to: '/jobs', label: 'Find Jobs' },
                { to: '/blog', label: 'Blog' },
                { to: '/about', label: 'About' },
                { to: '/contact', label: 'Contact' },
              ].map((item) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className="text-sm xl:text-base font-medium transition-all duration-300 relative group"
                  style={{ color: COLORS.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.medium;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = COLORS.text;
                  }}
                >
                  {item.label}
                  <span 
                    className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: COLORS.medium }}
                  />
                </Link>
              ))}
            </nav>
          )}

          {user?.role === 'employer' && (
            <nav className="hidden lg:flex items-center space-x-8">
            </nav>
          )}

          {user?.role === 'super_admin' && (
            <nav className="hidden lg:flex items-center space-x-8">
            </nav>
          )}

          {/* Right side - Desktop */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-1 sm:space-x-3 p-1.5 sm:p-2 rounded-lg transition-all duration-300"
                    style={{ 
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.bg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div 
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
                      style={{ 
                        background: `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.dark} 100%)`
                      }}
                    >
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span 
                      className="hidden sm:inline font-medium text-sm lg:text-base truncate max-w-[120px] lg:max-w-none"
                      style={{ color: COLORS.text }}
                    >
                      {user.firstName} {user.lastName}
                    </span>
                  </button>

                  {showProfileMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl border py-2 z-50 animate-fade-in"
                      style={{ 
                        backgroundColor: COLORS.white,
                        borderColor: COLORS.bg,
                        boxShadow: '0 10px 25px rgba(27, 60, 83, 0.15)'
                      }}
                    >
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center px-4 py-2.5 transition-all duration-200"
                        style={{ color: COLORS.text }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.bg;
                          e.currentTarget.style.color = COLORS.medium;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = COLORS.text;
                        }}
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Briefcase className="h-4 w-4 mr-3" style={{ color: COLORS.medium }} />
                        Dashboard
                      </Link>
                      {user?.role !== 'super_admin' && (
                        <Link
                          to={
                            user?.role === 'employer'
                              ? '/employer/profile'
                              : '/profile'
                          }
                          className="flex items-center px-4 py-2.5 transition-all duration-200"
                          style={{ color: COLORS.text }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.bg;
                            e.currentTarget.style.color = COLORS.medium;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = COLORS.text;
                          }}
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" style={{ color: COLORS.medium }} />
                          Profile
                        </Link>
                      )}
                      <Link
                        to="/auth/change-password"
                        className="flex items-center px-4 py-2.5 transition-all duration-200"
                        style={{ color: COLORS.text }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.bg;
                          e.currentTarget.style.color = COLORS.medium;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = COLORS.text;
                        }}
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Lock className="h-4 w-4 mr-3" style={{ color: COLORS.medium }} />
                        Change Password
                      </Link>
                      <hr style={{ borderColor: COLORS.bg }} className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 transition-all duration-200"
                        style={{ color: COLORS.text }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = COLORS.bg;
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = COLORS.text;
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
                  <Link
                    to="/auth/login"
                    className="text-sm lg:text-base font-medium transition-colors duration-300"
                    style={{ color: COLORS.text }}
                    onMouseEnter={(e) => e.currentTarget.style.color = COLORS.medium}
                    onMouseLeave={(e) => e.currentTarget.style.color = COLORS.text}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register?role=job_seeker"
                    className="text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg transition-all duration-300 text-xs lg:text-sm whitespace-nowrap font-semibold shadow-md hover:shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.dark} 100%)`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.medium} 100%)`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.dark} 100%)`;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Job Seeker
                  </Link>
                  <Link
                    to="/auth/register?role=employer"
                    className="text-white px-3 lg:px-5 py-2 lg:py-2.5 rounded-lg transition-all duration-300 text-xs lg:text-sm whitespace-nowrap font-semibold shadow-md hover:shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${COLORS.light} 0%, ${COLORS.medium} 100%)`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.light} 100%)`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.light} 0%, ${COLORS.medium} 100%)`;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Employer
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-lg transition-colors duration-300"
                  style={{ color: COLORS.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.medium;
                    e.currentTarget.style.backgroundColor = COLORS.bg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = COLORS.text;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            )}

            {/* Mobile Menu Button for logged in users */}
            {user && (user.role === 'job_seeker' || !user) && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg transition-colors duration-300"
                style={{ color: COLORS.text }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = COLORS.medium;
                  e.currentTarget.style.backgroundColor = COLORS.bg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = COLORS.text;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div 
            className="lg:hidden border-t py-4 animate-fade-in"
            style={{ 
              backgroundColor: COLORS.white,
              borderColor: COLORS.bg
            }}
          >
            <nav className="flex flex-col space-y-2">
              {!user && (
                <>
                  {[
                    { to: '/', label: 'Home' },
                    { to: '/jobs', label: 'Find Jobs' },
                    { to: '/blog', label: 'Blog' },
                    { to: '/about', label: 'About' },
                    { to: '/contact', label: 'Contact' },
                  ].map((item) => (
                    <Link 
                      key={item.to}
                      to={item.to} 
                      className="px-4 py-2.5 rounded-lg transition-all duration-200 font-medium"
                      style={{ color: COLORS.text }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.bg;
                        e.currentTarget.style.color = COLORS.medium;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = COLORS.text;
                      }}
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <hr style={{ borderColor: COLORS.bg }} className="my-2" />
                  <Link
                    to="/auth/login"
                    className="px-4 py-2.5 rounded-lg transition-all duration-200 font-medium"
                    style={{ color: COLORS.text }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.bg;
                      e.currentTarget.style.color = COLORS.medium;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = COLORS.text;
                    }}
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register?role=job_seeker"
                    className="text-white px-4 py-2.5 rounded-lg transition-all duration-200 text-center font-semibold shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.dark} 100%)`
                    }}
                    onClick={closeMobileMenu}
                  >
                    Sign Up - Job Seeker
                  </Link>
                  <Link
                    to="/auth/register?role=employer"
                    className="text-white px-4 py-2.5 rounded-lg transition-all duration-200 text-center font-semibold shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${COLORS.light} 0%, ${COLORS.medium} 100%)`
                    }}
                    onClick={closeMobileMenu}
                  >
                    Sign Up - Employer
                  </Link>
                </>
              )}
              {user?.role === 'job_seeker' && (
                <>
                  {[
                    { to: '/dashboard', label: 'Home' },
                    { to: '/jobs', label: 'Find Jobs' },
                    { to: '/blog', label: 'Blog' },
                    { to: '/about', label: 'About' },
                    { to: '/contact', label: 'Contact' },
                  ].map((item) => (
                    <Link 
                      key={item.to}
                      to={item.to} 
                      className="px-4 py-2.5 rounded-lg transition-all duration-200 font-medium"
                      style={{ color: COLORS.text }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.bg;
                        e.currentTarget.style.color = COLORS.medium;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = COLORS.text;
                      }}
                      onClick={closeMobileMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
