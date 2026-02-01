import bcrypt from 'bcryptjs';
import db from '../database/database.js';

async function seedData() {
  console.log('Seeding database...');

  try {
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Insert Super Admin
    const adminStmt = db.prepare(`
      INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    adminStmt.run('admin1', 'admin@bahathjobz.com', hashedPassword, 'Super', 'Admin', 'super_admin');

    // Insert Employers
    const employerStmt = db.prepare(`
      INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, phone, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    employerStmt.run('emp1', 'employer@techcorp.com', hashedPassword, 'John', 'Smith', '+1234567890', 'employer');
    employerStmt.run('emp2', 'employer2@example.com', hashedPassword, 'Sarah', 'Johnson', '+1234567891', 'employer');

    // Insert Job Seekers
    const seekerStmt = db.prepare(`
      INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, phone, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    seekerStmt.run('seeker1', 'jobseeker@example.com', hashedPassword, 'Alice', 'Williams', '+1234567892', 'job_seeker');
    seekerStmt.run('seeker2', 'jobseeker2@example.com', hashedPassword, 'Bob', 'Brown', '+1234567893', 'job_seeker');
    seekerStmt.run('seeker3', 'jobseeker3@example.com', hashedPassword, 'Charlie', 'Davis', '+1234567894', 'job_seeker');

    // Insert Companies
    const companyStmt = db.prepare(`
      INSERT OR IGNORE INTO companies (
        id, name, tagline, description, industry, website, location,
        contact_email, contact_phone, is_approved, employer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    companyStmt.run(
      'comp1',
      'TechCorp Solutions',
      'Innovative technology solutions for modern businesses',
      'TechCorp Solutions is a leading technology company specializing in software development, cloud infrastructure, and digital transformation services.',
      'Technology',
      'https://techcorp.example.com',
      'San Francisco, CA',
      'contact@techcorp.example.com',
      '+1-555-123-4567',
      1,
      'emp1'
    );

    companyStmt.run(
      'comp2',
      'Creative Agency Inc',
      'Where creativity meets innovation',
      'Creative Agency Inc is a full-service digital agency that helps brands tell their story through compelling design and strategic marketing.',
      'Marketing & Advertising',
      'https://creative-agency.example.com',
      'New York, NY',
      'hello@creative-agency.example.com',
      '+1-555-987-6543',
      1,
      'emp2'
    );

    // Insert Jobs
    const jobStmt = db.prepare(`
      INSERT OR IGNORE INTO jobs (
        id, title, description, responsibilities, requirements, benefits,
        location, work_type, industry, education, visa_eligible, seniority,
        salary_min, salary_max, currency, is_approved, company_id, employer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    jobStmt.run(
      'job1',
      'Senior Frontend Developer',
      'We are looking for a talented Senior Frontend Developer to join our growing engineering team. You will be responsible for building modern, responsive web applications using React and TypeScript.',
      'Develop and maintain frontend applications\nCollaborate with design and backend teams\nWrite clean, maintainable code\nMentor junior developers\nOptimize application performance',
      'Bachelor\'s degree in Computer Science or related field\n5+ years of experience with React and TypeScript\nProficiency in modern JavaScript (ES6+)\nExperience with state management (Redux, Zustand)\nKnowledge of testing frameworks (Jest, Cypress)\nFamiliarity with version control (Git)',
      'Competitive salary and equity package\nHealth, dental, and vision insurance\nFlexible work hours and remote options\nProfessional development budget\n401(k) matching\nModern office with great snacks',
      'San Francisco, CA',
      'hybrid',
      'Technology',
      'Bachelor\'s Degree',
      1,
      'senior',
      120000,
      150000,
      'USD',
      1,
      'comp1',
      'emp1'
    );

    jobStmt.run(
      'job2',
      'Product Manager',
      'Join our product team as a Product Manager to drive the development of innovative features that delight our customers. You\'ll work cross-functionally to define product strategy and roadmap.',
      'Define product vision and strategy\nWork with engineering and design teams\nConduct market research and user interviews\nManage product roadmap and priorities\nAnalyze product metrics and user feedback\nCoordinate product launches',
      'Bachelor\'s degree in Business, Engineering, or related field\n3+ years of product management experience\nExperience with Agile methodologies\nStrong analytical and communication skills\nExperience with product analytics tools\nTechnical background preferred',
      'Competitive salary and bonuses\nStock options\nHealth and wellness benefits\nFlexible PTO policy\nLearning and development opportunities\nRemote work flexibility',
      'Remote',
      'remote',
      'Technology',
      'Bachelor\'s Degree',
      1,
      'mid',
      100000,
      130000,
      'USD',
      1,
      'comp1',
      'emp1'
    );

    jobStmt.run(
      'job3',
      'Creative Director',
      'Lead our creative team and oversee the development of brand campaigns, digital experiences, and marketing materials for our diverse client portfolio.',
      'Lead and inspire the creative team\nDevelop creative strategies for client campaigns\nOversee design and copy development\nPresent concepts to clients\nManage multiple projects simultaneously\nStay current with design trends and technologies',
      'Bachelor\'s degree in Design, Marketing, or related field\n7+ years of creative leadership experience\nProficiency in Adobe Creative Suite\nStrong portfolio of creative work\nExcellent presentation and communication skills\nExperience managing creative teams',
      'Competitive salary\nCreative freedom and autonomy\nHealth and dental insurance\nPaid time off and holidays\nProfessional development opportunities\nInspiring work environment',
      'New York, NY',
      'onsite',
      'Marketing & Advertising',
      'Bachelor\'s Degree',
      0,
      'senior',
      90000,
      120000,
      'USD',
      1,
      'comp2',
      'emp2'
    );

    // Insert Job Seeker Profiles
    const profileStmt = db.prepare(`
      INSERT OR IGNORE INTO job_seekers (
        id, user_id, summary, availability, education, experience, skills,
        location, visa_status, portfolio_url, linkedin_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    profileStmt.run(
      'profile1',
      'seeker1',
      'Passionate frontend developer with 4 years of experience building modern web applications. Love working with React, TypeScript, and creating beautiful user interfaces.',
      'Immediately',
      'Bachelor\'s in Computer Science',
      '4 years of frontend development experience',
      JSON.stringify(['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Node.js', 'Git']),
      'San Francisco, CA',
      'Citizen',
      'https://alicewilliams.dev',
      'https://linkedin.com/in/alicewilliams'
    );

    profileStmt.run(
      'profile2',
      'seeker2',
      'Full-stack developer with expertise in both frontend and backend technologies. Experienced in building scalable web applications and RESTful APIs.',
      '2 weeks notice',
      'Master\'s in Software Engineering',
      '6 years of full-stack development experience',
      JSON.stringify(['JavaScript', 'Python', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS']),
      'Austin, TX',
      'H1B',
      'https://bobbrown.dev',
      'https://linkedin.com/in/bobbrown'
    );

    // Insert some sample applications
    const applicationStmt = db.prepare(`
      INSERT OR IGNORE INTO job_applications (id, job_id, job_seeker_id, cover_note, status)
      VALUES (?, ?, ?, ?, ?)
    `);

    applicationStmt.run(
      'app1',
      'job1',
      'seeker1',
      'I am very excited about this opportunity to work with TechCorp Solutions. My experience with React and TypeScript aligns perfectly with your requirements.',
      'under_review'
    );

    applicationStmt.run(
      'app2',
      'job2',
      'seeker2',
      'I believe my full-stack experience and product mindset would be valuable for this Product Manager role.',
      'shortlisted'
    );

    // Insert some sample engagements
    const engagementStmt = db.prepare(`
      INSERT OR IGNORE INTO engagements (id, job_id, user_id, type, content)
      VALUES (?, ?, ?, ?, ?)
    `);

    engagementStmt.run('eng1', 'job1', 'seeker1', 'like', null);
    engagementStmt.run('eng2', 'job1', 'seeker2', 'favorite', null);
    engagementStmt.run('eng3', 'job2', 'seeker1', 'comment', 'This looks like a great opportunity! The company culture seems amazing.');

    // Insert sample blog posts
    const blogStmt = db.prepare(`
      INSERT OR IGNORE INTO blog_posts (
        id, title, slug, excerpt, content, category, author_id, 
        is_published, is_featured, views, likes, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    blogStmt.run(
      'blog1',
      'Top 10 Interview Tips for Software Engineers',
      'top-10-interview-tips-for-software-engineers',
      'Master your next technical interview with these proven strategies from industry experts.',
      `<p>Landing your dream job as a software engineer requires more than just technical skills. The interview process can be challenging, but with the right preparation and mindset, you can significantly increase your chances of success.</p>

<h2>1. Master the Fundamentals</h2>
<p>Before diving into complex algorithms, ensure you have a solid understanding of basic programming concepts. Review data structures like arrays, linked lists, stacks, queues, trees, and graphs. Practice implementing these from scratch.</p>

<h2>2. Practice Coding Problems Daily</h2>
<p>Consistency is key when it comes to coding interviews. Dedicate at least 30-60 minutes daily to solving problems on platforms like LeetCode, HackerRank, or CodeSignal. Focus on understanding patterns rather than memorizing solutions.</p>

<h2>3. Understand System Design Basics</h2>
<p>For senior positions, system design questions are common. Learn about scalability, load balancing, databases, caching, and microservices architecture. Practice designing systems like Twitter, Instagram, or Uber.</p>

<h2>Conclusion</h2>
<p>Remember, interviews are a two-way street. While the company is evaluating you, you should also be assessing whether the role and company align with your career goals. Stay confident, be authentic, and showcase your passion for technology.</p>`,
      'Career Tips',
      'admin1',
      1,
      1,
      1234,
      89,
      '2025-01-08T10:00:00Z'
    );

    blogStmt.run(
      'blog2',
      'Remote Work: Building a Productive Home Office',
      'remote-work-building-productive-home-office',
      'Create the perfect workspace that boosts productivity and maintains work-life balance.',
      `<p>The shift to remote work has transformed how we approach our professional lives. Creating an effective home office setup is crucial for maintaining productivity, focus, and work-life balance.</p>

<h2>Choosing the Right Space</h2>
<p>Select a dedicated area in your home that can serve as your primary workspace. Ideally, this should be a quiet corner or room with minimal distractions.</p>

<h2>Investing in Quality Equipment</h2>
<p>Your workspace setup directly impacts your productivity and health. Invest in a comfortable ergonomic chair, a desk at the right height, and proper lighting.</p>

<h2>Creating Boundaries</h2>
<p>Establish clear boundaries between work and personal time. Set specific work hours and communicate them to family members or roommates.</p>`,
      'Remote Work',
      'admin1',
      1,
      0,
      987,
      67,
      '2025-01-06T10:00:00Z'
    );

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

seedData();