# 1. OBJECTIVE

Build a production-ready Arabic-first city business directory called "دليل النبك" (Daleel Al-Nabk) for Al Nabik, Syria. This is a full-stack web application with:
- Public directory for citizens to search/browse businesses
- Business owner dashboard for managing listings
- Admin panel for content moderation
- Complete authentication system with RBAC
- Media upload system with Cloudinary
- PDF export functionality
- Full internationalization (Arabic RTL, English LTR)

# 2. CONTEXT SUMMARY

**Tech Stack:**
- Next.js 14 (App Router)
- PostgreSQL with Prisma ORM
- Redis for caching and rate limiting
- Cloudinary for media storage
- Custom session-based authentication (HttpOnly cookies)
- Tailwind CSS + shadcn/ui for styling
- next-intl for i18n

**Database Tables Required:**
- users, sessions, email_verification_tokens, password_reset_tokens
- cities, categories, category_suggestions
- business_profiles, phone_numbers, working_hours, social_links
- media_files, notifications, audit_logs, platform_settings

**User Roles (RBAC):**
- GUEST: Browse public directory
- BUSINESS_OWNER: Manage own listings
- ADMIN: Moderate content, manage categories
- SUPER_ADMIN: Full platform control

# 3. APPROACH OVERVIEW

Build the application in this order:
1. Set up Next.js project with TypeScript, Prisma, Tailwind
2. Create complete database schema in Prisma
3. Build authentication system (sign up, verify email, sign in, password reset)
4. Implement category CMS with seed data
5. Build business profile system with owner dashboard
6. Implement media upload (images + videos) with Cloudinary
7. Create public directory pages (homepage, category, search, business profile)
8. Build admin panel with all moderation features
9. Add PDF export with caching
10. Implement notifications and transactional emails
11. Add SEO features (metadata, JSON-LD, sitemap)

# 4. IMPLEMENTATION STEPS

## Step 1: Project Setup & Configuration
- Initialize Next.js 14 project with TypeScript
- Set up Tailwind CSS and shadcn/ui
- Configure next-intl for Arabic/English
- Set up Prisma with PostgreSQL
- Create environment configuration
- Set up folder structure per spec

## Step 2: Database Schema (Prisma)
- Create all tables per schema specification
- Configure enums for roles, statuses, platforms
- Set up relations between entities
- Add indexes for search performance (pg_trgm)

## Step 3: Authentication System
- Build custom session-based auth with HttpOnly cookies
- Implement sign up with email verification
- Implement sign in with rate limiting
- Implement password reset with token system
- Create middleware for protected routes
- Add Google OAuth button (optional)

## Step 4: Category CMS
- Admin CRUD for categories
- Category suggestions from business owners
- Seed initial 14 categories
- Hierarchical category support (subcategories)

## Step 5: Business Profile System
- Create/Edit/Delete listings (owner only)
- Phone numbers management
- Working hours per day
- Social links management
- Status lifecycle (DRAFT → ACTIVE → SUSPENDED)
- Auto-generate searchable text

## Step 6: Media Upload System
- Image upload with magic bytes validation
- Auto-process images (resize, convert to WebP, generate thumbnail)
- Video upload with size limit (100MB)
- Video moderation queue (PENDING → APPROVED/REJECTED)
- Rate limiting on uploads (20/hour)

## Step 7: Public Directory Pages
- Homepage with search, categories, featured listings
- Category browse page with filters and pagination
- Search results with real-time search
- Business profile page with full details

## Step 8: Admin Panel
- Dashboard with KPIs and activity feed
- Listings management with bulk actions
- Users management (role changes - SUPER_ADMIN only)
- Category management with drag-to-reorder
- Media moderation queue
- Audit log view

## Step 9: PDF Export
- Generate PDF with all active businesses
- Group by category
- Cache in Redis for 6 hours
- Invalidate on listing changes

## Step 10: Notifications & Emails
- In-app notifications with bell icon
- Transactional emails via Resend/Nodemailer
- All emails in Arabic with English subtitle

## Step 11: SEO & Polish
- Metadata for all pages
- JSON-LD LocalBusiness schema
- Sitemap generation
- Robots.txt configuration

## Step 12: Seed Data
- 1 SUPER_ADMIN user (admin@nabk.sy / Admin123!)
- 14 categories
- 5 sample businesses

# 5. TESTING AND VALIDATION

**Authentication:**
- [ ] Guest can browse without account
- [ ] Sign up flow works (email verification)
- [ ] Sign in creates session
- [ ] Rate limiting kicks in after 5 failed attempts
- [ ] Password reset works and invalidates sessions
- [ ] Protected routes redirect properly

**Business Owner:**
- [ ] Can create listing with all fields
- [ ] Can upload cover image and gallery
- [ ] Can upload video (shows pending)
- [ ] Listing appears publicly after creation
- [ ] Can edit their own listings
- [ ] Can suggest categories

**Admin:**
- [ ] Can approve/reject videos
- [ ] Can suspend/restore listings
- [ ] Can approve/reject category suggestions
- [ ] Can manage users (SUPER_ADMIN only)

**Public Directory:**
- [ ] Search returns relevant results
- [ ] Category page shows paginated listings
- [ ] Business profile shows all details
- [ ] PDF export generates correctly
