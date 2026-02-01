import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  Search,
  Heart,
  BookmarkIcon,
  User,
  Mail,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  // Super Admin Items
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['super_admin'],
  },
  {
    label: 'Job Seeker Management',
    href: '/admin/users',
    icon: Users,
    roles: ['super_admin'],
  },
  {
    label: 'Company & Employer Management',
    href: '/admin/employers',
    icon: Building2,
    roles: ['super_admin'],
  },
  {
    label: 'Job Moderation',
    href: '/admin/jobs',
    icon: Briefcase,
    roles: ['super_admin'],
  },
  {
    label: 'Blog Management',
    href: '/admin/blog',
    icon: FileText,
    roles: ['super_admin'],
  },
  {
    label: 'Contact Inquiries',
    href: '/admin/contact',
    icon: Mail,
    roles: ['super_admin'],
  },
  
  // Employer Items
  {
    label: 'Dashboard',
    href: '/employer',
    icon: LayoutDashboard,
    roles: ['employer'],
  },
  {
    label: 'Company Profile',
    href: '/employer/profile',
    icon: Building2,
    roles: ['employer'],
  },
  {
    label: 'Post Job',
    href: '/employer/post-job',
    icon: Briefcase,
    roles: ['employer'],
  },
  {
    label: 'My Jobs',
    href: '/employer/jobs',
    icon: FileText,
    roles: ['employer'],
  },
  {
    label: 'Blog Management',
    href: '/employer/blog',
    icon: FileText,
    roles: ['employer'],
  },
  {
    label: 'CV Search',
    href: '/employer/cv-search',
    icon: Search,
    roles: ['employer'],
  },
  {
    label: 'Applications',
    href: '/employer/applications',
    icon: Users,
    roles: ['employer'],
  },
  
  // Job Seeker Items
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['job_seeker'],
  },
  {
    label: 'Browse Jobs',
    href: '/jobs',
    icon: Search,
    roles: ['job_seeker'],
  },
  {
    label: 'My Applications',
    href: '/applications',
    icon: FileText,
    roles: ['job_seeker'],
  },
  {
    label: 'Saved Jobs',
    href: '/saved-jobs',
    icon: BookmarkIcon,
    roles: ['job_seeker'],
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
    roles: ['job_seeker'],
  },
  {
    label: 'Contact Inquiries',
    href: '/contacts/my-contacts',
    icon: Mail,
    roles: ['job_seeker'],
  },
];

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const userSidebarItems = sidebarItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        fixed lg:sticky top-0 lg:top-0 left-0 h-screen z-40
        bg-white border-r border-gray-200 
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto overflow-x-hidden
      `}>
        {/* Collapse Toggle - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 z-10"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>

        <div className={`p-4 ${isCollapsed ? 'lg:p-2' : 'lg:p-6'} w-full`}>
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <span className="font-semibold text-gray-900">Menu</span>
            <button onClick={() => setIsOpen(false)} className="p-1">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <nav className="space-y-1 lg:space-y-2 w-full">
            {userSidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center ${isCollapsed ? 'lg:justify-center' : 'space-x-3'} px-3 py-2.5 rounded-lg transition-colors w-full min-w-0 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`font-medium text-sm ${isCollapsed ? 'lg:hidden' : ''} truncate`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}