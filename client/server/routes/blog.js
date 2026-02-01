import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import db from '../database/database.js';

const router = express.Router();

// Get all blog posts (public)
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || '';
    const search = req.query.search || '';

    let query = `
      SELECT 
        bp.*,
        u.first_name,
        u.last_name
      FROM blog_posts bp
      JOIN users u ON bp.author_id = u.id
      WHERE bp.is_published = 1
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ' AND bp.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (bp.title LIKE ? OR bp.excerpt LIKE ? OR bp.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY bp.is_featured DESC, bp.published_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const posts = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM blog_posts WHERE is_published = 1';
    const countParams = [];

    if (category && category !== 'All') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const total = db.prepare(countQuery).get(...countParams).count;

    res.json({
      posts: posts.map(post => ({
        ...post,
        author: `${post.first_name} ${post.last_name}`,
        readTime: `${Math.ceil(post.content.length / 1000)} min read`
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Blog posts fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// Get single blog post (public)
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;

    const post = db.prepare(`
      SELECT 
        bp.*,
        u.first_name,
        u.last_name
      FROM blog_posts bp
      JOIN users u ON bp.author_id = u.id
      WHERE bp.slug = ? AND bp.is_published = 1
    `).get(slug);

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment view count
    db.prepare('UPDATE blog_posts SET views = views + 1 WHERE id = ?').run(post.id);

    // Get comments
    const comments = db.prepare(`
      SELECT * FROM blog_comments
      WHERE post_id = ? AND is_approved = 1
      ORDER BY created_at DESC
    `).all(post.id);

    res.json({
      ...post,
      author: `${post.first_name} ${post.last_name}`,
      readTime: `${Math.ceil(post.content.length / 1000)} min read`,
      comments
    });
  } catch (error) {
    console.error('Blog post fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

// Admin routes - require super admin authentication
router.use('/admin', authenticateToken, requireRole(['super_admin']));

// Get all blog posts for admin
router.get('/admin/posts', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    const category = req.query.category || '';

    let query = `
      SELECT 
        bp.*,
        u.first_name,
        u.last_name
      FROM blog_posts bp
      JOIN users u ON bp.author_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status === 'published') {
      query += ' AND bp.is_published = 1';
    } else if (status === 'draft') {
      query += ' AND bp.is_published = 0';
    }

    if (category) {
      query += ' AND bp.category = ?';
      params.push(category);
    }

    query += ' ORDER BY bp.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const posts = db.prepare(query).all(...params);

    res.json({
      posts: posts.map(post => ({
        ...post,
        author: `${post.first_name} ${post.last_name}`
      }))
    });
  } catch (error) {
    console.error('Admin blog posts fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// Create blog post
router.post('/admin/posts', upload.single('featuredImage'), (req, res) => {
  try {
    const postData = req.body;
    const authorId = req.user.id;
    const featuredImage = req.file ? req.file.path : null;

    // Generate slug from title
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingPost = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(slug);
    if (existingPost) {
      return res.status(400).json({ message: 'A post with this title already exists' });
    }

    const stmt = db.prepare(`
      INSERT INTO blog_posts (
        title, slug, excerpt, content, featured_image, category,
        author_id, is_published, is_featured, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const publishedAt = postData.isPublished ? new Date().toISOString() : null;

    const result = stmt.run(
      postData.title,
      slug,
      postData.excerpt,
      postData.content,
      featuredImage,
      postData.category,
      authorId,
      postData.isPublished ? 1 : 0,
      postData.isFeatured ? 1 : 0,
      publishedAt
    );

    const post = db.prepare('SELECT * FROM blog_posts WHERE rowid = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Blog post created successfully',
      post
    });
  } catch (error) {
    console.error('Blog post creation error:', error);
    res.status(500).json({ message: 'Failed to create blog post' });
  }
});

// Update blog post
router.put('/admin/posts/:id', upload.single('featuredImage'), (req, res) => {
  try {
    const { id } = req.params;
    const postData = req.body;
    const featuredImage = req.file ? req.file.path : null;

    const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Generate new slug if title changed
    let slug = post.slug;
    if (postData.title !== post.title) {
      slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if new slug already exists
      const existingPost = db.prepare('SELECT id FROM blog_posts WHERE slug = ? AND id != ?').get(slug, id);
      if (existingPost) {
        return res.status(400).json({ message: 'A post with this title already exists' });
      }
    }

    const publishedAt = postData.isPublished && !post.is_published ? new Date().toISOString() : post.published_at;

    const stmt = db.prepare(`
      UPDATE blog_posts SET
        title = ?, slug = ?, excerpt = ?, content = ?, 
        featured_image = COALESCE(?, featured_image), category = ?,
        is_published = ?, is_featured = ?, published_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      postData.title,
      slug,
      postData.excerpt,
      postData.content,
      featuredImage,
      postData.category,
      postData.isPublished ? 1 : 0,
      postData.isFeatured ? 1 : 0,
      publishedAt,
      id
    );

    const updatedPost = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);

    res.json({
      message: 'Blog post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Blog post update error:', error);
    res.status(500).json({ message: 'Failed to update blog post' });
  }
});

// Delete blog post
router.delete('/admin/posts/:id', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Blog post deletion error:', error);
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
});

// Get blog analytics
router.get('/admin/analytics', (req, res) => {
  try {
    const totalPosts = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get().count;
    const publishedPosts = db.prepare('SELECT COUNT(*) as count FROM blog_posts WHERE is_published = 1').get().count;
    const draftPosts = db.prepare('SELECT COUNT(*) as count FROM blog_posts WHERE is_published = 0').get().count;
    const totalViews = db.prepare('SELECT SUM(views) as total FROM blog_posts').get().total || 0;
    const totalLikes = db.prepare('SELECT SUM(likes) as total FROM blog_posts').get().total || 0;

    // Get popular posts
    const popularPosts = db.prepare(`
      SELECT title, views, likes
      FROM blog_posts
      WHERE is_published = 1
      ORDER BY views DESC
      LIMIT 5
    `).all();

    // Get posts by category
    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM blog_posts
      WHERE is_published = 1
      GROUP BY category
      ORDER BY count DESC
    `).all();

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalLikes,
      popularPosts,
      categoryStats
    });
  } catch (error) {
    console.error('Blog analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch blog analytics' });
  }
});

export default router;