@@ .. @@
 -- Create indexes for better performance
 CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
 CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
 CREATE INDEX IF NOT EXISTS idx_companies_employer ON companies(employer_id);
 CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
 CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
 CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active, is_approved);
 CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
 CREATE INDEX IF NOT EXISTS idx_applications_seeker ON job_applications(job_seeker_id);
 CREATE INDEX IF NOT EXISTS idx_engagements_job ON engagements(job_id);
 CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
+
+-- Blog posts table
+CREATE TABLE IF NOT EXISTS blog_posts (
+  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
+  title TEXT NOT NULL,
+  slug TEXT UNIQUE NOT NULL,
+  excerpt TEXT NOT NULL,
+  content TEXT NOT NULL,
+  featured_image TEXT,
+  category TEXT NOT NULL,
+  author_id TEXT NOT NULL,
+  is_published BOOLEAN DEFAULT false,
+  is_featured BOOLEAN DEFAULT false,
+  views INTEGER DEFAULT 0,
+  likes INTEGER DEFAULT 0,
+  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
+  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
+  published_at DATETIME,
+  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
+);
+
+-- Blog comments table
+CREATE TABLE IF NOT EXISTS blog_comments (
+  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
+  post_id TEXT NOT NULL,
+  author_name TEXT NOT NULL,
+  author_email TEXT NOT NULL,
+  content TEXT NOT NULL,
+  is_approved BOOLEAN DEFAULT false,
+  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
+  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
+);
+
+-- Create indexes for blog tables
+CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
+CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at);
+CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
+CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);
+CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(is_approved);