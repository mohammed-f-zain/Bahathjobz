import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../data/bahath_jobz.db');
const db = createClient({ url: `file:${dbPath}` });

function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // 1. Create Super Admin
        console.log('👑 Creating Super Admin...');
        const adminPassword = await bcrypt.hash('admin123', 12);
        const adminId = generateId();

        await db.execute({
            sql: `INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, phone, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [adminId, 'admin@bahathjobz.com', adminPassword, 'Super', 'Admin', '+1234567890', 'super_admin', 1]
        });
        console.log('   ✅ Admin created: admin@bahathjobz.com / admin123');

        // 2. Create Employers
        console.log('\n🏢 Creating Employers...');
        const employers = [
            { email: 'employer1@techcorp.com', firstName: 'John', lastName: 'Smith', company: 'TechCorp Solutions' },
            { email: 'employer2@globaltech.com', firstName: 'Sarah', lastName: 'Johnson', company: 'Global Tech Inc' },
            { email: 'employer3@innovate.com', firstName: 'Michael', lastName: 'Brown', company: 'Innovate Labs' },
        ];

        const employerIds = [];
        const companyIds = [];

        for (const emp of employers) {
            const empPassword = await bcrypt.hash('employer123', 12);
            const empId = generateId();
            const companyId = generateId();

            await db.execute({
                sql: `INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, role, is_active)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [empId, emp.email, empPassword, emp.firstName, emp.lastName, 'employer', 1]
            });

            await db.execute({
                sql: `INSERT OR IGNORE INTO companies (id, name, industry, location, contact_email, employer_id, is_approved, description, tagline)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    companyId,
                    emp.company,
                    'Technology',
                    'Dubai, UAE',
                    emp.email,
                    empId,
                    1,
                    `${emp.company} is a leading technology company focused on innovation and excellence.`,
                    'Building the future of technology'
                ]
            });

            employerIds.push(empId);
            companyIds.push(companyId);
            console.log(`   ✅ Employer: ${emp.email} / employer123 → ${emp.company}`);
        }

        // 3. Create Jobs
        console.log('\n💼 Creating Jobs...');
        const jobs = [
            { title: 'Senior Software Engineer', location: 'Dubai, UAE', workType: 'hybrid', industry: 'Technology', seniority: 'senior', salaryMin: 15000, salaryMax: 25000 },
            { title: 'Frontend Developer', location: 'Abu Dhabi, UAE', workType: 'remote', industry: 'Technology', seniority: 'mid', salaryMin: 10000, salaryMax: 18000 },
            { title: 'DevOps Engineer', location: 'Riyadh, Saudi Arabia', workType: 'onsite', industry: 'Technology', seniority: 'senior', salaryMin: 18000, salaryMax: 30000 },
            { title: 'Product Manager', location: 'Dubai, UAE', workType: 'hybrid', industry: 'Technology', seniority: 'senior', salaryMin: 20000, salaryMax: 35000 },
            { title: 'UX Designer', location: 'Doha, Qatar', workType: 'remote', industry: 'Technology', seniority: 'mid', salaryMin: 12000, salaryMax: 20000 },
            { title: 'Data Scientist', location: 'Kuwait City, Kuwait', workType: 'hybrid', industry: 'Technology', seniority: 'senior', salaryMin: 16000, salaryMax: 28000 },
            { title: 'Junior Web Developer', location: 'Manama, Bahrain', workType: 'onsite', industry: 'Technology', seniority: 'entry', salaryMin: 5000, salaryMax: 8000 },
            { title: 'Backend Engineer', location: 'Muscat, Oman', workType: 'remote', industry: 'Technology', seniority: 'mid', salaryMin: 11000, salaryMax: 19000 },
            { title: 'Mobile App Developer', location: 'Dubai, UAE', workType: 'hybrid', industry: 'Technology', seniority: 'mid', salaryMin: 12000, salaryMax: 22000 },
            { title: 'Cloud Architect', location: 'Abu Dhabi, UAE', workType: 'onsite', industry: 'Technology', seniority: 'executive', salaryMin: 25000, salaryMax: 45000 },
        ];

        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const employerIdx = i % employers.length;
            const jobId = generateId();

            await db.execute({
                sql: `INSERT INTO jobs (id, title, description, responsibilities, requirements, benefits, location, work_type, industry, education, visa_eligible, seniority, salary_min, salary_max, currency, is_approved, is_active, company_id, employer_id)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    jobId,
                    job.title,
                    `We are looking for a talented ${job.title} to join our growing team. This is an exciting opportunity to work on cutting-edge projects and make a real impact.`,
                    `• Lead development projects\n• Collaborate with cross-functional teams\n• Mentor junior developers\n• Participate in code reviews\n• Contribute to technical documentation`,
                    `• 3+ years of relevant experience\n• Strong problem-solving skills\n• Excellent communication abilities\n• Bachelor's degree in Computer Science or related field`,
                    `• Competitive salary\n• Health insurance\n• Annual bonus\n• Remote work flexibility\n• Professional development budget`,
                    job.location,
                    job.workType,
                    job.industry,
                    'Bachelor',
                    1,
                    job.seniority,
                    job.salaryMin,
                    job.salaryMax,
                    'AED',
                    1,
                    1,
                    companyIds[employerIdx],
                    employerIds[employerIdx]
                ]
            });
            console.log(`   ✅ Job: ${job.title} @ ${job.location}`);
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('🎉 Database seeding completed!\n');
        console.log('📋 CREDENTIALS:');
        console.log('='.repeat(50));
        console.log('\n👑 SUPER ADMIN:');
        console.log('   Email:    admin@bahathjobz.com');
        console.log('   Password: admin123');
        console.log('\n🏢 EMPLOYERS (all use password: employer123):');
        employers.forEach(emp => {
            console.log(`   ${emp.email} → ${emp.company}`);
        });
        console.log('\n👤 EXISTING JOB SEEKERS:');
        console.log('   (Check database for existing accounts)');
        console.log('\n' + '='.repeat(50));

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
}

seedDatabase();


