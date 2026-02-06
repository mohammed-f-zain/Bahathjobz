import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  CheckCircle,
  HelpCircle,
  Users,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

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

const inquiryTypes = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'job_seeker', label: 'Job Seeker Support' },
  { value: 'employer', label: 'Employer Support' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'partnership', label: 'Partnership Opportunity' },
  { value: 'feedback', label: 'Feedback & Suggestions' },
];

const employerInquiryTypes = [
  { value: 'technical', label: 'Technical Issue' },
  { value: 'support', label: 'Support' },
  { value: 'assign_recruiter', label: 'Assign a recruiter' },
  { value: 'branding', label: 'Branding' },
  { value: 'other', label: 'Other' },
];

const jobSeekerInquiryTypes = [
  { value: 'technical', label: 'Technical Issue' },
  { value: 'support', label: 'Support' },
  { value: 'cv_writing', label: 'CV writing ATS' },
  { value: 'career_coaching', label: 'Career coaching' },
  { value: 'other', label: 'Other' },
];

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Send us an email and we\'ll respond within 24 hours',
    contact: 'Inquiries@bahathjobz.com',
    action: 'mailto:Inquiries@bahathjobz.com',
  },
];

const faqs = [
  {
    question: 'How do I create an account?',
    answer: 'Click on "Sign Up" in the top right corner and choose whether you\'re a job seeker or employer. Fill out the required information and verify your email address.',
  },
  {
    question: 'Is BAHATH JOBZ free to use?',
    answer: 'Yes! Job seekers can use all features completely free. Employers have access to basic features for free, with premium options available for enhanced visibility and advanced tools.',
  },
  {
    question: 'How do I apply for jobs?',
    answer: 'Browse jobs, click on any position that interests you, and click "Apply Now". You can include a cover note and your resume will be automatically attached from your profile.',
  },
  {
    question: 'Can I edit my application after submitting?',
    answer: 'Once submitted, applications cannot be edited. However, you can contact the employer directly or reach out to our support team for assistance.',
  },
];

