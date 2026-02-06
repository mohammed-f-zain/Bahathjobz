import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  Star,
  ArrowRight
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

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Former HR executive with 15+ years in talent acquisition and career development.',
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Tech veteran who built scalable platforms for Fortune 500 companies.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Operations',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Operations expert focused on creating seamless user experiences.',
  },
  {
    name: 'David Park',
    role: 'Head of Marketing',
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Marketing strategist passionate about connecting talent with opportunities.',
  },
];

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'We exist to bridge the gap between talented individuals and great opportunities.',
  },
  {
    icon: Heart,
    title: 'People-First',
    description: 'Every decision we make prioritizes the success and well-being of our users.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from our platform to our support.',
  },
  {
    icon: TrendingUp,
    title: 'Innovation',
    description: 'We continuously innovate to stay ahead of industry trends and user needs.',
  },
];

const achievements = [
  { number: '50,000+', label: 'Job Seekers Helped' },
  { number: '2,500+', label: 'Partner Companies' },
  { number: '10,000+', label: 'Successful Placements' },
  { number: '95%', label: 'User Satisfaction' },
];

export function About() {
  const storyTextRef = useRef<HTMLDivElement | null>(null);
  const storyImageRef = useRef<HTMLDivElement | null>(null);
  const missionRef = useRef<HTMLDivElement | null>(null);
  const visionRef = useRef<HTMLDivElement | null>(null);
  const achievementsRef = useRef<HTMLDivElement | null>(null);
  const whyChooseRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const valueCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const achievementRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

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

    // Observe all sections
    observeElement(storyTextRef.current, 'storyText');
    observeElement(storyImageRef.current, 'storyImage');
    observeElement(missionRef.current, 'mission');
    observeElement(visionRef.current, 'vision');
    observeElement(achievementsRef.current, 'achievements');
    observeElement(whyChooseRef.current, 'whyChoose');
    observeElement(ctaRef.current, 'cta');

    // Use setTimeout to ensure refs are set after render
    const timeoutId = setTimeout(() => {
      // Observe value cards
      valueCardRefs.current.forEach((card, index) => {
        if (card) {
          observeElement(card, `value-${index}`);
        }
      });

      // Observe achievement items
      achievementRefs.current.forEach((item, index) => {
        if (item) {
          observeElement(item, `achievement-${index}`);
        }
      });
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div 
          className="rounded-2xl p-12 mb-16 text-white shadow-xl"
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.medium} 50%, ${COLORS.light} 100%)`
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">About BAHATH JOBZ</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              We're on a mission to revolutionize the job search experience by connecting 
              talented professionals with their dream careers and helping companies find 
              the perfect candidates.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              ref={storyTextRef}
              className={visibleSections.has('storyText') ? 'animate-slide-in-left' : 'opacity-0'}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: COLORS.dark }}>Our Story</h2>
              <div className="space-y-4" style={{ color: COLORS.textLight }}>
                <p>
                  BAHATH JOBZ was founded in 2023 with a simple yet powerful vision: to make 
                  job searching and hiring more efficient, transparent, and human-centered.
                </p>
                <p>
                  Our founders, having experienced the frustrations of traditional job boards 
                  firsthand, set out to create a platform that truly serves both job seekers 
                  and employers with equal dedication.
                </p>
                <p>
                  Today, we're proud to be a trusted partner for thousands of professionals 
                  and companies worldwide, facilitating meaningful connections that drive 
                  career growth and business success.
                </p>
              </div>
            </div>
            <div
              ref={storyImageRef}
              className={`relative ${visibleSections.has('storyImage') ? 'animate-slide-in-right' : 'opacity-0'}`}
            >
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
              <div 
                className="absolute -bottom-6 -right-6 text-white p-6 rounded-xl shadow-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.dark} 100%)`
                }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">2023</div>
                  <div className="text-sm">Founded</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              ref={missionRef}
              className={visibleSections.has('mission') ? 'animate-fade-in-up' : 'opacity-0'}
            >
            <div style={{ backgroundColor: COLORS.white }}>
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.medium}20 0%, ${COLORS.light}20 100%)`
                }}
              >
                <Target className="h-8 w-8" style={{ color: COLORS.medium }} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.dark }}>Our Mission</h3>
              <p style={{ color: COLORS.textLight }}>
                To empower professionals to find meaningful work and help companies 
                build exceptional teams through innovative technology and personalized support.
              </p>
            </Card>
            </div>
            </div>
            <div
              ref={visionRef}
              className={visibleSections.has('vision') ? 'animate-fade-in-up-delayed' : 'opacity-0'}
            >
            <div style={{ backgroundColor: COLORS.white }}>
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.light}20 0%, ${COLORS.medium}20 100%)`
                }}
              >
                <Star className="h-8 w-8" style={{ color: COLORS.light }} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.dark }}>Our Vision</h3>
              <p style={{ color: COLORS.textLight }}>
                To become the world's most trusted career platform, where every professional 
                can discover their potential and every company can find their perfect match.
              </p>
            </Card>
            </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ color: COLORS.dark }}>Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card 
                  key={index} 
                  className="p-6 text-center hover:shadow-xl transition-all duration-300 group"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ 
                      background: `linear-gradient(135deg, ${COLORS.medium}20 0%, ${COLORS.light}20 100%)`
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: COLORS.medium }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.dark }}>{value.title}</h3>
                  <p className="text-sm" style={{ color: COLORS.textLight }}>{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div 
          ref={achievementsRef}
          className="rounded-2xl p-12 mb-16 shadow-xl"
          style={{ backgroundColor: COLORS.white }}
        >
          <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-12 ${visibleSections.has('achievements') ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ color: COLORS.dark }}>Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const animationClass = index % 4 === 0 
                ? 'animate-fade-in-up' 
                : index % 4 === 1 
                ? 'animate-fade-in-up-delayed' 
                : index % 4 === 2 
                ? 'animate-fade-in-up-delayed-2' 
                : 'animate-fade-in-up-delayed-3';
              return (
              <div
                key={index}
                ref={(el) => {
                  if (el) {
                    achievementRefs.current[index] = el;
                  }
                }}
                className={`text-center ${visibleSections.has(`achievement-${index}`) ? animationClass : 'opacity-0'}`}
              >
                <div 
                  className="text-3xl sm:text-4xl font-bold mb-2"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.medium} 0%, ${COLORS.light} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {achievement.number}
                </div>
                <div style={{ color: COLORS.textLight }}>{achievement.label}</div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us */}
        <div
          ref={whyChooseRef}
          className={visibleSections.has('whyChoose') ? 'animate-fade-in-up' : 'opacity-0'}
        >
        <div style={{ backgroundColor: COLORS.white }}>
        <Card className="p-8 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8" style={{ color: COLORS.dark }}>Why Choose BAHATH JOBZ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                { title: 'Smart Matching', desc: 'AI-powered algorithms connect you with the most relevant opportunities.' },
                { title: 'Verified Companies', desc: 'All our partner companies are thoroughly vetted for legitimacy.' },
                { title: 'Career Support', desc: 'Get personalized career advice and interview preparation.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 mt-1 flex-shrink-0" style={{ color: COLORS.medium }} />
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: COLORS.dark }}>{item.title}</h4>
                    <p className="text-sm" style={{ color: COLORS.textLight }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                { title: 'Privacy First', desc: 'Your data is secure and never shared without your consent.' },
                { title: '24/7 Support', desc: 'Our dedicated support team is always here to help you succeed.' },
                { title: 'Free to Use', desc: 'Job seekers can access all features completely free of charge.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 mt-1 flex-shrink-0" style={{ color: COLORS.medium }} />
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: COLORS.dark }}>{item.title}</h4>
                    <p className="text-sm" style={{ color: COLORS.textLight }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        </div>
        </div>

        {/* CTA */}
        <div
          ref={ctaRef}
          className={`rounded-2xl p-12 text-center text-white shadow-xl ${visibleSections.has('cta') ? 'animate-fade-in-up' : 'opacity-0'}`}
          style={{ 
            background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.medium} 50%, ${COLORS.light} 100%)`
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of professionals who have found their dream careers with BAHATH JOBZ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs">
              <div
                className="px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
                style={{ 
                  backgroundColor: COLORS.white,
                  color: COLORS.dark
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.bg;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.white;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Users className="h-5 w-5 mr-2" />
                Find Jobs
              </div>
            </Link>
            <Link to="/auth/register?role=employer">
              <div
                className="px-6 py-3 rounded-lg font-semibold border-2 shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
                style={{ 
                  backgroundColor: 'transparent',
                  borderColor: COLORS.white,
                  color: COLORS.white
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = COLORS.white;
                  e.currentTarget.style.color = COLORS.dark;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = COLORS.white;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Post Jobs
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
