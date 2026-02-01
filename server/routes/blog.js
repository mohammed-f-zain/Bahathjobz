import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// --------------------
// Public Routes
// --------------------

// Get all blog posts (with pagination, search, category filter)
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category || '';
    const search = req.query.search || '';

    const where = {
      is_published: true,
      ...(category && category !== 'All' && { category }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { excerpt: { contains: search } },
          { content: { contains: search } }
        ]
      })
    };

    const posts = await prisma.blog_post.findMany({
      where,
      include: {
        author: { select: { first_name: true, last_name: true } }
      },
      orderBy: [
        { is_featured: 'desc' },
        { published_at: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.blog_post.count({ where });

    res.json({
      posts: posts.map(post => ({
        ...post,
        author: `${post.author.first_name} ${post.author.last_name}`,
        readTime: `${Math.ceil(post.content.length / 1000)} min read`,
        // Add plain-text versions
        excerptText: stripHtml(post.excerpt),
        contentText: stripHtml(post.content)
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

// Get single blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await prisma.blog_post.findUnique({
      where: { slug },
      include: {
        author: { select: { first_name: true, last_name: true } },
        blog_comments: {
          where: { is_approved: true },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!post) return res.status(404).json({ message: 'Blog post not found' });

    // Increment views
    await prisma.blog_post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });

    res.json({
      ...post,
      author: `${post.author.first_name} ${post.author.last_name}`,
      readTime: `${Math.ceil(post.content.length / 1000)} min read`
    });
  } catch (error) {
    console.error('Blog post fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

// --------------------
// Admin Routes (super_admin)
// --------------------

router.use('/admin', authenticateToken, requireRole(['super_admin']));

// Get all admin posts
router.get('/admin/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    const category = req.query.category || '';
    const search = req.query.search || '';

    const where = {
      ...(status === 'published' && { is_published: true }),
      ...(status === 'draft' && { is_published: false }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [posts, total] = await Promise.all([
      prisma.blog_post.findMany({
        where,
        include: { author: { select: { first_name: true, last_name: true } } },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.blog_post.count({ where })
    ]);

    res.json({
      posts: posts.map(post => ({
        ...post,
        author: `${post.author.first_name} ${post.author.last_name}`
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin blog posts fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// Get single post for admin
router.get('/admin/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.blog_post.findUnique({
      where: { id },
      include: { author: { select: { first_name: true, last_name: true } } }
    });

    if (!post) return res.status(404).json({ message: 'Blog post not found' });

    res.json({
      ...post,
      author: `${post.author.first_name} ${post.author.last_name}`
    });
  } catch (error) {
    console.error('Admin blog post fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});


// Create blog post
router.post('/admin/posts',authenticateToken,upload.single('featuredImage'), // 👈 same as resume
  async (req, res) => {
    try {
      const postData = req.body;
      const authorId = req.user?.id;

      if (!authorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!postData.title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      // Save relative path (same as resume_url)
      const featuredImage = req.file
        ? `/uploads/blog/${req.file.filename}`
        : null;

      // Slug generation
      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check duplicate
      const existingPost = await prisma.blog_post.findUnique({
        where: { slug },
      });
      if (existingPost) {
        return res.status(400).json({ message: 'Title already exists' });
      }

      // Boolean conversions
      const isPublished =
        postData.is_published === '1' ||
        postData.is_published === 'true' ||
        postData.is_published === true;

      const isFeatured =
        postData.is_featured === '1' ||
        postData.is_featured === 'true' ||
        postData.is_featured === true;

      // Create post
      const post = await prisma.blog_post.create({
        data: {
          title: postData.title,
          slug,
          excerpt: postData.excerpt || '',
          content: postData.content || '',
          featured_image: featuredImage, 
          category: postData.category || 'General',
          author_id: authorId,
          is_published: isPublished,
          is_featured: isFeatured,
          published_at: isPublished
            ? new Date(postData.published_at || Date.now())
            : null,
        },
      });

      res.status(201).json({
        message: 'Blog post created successfully',
        post,
      });
    } catch (error) {
      console.error('Blog post creation error:', error);
      res.status(500).json({ message: 'Failed to create blog post' });
    }
  }
);


// Edit blog post
router.put('/admin/posts/:id',authenticateToken,upload.single('featuredImage'), // handle new image upload
  async (req, res) => {
    try {
      const postId = req.params.id;
      const postData = req.body;
      const authorId = req.user?.id;

      if (!authorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Find existing blog post
      const existingPost = await prisma.blog_post.findUnique({
        where: { id: postId },
      });

      if (!existingPost) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      // Save new featured image if uploaded, otherwise keep old
      const featuredImage = req.file
        ? `/uploads/blog/${req.file.filename}`
        : existingPost.featured_image;

      // Slug generation (optional: only if title is updated)
      const slug = postData.title
        ? postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : existingPost.slug;

      // Check for duplicate slug (if title changed)
      if (postData.title && slug !== existingPost.slug) {
        const duplicate = await prisma.blog_post.findUnique({ where: { slug } });
        if (duplicate) {
          return res.status(400).json({ message: 'Title already exists' });
        }
      }

      // Convert strings to boolean
      const isPublished =
        postData.is_published === '1' ||
        postData.is_published === 'true' ||
        postData.is_published === true;

      const isFeatured =
        postData.is_featured === '1' ||
        postData.is_featured === 'true' ||
        postData.is_featured === true;

      // Update blog post
      const updatedPost = await prisma.blog_post.update({
        where: { id: postId },
        data: {
          title: postData.title || existingPost.title,
          slug,
          excerpt: postData.excerpt || existingPost.excerpt,
          content: postData.content || existingPost.content,
          featured_image: featuredImage,
          category: postData.category || existingPost.category,
          is_published: isPublished,
          is_featured: isFeatured,
          published_at: isPublished
            ? new Date(postData.published_at || existingPost.published_at || Date.now())
            : null,
          //updated_at: new Date(),
        },
      });

      res.status(200).json({
        message: 'Blog post updated successfully',
        post: updatedPost,
      });
    } catch (error) {
      console.error('Blog post update error:', error.message);
      res.status(500).json({ message: 'Failed to update blog post' });
    }
  }
);


// Delete blog post
router.delete('/admin/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.blog_post.delete({ where: { id } });
    res.json({ message: 'Blog post deleted' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Post not found' });
    console.error('Blog post deletion error:', error);
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
});

// Blog analytics
router.get('/admin/analytics', async (req, res) => {
  try {
    const totalPosts = await prisma.blog_post.count();
    const publishedPosts = await prisma.blog_post.count({ where: { is_published: true } });
    const draftPosts = await prisma.blog_post.count({ where: { is_published: false } });

    const viewsResult = await prisma.blog_post.aggregate({ _sum: { views: true } });
    const likesResult = await prisma.blog_post.aggregate({ _sum: { likes: true } });

    const totalViews = viewsResult._sum.views || 0;
    const totalLikes = likesResult._sum.likes || 0;

    const popularPosts = await prisma.blog_post.findMany({
      where: { is_published: true },
      select: { title: true, views: true, likes: true },
      orderBy: { views: 'desc' },
      take: 5
    });

    const categoryStats = await prisma.blog_post.groupBy({
      by: ['category'],
      where: { is_published: true },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    });

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalLikes,
      popularPosts,
      categoryStats: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count.category
      }))
    });
  } catch (error) {
    console.error('Blog analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// --------------------
// Employer Routes (employer)
// --------------------
router.use('/employer', authenticateToken, requireRole(['employer']));


// Get all employer posts
router.get('/employer/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    const category = req.query.category || '';
    const search = req.query.search || ''; // 👈 get search term

    const where = {
  AND: [
    { author_id: req.user.id },
    ...(status === 'published' ? [{ is_published: true }] : []),
    ...(status === 'draft' ? [{ is_published: false }] : []),
    ...(category ? [{ category }] : []),
    ...(search
      ? [
          {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { excerpt: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ],
          },
        ]
      : []),
  ],
};

    const [posts, total] = await Promise.all([
      prisma.blog_post.findMany({
        where,
        include: { author: { select: { first_name: true, last_name: true } } },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.blog_post.count({ where })
    ]);

    res.json({
      posts: posts.map(post => ({
        ...post,
        author: `${post.author.first_name} ${post.author.last_name}`
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Employer blog posts fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch employer blog posts' });
  }
});


// Get single post for employer
router.get('/employer/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.blog_post.findUnique({
      where: { id },
      include: { author: { select: { first_name: true, last_name: true } } }
    });

    if (!post || post.author_id !== req.user.id) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({
      ...post,
      author: `${post.author.first_name} ${post.author.last_name}`
    });
  } catch (error) {
    console.error('Employer blog post fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

// Create blog post
router.post(
  '/employer/posts',
  authenticateToken,
  upload.single('featuredImage'),
  async (req, res) => {
    try {
      const postData = req.body;
      const authorId = req.user?.id;

      if (!authorId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!postData.title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const featuredImage = req.file
        ? `/uploads/blog/${req.file.filename}`
        : null;

      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const existingPost = await prisma.blog_post.findUnique({ where: { slug } });
      if (existingPost) {
        return res.status(400).json({ message: 'Title already exists' });
      }

      const isPublished =
        postData.is_published === '1' ||
        postData.is_published === 'true' ||
        postData.is_published === true;

      const isFeatured =
        postData.is_featured === '1' ||
        postData.is_featured === 'true' ||
        postData.is_featured === true;

      const post = await prisma.blog_post.create({
        data: {
          title: postData.title,
          slug,
          excerpt: postData.excerpt || '',
          content: postData.content || '',
          featured_image: featuredImage,
          category: postData.category || 'General',
          author_id: authorId,
          is_published: isPublished,
          is_featured: isFeatured,
          published_at: isPublished ? new Date() : null
        }
      });

      res.status(201).json({ message: 'Blog post created successfully', post });
    } catch (error) {
      console.error('Employer blog post creation error:', error);
      res.status(500).json({ message: 'Failed to create blog post' });
    }
  }
);

// Update blog post
router.put(
  '/employer/posts/:id',
  authenticateToken,
  upload.single('featuredImage'),
  async (req, res) => {
    try {
      const postId = req.params.id;
      const postData = req.body;

      const existingPost = await prisma.blog_post.findUnique({
        where: { id: postId }
      });

      if (!existingPost || existingPost.author_id !== req.user.id) {
        return res.status(404).json({ message: 'Blog post not found' });
      }

      const featuredImage = req.file
        ? `/uploads/blog/${req.file.filename}`
        : existingPost.featured_image;

      const slug = postData.title
        ? postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : existingPost.slug;

      const updatedPost = await prisma.blog_post.update({
        where: { id: postId },
        data: {
          title: postData.title || existingPost.title,
          slug,
          excerpt: postData.excerpt || existingPost.excerpt,
          content: postData.content || existingPost.content,
          featured_image: featuredImage,
          category: postData.category || existingPost.category,
          is_published: postData.is_published === 'true' || existingPost.is_published,
          is_featured: postData.is_featured === 'true' || existingPost.is_featured,
          published_at: postData.is_published ? new Date() : existingPost.published_at
        }
      });

      res.status(200).json({ message: 'Blog post updated successfully', post: updatedPost });
    } catch (error) {
      console.error('Employer blog post update error:', error);
      res.status(500).json({ message: 'Failed to update blog post' });
    }
  }
);

// Delete blog post
router.delete('/employer/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.blog_post.findUnique({ where: { id } });

    if (!existingPost || existingPost.author_id !== req.user.id) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    await prisma.blog_post.delete({ where: { id } });
    res.json({ message: 'Blog post deleted' });
  } catch (error) {
    console.error('Employer blog post deletion error:', error);
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
});

router.get('/employer/analytics', authenticateToken, requireRole(['employer']), async (req, res) => {
  try {
    const employerId = req.user.id;

    const totalPosts = await prisma.blog_post.count({
      where: { author_id: employerId }
    });

    const publishedPosts = await prisma.blog_post.count({
      where: { author_id: employerId, is_published: true }
    });

    const draftPosts = await prisma.blog_post.count({
      where: { author_id: employerId, is_published: false }
    });

    const totalViews = await prisma.blog_post.aggregate({
      _sum: { views: true },
      where: { author_id: employerId }
    });

    const totalLikes = await prisma.blog_post.aggregate({
      _sum: { likes: true },
      where: { author_id: employerId }
    });

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews._sum.views || 0,
      totalLikes: totalLikes._sum.likes || 0,
    });
  } catch (error) {
    console.error("Error fetching employer's blog analytics:", error);
    res.status(500).json({ message: "Failed to fetch employer's blog analytics" });
  }
});


export default router;