export function Contact() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiry_type: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const supportCategoriesRef = useRef<HTMLDivElement>(null);
  const [isSupportCategoriesVisible, setIsSupportCategoriesVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const methodsRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Small delay to ensure animation retriggers
            setTimeout(() => {
              setIsSupportCategoriesVisible(true);
            }, 10);
          } else {
            setIsSupportCategoriesVisible(false);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    if (supportCategoriesRef.current) {
      observer.observe(supportCategoriesRef.current);
    }

    return () => {
      if (supportCategoriesRef.current) {
        observer.unobserve(supportCategoriesRef.current);
      }
    };
  }, []);

  // Scroll-triggered animations for main sections
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const observeElement = (
      element: HTMLElement | null,
      sectionName: string
    ) => {
      if (!element) return;

      // Check if already in viewport
      const rect = element.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      if (isInViewport) {
        setVisibleSections((prev) => new Set([...prev, sectionName]));
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                setVisibleSections((prev) => new Set([...prev, sectionName]));
              }, 10);
            } else {
              setVisibleSections((prev) => {
                const newSet = new Set(prev);
                newSet.delete(sectionName);
                return newSet;
              });
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -100px 0px',
        }
      );

      observer.observe(element);
      observers.push(observer);
    };

    observeElement(heroRef.current, 'hero');
    observeElement(methodsRef.current, 'methods');
    observeElement(formRef.current, 'form');
    observeElement(faqRef.current, 'faq');

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);
  
  const getInquiryTypes = () => {
    if (user?.role === 'employer') {
      return employerInquiryTypes;
    }
    if (user?.role === 'job_seeker') {
      return jobSeekerInquiryTypes;
    }
    return inquiryTypes;
  };

  const currentInquiryTypes = getInquiryTypes();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          priority: 'medium', 
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        inquiry_type: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast.error(error.message || 'Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div 
          ref={heroRef}
          className={`rounded-2xl p-12 mb-12 text-white shadow-xl ${visibleSections.has('hero') ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.medium} 50%, ${COLORS.light} 100%)`
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-white/90">
              We're here to help! Reach out to us with any questions, concerns, or feedback.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Methods */}
            <div
              ref={methodsRef}
              className={`lg:col-span-1 lg:sticky lg:top-4 lg:self-start ${visibleSections.has('methods') ? 'animate-fade-in-up' : 'opacity-0'}`}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.dark }}>Get in Touch</h2>
              <div className="space-y-4">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <Card 
                      key={index} 
                      className="p-6 hover:shadow-xl transition-all duration-300 group"
                      style={{ backgroundColor: COLORS.white }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        <div 
                          className="p-3 rounded-full transition-all duration-300 group-hover:scale-110"
                          style={{ 
                            background: `linear-gradient(135deg, ${COLORS.medium}20 0%, ${COLORS.light}20 100%)`
                          }}
                        >
                          <Icon className="h-6 w-6" style={{ color: COLORS.medium }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1" style={{ color: COLORS.dark }}>{method.title}</h3>
                          <p className="text-sm mb-2" style={{ color: COLORS.textLight }}>{method.description}</p>
                          <a
                            href={method.action}
                            className="font-medium transition-colors duration-300"
                            style={{ color: COLORS.medium }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = COLORS.light;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = COLORS.medium;
                            }}
                          >
                            {method.contact}
                          </a>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Contact Form */}
            <div
              ref={formRef}
              className={`lg:col-span-2 ${visibleSections.has('form') ? 'animate-fade-in-up-delayed' : 'opacity-0'}`}
            >
              <Card className="p-8" style={{ backgroundColor: COLORS.white }}>
                <h2 className="text-2xl font-bold mb-6" style={{ color: COLORS.dark }}>Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Inquiry Type"
                      name="inquiry_type"
                      options={currentInquiryTypes}
                      value={formData.inquiry_type}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief subject line"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{ 
                        borderColor: COLORS.bg,
                        color: COLORS.text
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = COLORS.medium;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.medium}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = COLORS.bg;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Please describe your inquiry in detail..."
                      required
                    />
                  </div>
                  
                  <div className=" mt-8 sm:mt-12 animate-fade-in w-full md:w-[30%] mx-auto">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full"
                    variant="cta"
                  >
                    {loading ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div
            ref={faqRef}
            className={`mb-12 ${visibleSections.has('faq') ? 'animate-fade-in-up' : 'opacity-0'}`}
          >
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: COLORS.dark }}>Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <Card 
                  key={index} 
                  className="p-6 hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: COLORS.white }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <h3 className="font-semibold mb-3 flex items-start" style={{ color: COLORS.dark }}>
                    <HelpCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: COLORS.medium }} />
                    {faq.question}
                  </h3>
                  <p className="ml-7" style={{ color: COLORS.textLight }}>{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Support Categories */}
          <div 
            ref={supportCategoriesRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <Card 
              className={`p-6 text-center hover:shadow-xl transition-all duration-300 group ${
                isSupportCategoriesVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ backgroundColor: COLORS.white }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.medium}20 0%, ${COLORS.light}20 100%)`
                }}
              >
                <Users className="h-8 w-8" style={{ color: COLORS.medium }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.dark }}>Job Seekers</h3>
              <p className="text-sm mb-4" style={{ color: COLORS.textLight }}>
                Get help with your profile, applications, and job search strategy.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                
              >
                Job Seeker Help
              </Button>
            </Card>

            <Card 
              className={`p-6 text-center hover:shadow-xl transition-all duration-300 group ${
                isSupportCategoriesVisible ? 'animate-fade-in-up-delayed' : 'opacity-0'
              }`}
              style={{ backgroundColor: COLORS.white }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.light}20 0%, ${COLORS.medium}20 100%)`
                }}
              >
                <Briefcase className="h-8 w-8" style={{ color: COLORS.light }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.dark }}>Employers</h3>
              <p className="text-sm mb-4" style={{ color: COLORS.textLight }}>
                Support for posting jobs, managing applications, and finding talent.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                style={{ 
                  borderColor: COLORS.light,
                  color: COLORS.light
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.light;
                  e.currentTarget.style.color = COLORS.white;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = COLORS.light;
                }}
              >
                Employer Help
              </Button>
            </Card>

            <Card 
              className={`p-6 text-center hover:shadow-xl transition-all duration-300 group ${
                isSupportCategoriesVisible ? 'animate-fade-in-up-delayed-2' : 'opacity-0'
              }`}
              style={{ backgroundColor: COLORS.white }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.medium}20 0%, ${COLORS.dark}20 100%)`
                }}
              >
                <CheckCircle className="h-8 w-8" style={{ color: COLORS.dark }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.dark }}>Technical Support</h3>
              <p className="text-sm mb-4" style={{ color: COLORS.textLight }}>
                Having technical issues? Our tech team is here to help.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                style={{ 
                  borderColor: COLORS.dark,
                  color: COLORS.dark
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.dark;
                  e.currentTarget.style.color = COLORS.white;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = COLORS.dark;
                }}
              >
                Technical Help
              </Button>
            </Card>
          </div>        
        </div>
      </div>
    </div>
  );
}
