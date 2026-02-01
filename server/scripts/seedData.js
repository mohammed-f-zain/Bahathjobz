import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

async function seedData() {
  console.log('Seeding database...');

  try {
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Insert Super Admin
    await prisma.user.upsert({
      where: { email: 'admin@bahathjobz.com' },
      update: {},
      create: {
        id: 'admin1',
        email: 'admin@bahathjobz.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin'
      }
    });

    // Insert Employers
    await prisma.user.upsert({
      where: { email: 'employer@techcorp.com' },
      update: {},
      create: {
        id: 'emp1',
        email: 'employer@techcorp.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1234567890',
        role: 'employer'
      }
    });

    await prisma.user.upsert({
      where: { email: 'employer2@example.com' },
      update: {},
      create: {
        id: 'emp2',
        email: 'employer2@example.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1234567891',
        role: 'employer'
      }
    });

    // Insert Job Seekers
    await prisma.user.upsert({
      where: { email: 'jobseeker@example.com' },
      update: {},
      create: {
        id: 'seeker1',
        email: 'jobseeker@example.com',
        password: hashedPassword,
        firstName: 'Alice',
        lastName: 'Williams',
        phone: '+1234567892',
        role: 'job_seeker'
      }
    });

    await prisma.user.upsert({
      where: { email: 'jobseeker2@example.com' },
      update: {},
      create: {
        id: 'seeker2',
        email: 'jobseeker2@example.com',
        password: hashedPassword,
        firstName: 'Bob',
        lastName: 'Brown',
        phone: '+1234567893',
        role: 'job_seeker'
      }
    });

    await prisma.user.upsert({
      where: { email: 'jobseeker3@example.com' },
      update: {},
      create: {
        id: 'seeker3',
        email: 'jobseeker3@example.com',
        password: hashedPassword,
        firstName: 'Charlie',
        lastName: 'Davis',
        phone: '+1234567894',
        role: 'job_seeker'
      }
    });

    // Insert Companies
    await prisma.company.upsert({
      where: { id: 'comp1' },
      update: {},
      create: {
        id: 'comp1',
        name: 'TechCorp Solutions',
        tagline: 'Innovative technology solutions for modern businesses',
        description: 'TechCorp Solutions is a leading technology company specializing in software development, cloud infrastructure, and digital transformation services.',
        industry: 'Technology',
        website: 'https://techcorp.example.com',
        location: 'San Francisco, CA',
        contactEmail: 'contact@techcorp.example.com',
        contactPhone: '+1-555-123-4567',
        isApproved: true,
        employerId: 'emp1'
      }
    });

    await prisma.company.upsert({
      where: { id: 'comp2' },
      update: {},
      create: {
        id: 'comp2',
        name: 'Creative Agency Inc',
        tagline: 'Where creativity meets innovation',
        description: 'Creative Agency Inc is a full-service digital agency that helps brands tell their story through compelling design and strategic marketing.',
        industry: 'Marketing & Advertising',
        website: 'https://creative-agency.example.com',
        location: 'New York, NY',
        contactEmail: 'hello@creative-agency.example.com',
        contactPhone: '+1-555-987-6543',
        isApproved: true,
        employerId: 'emp2'
      }
    });

    // Insert Jobs
    await prisma.job.upsert({
      where: { id: 'job1' },
      update: {},
      create: {
        id: 'job1',
        title: 'Senior Frontend Developer',
        description: 'We are looking for a talented Senior Frontend Developer to join our growing engineering team. You will be responsible for building modern, responsive web applications using React and TypeScript.',
        responsibilities: 'Develop and maintain frontend applications\nCollaborate with design and backend teams\nWrite clean, maintainable code\nMentor junior developers\nOptimize application performance',
        requirements: 'Bachelor\'s degree in Computer Science or related field\n5+ years of experience with React and TypeScript\nProficiency in modern JavaScript (ES6+)\nExperience with state management (Redux, Zustand)\nKnowledge of testing frameworks (Jest, Cypress)\nFamiliarity with version control (Git)',
        benefits: 'Competitive salary and equity package\nHealth, dental, and vision insurance\nFlexible work hours and remote options\nProfessional development budget\n401(k) matching\nModern office with great snacks',
        location: 'San Francisco, CA',
        workType: 'hybrid',
        industry: 'Technology',
        education: 'Bachelor\'s Degree',
        visaEligible: true,
        seniority: 'senior',
        salaryMin: 120000,
        salaryMax: 150000,
        currency: 'USD',
        isApproved: true,
        companyId: 'comp1',
        employerId: 'emp1'
      }
    });

    await prisma.job.upsert({
      where: { id: 'job2' },
      update: {},
      create: {
        id: 'job2',
        title: 'Product Manager',
        description: 'Join our product team as a Product Manager to drive the development of innovative features that delight our customers. You\'ll work cross-functionally to define product strategy and roadmap.',
        responsibilities: 'Define product vision and strategy\nWork with engineering and design teams\nConduct market research and user interviews\nManage product roadmap and priorities\nAnalyze product metrics and user feedback\nCoordinate product launches',
        requirements: 'Bachelor\'s degree in Business, Engineering, or related field\n3+ years of product management experience\nExperience with Agile methodologies\nStrong analytical and communication skills\nExperience with product analytics tools\nTechnical background preferred',
        benefits: 'Competitive salary and bonuses\nStock options\nHealth and wellness benefits\nFlexible PTO policy\nLearning and development opportunities\nRemote work flexibility',
        location: 'Remote',
        workType: 'remote',
        industry: 'Technology',
        education: 'Bachelor\'s Degree',
        visaEligible: true,
        seniority: 'mid',
        salaryMin: 100000,
        salaryMax: 130000,
        currency: 'USD',
        isApproved: true,
        companyId: 'comp1',
        employerId: 'emp1'
      }
    });

    await prisma.job.upsert({
      where: { id: 'job3' },
      update: {},
      create: {
        id: 'job3',
        title: 'Creative Director',
        description: 'Lead our creative team and oversee the development of brand campaigns, digital experiences, and marketing materials for our diverse client portfolio.',
        responsibilities: 'Lead and inspire the creative team\nDevelop creative strategies for client campaigns\nOversee design and copy development\nPresent concepts to clients\nManage multiple projects simultaneously\nStay current with design trends and technologies',
        requirements: 'Bachelor\'s degree in Design, Marketing, or related field\n7+ years of creative leadership experience\nProficiency in Adobe Creative Suite\nStrong portfolio of creative work\nExcellent presentation and communication skills\nExperience managing creative teams',
        benefits: 'Competitive salary\nCreative freedom and autonomy\nHealth and dental insurance\nPaid time off and holidays\nProfessional development opportunities\nInspiring work environment',
        location: 'New York, NY',
        workType: 'onsite',
        industry: 'Marketing & Advertising',
        education: 'Bachelor\'s Degree',
        visaEligible: false,
        seniority: 'senior',
        salaryMin: 90000,
        salaryMax: 120000,
        currency: 'USD',
        isApproved: true,
        companyId: 'comp2',
        employerId: 'emp2'
      }
    });

    // Insert Job Seeker Profiles
    await prisma.jobSeeker.upsert({
      where: { userId: 'seeker1' },
      update: {},
      create: {
        id: 'profile1',
        userId: 'seeker1',
        summary: 'Passionate frontend developer with 4 years of experience building modern web applications. Love working with React, TypeScript, and creating beautiful user interfaces.',
        availability: 'Immediately',
        education: 'Bachelor\'s in Computer Science',
        experience: '4 years of frontend development experience',
        skills: JSON.stringify(['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Node.js', 'Git']),
        location: 'San Francisco, CA',
        visaStatus: 'Citizen',
        portfolioUrl: 'https://alicewilliams.dev',
        linkedinUrl: 'https://linkedin.com/in/alicewilliams'
      }
    });

    await prisma.jobSeeker.upsert({
      where: { userId: 'seeker2' },
      update: {},
      create: {
        id: 'profile2',
        userId: 'seeker2',
        summary: 'Full-stack developer with expertise in both frontend and backend technologies. Experienced in building scalable web applications and RESTful APIs.',
        availability: '2 weeks notice',
        education: 'Master\'s in Software Engineering',
        experience: '6 years of full-stack development experience',
        skills: JSON.stringify(['JavaScript', 'Python', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS']),
        location: 'Austin, TX',
        visaStatus: 'H1B',
        portfolioUrl: 'https://bobbrown.dev',
        linkedinUrl: 'https://linkedin.com/in/bobbrown'
      }
    });

    // Insert some sample applications
    await prisma.jobApplication.upsert({
      where: {
        jobId_jobSeekerId: {
          jobId: 'job1',
          jobSeekerId: 'seeker1'
        }
      },
      update: {},
      create: {
        id: 'app1',
        jobId: 'job1',
        jobSeekerId: 'seeker1',
        coverNote: 'I am very excited about this opportunity to work with TechCorp Solutions. My experience with React and TypeScript aligns perfectly with your requirements.',
        status: 'under_review'
      }
    });

    await prisma.jobApplication.upsert({
      where: {
        jobId_jobSeekerId: {
          jobId: 'job2',
          jobSeekerId: 'seeker2'
        }
      },
      update: {},
      create: {
        id: 'app2',
        jobId: 'job2',
        jobSeekerId: 'seeker2',
        coverNote: 'I believe my full-stack experience and product mindset would be valuable for this Product Manager role.',
        status: 'shortlisted'
      }
    });

    // Insert some sample engagements
    await prisma.engagement.upsert({
      where: { id: 'eng1' },
      update: {},
      create: {
        id: 'eng1',
        jobId: 'job1',
        userId: 'seeker1',
        type: 'like'
      }
    });

    await prisma.engagement.upsert({
      where: { id: 'eng2' },
      update: {},
      create: {
        id: 'eng2',
        jobId: 'job1',
        userId: 'seeker2',
        type: 'favorite'
      }
    });

    await prisma.engagement.upsert({
      where: { id: 'eng3' },
      update: {},
      create: {
        id: 'eng3',
        jobId: 'job2',
        userId: 'seeker1',
        type: 'comment',
        content: 'This looks like a great opportunity! The company culture seems amazing.'
      }
    });

    // Insert sample blog posts
    await prisma.blogPost.upsert({
      where: { slug: 'top-10-interview-tips-for-software-engineers' },
      update: {},
      create: {
        id: 'blog1',
        title: 'Top 10 Interview Tips for Software Engineers',
        slug: 'top-10-interview-tips-for-software-engineers',
        excerpt: 'Master your next technical interview with these proven strategies from industry experts.',
        content: `<p>Landing your dream job as a software engineer requires more than just technical skills. The interview process can be challenging, but with the right preparation and mindset, you can significantly increase your chances of success.</p>

<h2>1. Master the Fundamentals</h2>
<p>Before diving into complex algorithms, ensure you have a solid understanding of basic programming concepts. Review data structures like arrays, linked lists, stacks, queues, trees, and graphs. Practice implementing these from scratch.</p>

<h2>2. Practice Coding Problems Daily</h2>
<p>Consistency is key when it comes to coding interviews. Dedicate at least 30-60 minutes daily to solving problems on platforms like LeetCode, HackerRank, or CodeSignal. Focus on understanding patterns rather than memorizing solutions.</p>

<h2>3. Understand System Design Basics</h2>
<p>For senior positions, system design questions are common. Learn about scalability, load balancing, databases, caching, and microservices architecture. Practice designing systems like Twitter, Instagram, or Uber.</p>

<h2>Conclusion</h2>
<p>Remember, interviews are a two-way street. While the company is evaluating you, you should also be assessing whether the role and company align with your career goals. Stay confident, be authentic, and showcase your passion for technology.</p>`,
        category: 'Career Tips',
        authorId: 'admin1',
        isPublished: true,
        isFeatured: true,
        views: 1234,
        likes: 89,
        publishedAt: new Date('2025-01-08T10:00:00Z')
      }
    });

    await prisma.blogPost.upsert({
      where: { slug: 'remote-work-building-productive-home-office' },
      update: {},
      create: {
        id: 'blog2',
        title: 'Remote Work: Building a Productive Home Office',
        slug: 'remote-work-building-productive-home-office',
        excerpt: 'Create the perfect workspace that boosts productivity and maintains work-life balance.',
        content: `<p>The shift to remote work has transformed how we approach our professional lives. Creating an effective home office setup is crucial for maintaining productivity, focus, and work-life balance.</p>

<h2>Choosing the Right Space</h2>
<p>Select a dedicated area in your home that can serve as your primary workspace. Ideally, this should be a quiet corner or room with minimal distractions.</p>

<h2>Investing in Quality Equipment</h2>
<p>Your workspace setup directly impacts your productivity and health. Invest in a comfortable ergonomic chair, a desk at the right height, and proper lighting.</p>

<h2>Creating Boundaries</h2>
<p>Establish clear boundaries between work and personal time. Set specific work hours and communicate them to family members or roommates.</p>`,
        category: 'Remote Work',
        authorId: 'admin1',
        isPublished: true,
        isFeatured: false,
        views: 987,
        likes: 67,
        publishedAt: new Date('2025-01-06T10:00:00Z')
      }
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seedData();