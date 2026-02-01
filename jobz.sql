--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-09-11 13:01:28

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 115465)
-- Name: blog_comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_comment (
    id text NOT NULL,
    post_id text NOT NULL,
    author_name text NOT NULL,
    author_email text NOT NULL,
    content text NOT NULL,
    is_approved boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.blog_comment OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 115472)
-- Name: blog_post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_post (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    featured_image text,
    category text NOT NULL,
    author_id text NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    published_at timestamp(3) without time zone
);


ALTER TABLE public.blog_post OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 115483)
-- Name: company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company (
    id text NOT NULL,
    name text NOT NULL,
    logo text,
    banner text,
    tagline text,
    description text,
    industry text NOT NULL,
    website text,
    location text NOT NULL,
    contact_email text NOT NULL,
    contact_phone text,
    is_approved boolean DEFAULT false NOT NULL,
    employer_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.company OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 115627)
-- Name: contact_inquiry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_inquiry (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    inquiry_type text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    priority text DEFAULT 'low'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    responded_at timestamp(3) without time zone
);


ALTER TABLE public.contact_inquiry OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 115499)
-- Name: engagement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.engagement (
    id text NOT NULL,
    job_id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    content text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.engagement OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 115505)
-- Name: job; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    responsibilities text NOT NULL,
    requirements text NOT NULL,
    benefits text,
    location text NOT NULL,
    work_type text NOT NULL,
    industry text NOT NULL,
    education text NOT NULL,
    visa_eligible boolean DEFAULT false NOT NULL,
    seniority text NOT NULL,
    salary_min integer,
    salary_max integer,
    currency text DEFAULT 'USD'::text NOT NULL,
    is_approved boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    company_id text NOT NULL,
    employer_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deadline timestamp(3) without time zone
);


ALTER TABLE public.job OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 115516)
-- Name: job_application; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_application (
    id text NOT NULL,
    job_id text NOT NULL,
    job_seeker_id text NOT NULL,
    cover_note text,
    status text DEFAULT 'applied'::text NOT NULL,
    applied_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.job_application OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 115524)
-- Name: job_seeker; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_seeker (
    id text NOT NULL,
    user_id text NOT NULL,
    summary text,
    availability text NOT NULL,
    education text NOT NULL,
    experience text NOT NULL,
    skills jsonb,
    resume_url text,
    location text NOT NULL,
    visa_status text NOT NULL,
    portfolio_url text,
    linkedin_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.job_seeker OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 115531)
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id text NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 115538)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    role text NOT NULL,
    avatar text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 4887 (class 0 OID 115465)
-- Dependencies: 217
-- Data for Name: blog_comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_comment (id, post_id, author_name, author_email, content, is_approved, created_at) FROM stdin;
\.


--
-- TOC entry 4888 (class 0 OID 115472)
-- Dependencies: 218
-- Data for Name: blog_post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_post (id, title, slug, excerpt, content, featured_image, category, author_id, is_published, is_featured, views, likes, created_at, updated_at, published_at) FROM stdin;
0c2d4bda-20e4-42a5-b44b-4963a5489e16	New Blog Post	new-blog-post	Short excerpt	Blog content here	\N	Tech	c53187da-7292-4b07-8ea0-6f1c5fe84fc0	f	f	0	0	2025-09-05 10:37:21.782	2025-09-05 10:37:21.782	\N
7b8a5b96-f8ea-4a3e-8a96-6dbacbff6a62	New Blog Post8	new-blog-post8	Short excerpt1	Blog content here1	/uploads/blog/featuredImage-1757311207829-523256430.jpg	Tech	c53187da-7292-4b07-8ea0-6f1c5fe84fc0	t	f	0	0	2025-09-08 06:00:07.835	2025-09-08 06:00:07.835	2025-09-08 06:00:07.834
7349a07d-7b19-49e4-be0e-7c2ae112d1a9	New Blog Post6	new-blog-post6	Short excerpt1	Updated blog content here	C:\\Krupa_Patkar\\bahath_jobz\\job_api\\uploads\\featuredImage-1757309993260-892684081.jpg	Tech-5	c53187da-7292-4b07-8ea0-6f1c5fe84fc0	t	f	2	0	2025-09-08 05:39:29.852	2025-09-08 05:39:29.852	2025-09-08 05:39:29.851
bfd26fb0-0066-4072-8236-f441206e286f	Blog Post	blog-post	Short excerpt1	Blog content here1	/uploads/blog/featuredImage-1757402882843-959527820.jpg	Tech	c53187da-7292-4b07-8ea0-6f1c5fe84fc0	t	t	0	0	2025-09-09 07:28:02.847	2025-09-09 07:28:02.847	2025-09-09 10:46:16.645
e551a970-706d-4198-afa7-42d36f3a437b	New Blog Post1	new-blog-post1	Short excerpt1	Updated blog content here	/uploads/blog/featuredImage-1757419139712-450731876.jpg	Update Tech-5	c53187da-7292-4b07-8ea0-6f1c5fe84fc0	t	t	1	0	2025-09-09 05:41:38.965	2025-09-09 05:41:38.965	2025-09-09 11:58:59.724
\.


--
-- TOC entry 4889 (class 0 OID 115483)
-- Dependencies: 219
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company (id, name, logo, banner, tagline, description, industry, website, location, contact_email, contact_phone, is_approved, employer_id, created_at, updated_at) FROM stdin;
488b0d07-e8ee-48d9-a808-b997afdaff65	TechVision Ltd	C:\\Krupa_Patkar\\bahath_jobz\\job_api\\uploads\\company\\logo-1757390910435-654848364.png	C:\\Krupa_Patkar\\bahath_jobz\\job_api\\uploads\\company\\banner-1757390910436-55439494.png	"Building the future"	"We are a software solutions company."	Technology	"https://techvision.com"	"New York, USA"	 "hr@techvision.com"	"+1-123-456-7890"	f	64c134cc-4f9f-46bc-9f28-acfdd759a333	2025-09-09 04:08:30.484	2025-09-09 04:08:30.484
c9b1f6d2-3a6e-4fcd-8b79-123456789abc	Edit Tech Solutions Ltd.	logo.png	banner.png	We build software solutions	Company description goes here	Finance	https://www.mycompany.com	Edit New York, NY2	contact@mycompany.com	+1-555-123-4567	t	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 12:27:40.198	2025-09-08 12:27:40.198
86495df9-c23f-41d1-8662-3907045f762b	Edit Tech Solutions Ltd.	https://example.com/logo.png	https://example.com/banner.png	Innovating the Future	We provide cutting-edge tech solutions to businesses worldwide.	Healthcare	https://techsolutions.com	New York, NY2	contact@techsolutions.com	+91-9876543210	t	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 17:11:48.722	2025-09-08 17:11:48.722
\.


--
-- TOC entry 4896 (class 0 OID 115627)
-- Dependencies: 226
-- Data for Name: contact_inquiry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_inquiry (id, name, email, inquiry_type, subject, message, status, priority, created_at, responded_at) FROM stdin;
cmfcewbhu00002rioo4zf7pb8	Test User	test2@gmail.com	general	Unable to upload resume	I'm having trouble uploading my resume.	responded	medium	2025-09-09 10:32:41.779	2025-09-09 10:58:09.169
cmfcffdi200002rs4zg8a66dd	Test User1	test1@gmail.com	general	Unable to upload resume	I'm having trouble uploading my resume.	responded	medium	2025-09-09 10:47:30.842	2025-09-09 11:59:43.29
\.


--
-- TOC entry 4890 (class 0 OID 115499)
-- Dependencies: 220
-- Data for Name: engagement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.engagement (id, job_id, user_id, type, content, created_at) FROM stdin;
53f0496a-6972-4b74-a3d5-76da03384eba	d1aa1753-8ffd-45ee-be90-4305e4a92a5c	14902734-a1af-454b-8c06-7af263fda9ee	comment	This job looks nice and amazing!	2025-09-09 06:14:24.903
82fee5b4-1f90-4bea-9578-53f6395e608f	d1aa1753-8ffd-45ee-be90-4305e4a92a5c	14902734-a1af-454b-8c06-7af263fda9ee	comment	This job looks nice and amazing	2025-09-09 06:15:51.801
fe70b131-6a55-4c77-9576-828dad464564	d1aa1753-8ffd-45ee-be90-4305e4a92a5c	14902734-a1af-454b-8c06-7af263fda9ee	comment	This job looks nice and amazing!	2025-09-09 07:45:28.599
109aed3b-e696-41e9-8223-71f20738cf48	df496c58-2950-4268-831f-8ce665e6611f	c94ea754-1779-4a79-b7c4-069431f74554	comment	NIce Job Offer	2025-09-09 10:06:13.669
900cf4f5-d006-45c7-a3c1-a473d404334b	d1aa1753-8ffd-45ee-be90-4305e4a92a5c	14902734-a1af-454b-8c06-7af263fda9ee	like	Nice Job Offer	2025-09-09 06:15:28.75
f58632d6-8619-4de3-845a-96b09e2af26b	df496c58-2950-4268-831f-8ce665e6611f	05fd8e91-1268-4372-8a30-68aff227e13f	favorite	Impressive job offer	2025-09-09 04:43:37.306
\.


--
-- TOC entry 4891 (class 0 OID 115505)
-- Dependencies: 221
-- Data for Name: job; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job (id, title, description, responsibilities, requirements, benefits, location, work_type, industry, education, visa_eligible, seniority, salary_min, salary_max, currency, is_approved, is_active, company_id, employer_id, created_at, updated_at, deadline) FROM stdin;
80a7eda4-439a-48e0-9a56-d218f51b1fe6	Senior Backend Developer	Node.js, Express, PostgreSQL	Build APIs	3+ years experience	Health, Bonus	New York	Full-time	IT	Bachelor's	t	Senior	70000	90000	USD	f	t	86495df9-c23f-41d1-8662-3907045f762b	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-09 06:18:22.745	2025-09-09 06:18:22.745	2025-10-15 00:00:00
b81f80f9-54ac-4fb3-aa10-8d16eb42b5c2	Junior Backend Developer	Node.js, Express, PostgreSQL	Build APIs	3 months experience	Health, Bonus	New York	Part-time	Health Care	Bachelor's	t	Senior	70000	90000	USD	t	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 06:58:31.336	2025-09-08 06:58:31.336	2025-10-15 00:00:00
df496c58-2950-4268-831f-8ce665e6611f	Frontend Developer	Build responsive web applications	Develop UI components, Collaborate with backend	Experience with React and JS	Health insurance, Paid leaves	Bangalore, India	Full-time	Technology	Bachelor in CS	t	Mid-level	30000	50000	INR	f	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 17:30:00.873	2025-09-08 17:30:00.873	\N
d1aa1753-8ffd-45ee-be90-4305e4a92a5c	Node JS Developer	Node.js, Express, PostgreSQL	Build APIs	3+ years experience	Health, Bonus	New York	Full-time	IT	Bachelor's	t	Senior	70000	90000	USD	t	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 07:12:58.538	2025-09-08 07:12:58.538	2025-10-15 00:00:00
aeba637e-f0d0-4b2a-9138-5693fd06484d	Senior Backend Developer4	Node.js, Express, PostgreSQL	Build APIs	3+ years experience	Health, Bonus	New York	Full-time	IT	Bachelor's	t	Senior	70000	90000	USD	f	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-10 12:29:55.664	2025-09-10 12:29:55.664	2025-10-15 00:00:00
d1051f0a-74d2-4044-8187-8e31422af9ae	Senior Backend Developer4	Node.js, Express, PostgreSQL	Build APIs	3+ years experience	Health, Bonus	New York	Full-time	IT	Bachelor's	t	Senior	70000	90000	USD	f	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-10 12:30:20.26	2025-09-10 12:30:20.26	2025-10-15 00:00:00
a3a974e2-33b7-48d7-82b8-6888f09ec6a8	4	4	tghjk	fghjk	fghjkl	4	remote	Technology	Bachelor's Degree	f	senior	10	10	USD	f	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-10 12:32:14.23	2025-09-10 12:32:14.23	2025-09-15 00:00:00
\.


--
-- TOC entry 4892 (class 0 OID 115516)
-- Dependencies: 222
-- Data for Name: job_application; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_application (id, job_id, job_seeker_id, cover_note, status, applied_at, updated_at) FROM stdin;
6bc48769-ca88-4ad6-8a27-a0b82fd132e9	d1aa1753-8ffd-45ee-be90-4305e4a92a5c	05fd8e91-1268-4372-8a30-68aff227e13f	I am very interested in this position.	shortlisted	2025-09-08 07:53:33.193	2025-09-08 07:53:33.193
\.


--
-- TOC entry 4893 (class 0 OID 115524)
-- Dependencies: 223
-- Data for Name: job_seeker; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_seeker (id, user_id, summary, availability, education, experience, skills, resume_url, location, visa_status, portfolio_url, linkedin_url, created_at, updated_at) FROM stdin;
015ba48f-fad6-4798-bd63-6bb29f55dcb9	4307242d-5d0c-4dde-af09-72b18c310539	5+ years experience in full stack development	Immediately	Bachelor's Degree	Worked at ABC Corp as a Software Engineer...	["Node.js", "Express", "React", "PostgreSQL"]	\N	San Francisco, CA	Citizen	https://yourportfolio.com	https://linkedin.com/in/yourprofile	2025-09-05 05:57:14.938	2025-09-05 05:57:14.938
762ca255-787a-4ce9-8c46-928d2e17f86b	c94ea754-1779-4a79-b7c4-069431f74554	2.5+ years experience in full stack development	Immediately	Bachelor's Degree	Worked at ABC Corp as a Software Engineer...	["Node.js", "Express", "React", "PostgreSQL"]	\N	San Francisco, CA	Citizen	https://yourportfolio.com	https://linkedin.com/in/yourprofile	2025-09-09 04:55:33.495	2025-09-09 04:56:11.508
cd5cb66e-8609-4d88-a436-9b975ae3e713	05fd8e91-1268-4372-8a30-68aff227e13f	5+ years experience in full stack development	Immediately	Bachelor's Degree	Worked at ABC Corp as a Software Engineer...	["[\\"Node.js\\"", "\\"Express\\"", "\\"React\\"", "\\"PostgreSQL\\"]"]	C:\\Krupa_Patkar\\bahath_jobz\\job_api\\uploads\\resumes\\resume-1757401051587-487461154.pdf	San Francisco, CA	Citizen	https://yourportfolio.com	https://linkedin.com/in/yourprofile	2025-09-05 10:23:23.083	2025-09-09 06:57:31.591
\.


--
-- TOC entry 4894 (class 0 OID 115531)
-- Dependencies: 224
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, user_id, title, message, type, is_read, created_at) FROM stdin;
77d776bb-c425-4ffb-ab9f-db52eac89838	05fd8e91-1268-4372-8a30-68aff227e13f	New Job Alerts	A new job has been posted in your industryy.	job_alert	t	2025-09-08 10:12:47.083
9a7d8ddd-476c-469c-8fad-bff23dceec8d	05fd8e91-1268-4372-8a30-68aff227e13f	New Job Alert	A new job has been posted in your industryy.	job_alert	t	2025-09-08 10:17:45.218
cf54d1dc-245b-4867-b235-fbf33dd552f8	05fd8e91-1268-4372-8a30-68aff227e13f	New Job Alert	A new job has been posted in your industryy.	job_alert	t	2025-09-08 10:36:14.984
8a76757e-5680-4083-974a-db713c3c4e74	05fd8e91-1268-4372-8a30-68aff227e13f	Application Status Update	Congratulations! You have been shortlisted for Senior Backend Developer4	application	f	2025-09-08 12:37:16.538
0bb6ccb6-877c-4e68-b0f6-5ebec47e9842	05fd8e91-1268-4372-8a30-68aff227e13f	Application Status Update	Congratulations! You have been shortlisted for Senior Backend Developer4	application	f	2025-09-09 05:15:17.072
d5c608f1-4fb0-4033-9b25-92eba8e4d336	05fd8e91-1268-4372-8a30-68aff227e13f	Application Status Update	undefined for Senior Backend Developer4	application	f	2025-09-09 05:22:35.105
be225c27-60ed-4416-b1c4-a41b5a6345ce	05fd8e91-1268-4372-8a30-68aff227e13f	Application Status Update	Congratulations! You have been shortlisted for Senior Backend Developer4	application	f	2025-09-09 05:22:42.875
7dc21faf-e494-4190-bfbd-3106b413a071	14902734-a1af-454b-8c06-7af263fda9ee	New Job Alert	A new job has been posted in your industry.	job_alert	t	2025-09-08 09:48:08.482
6ae0b201-9023-4443-ad20-131485b49362	14902734-a1af-454b-8c06-7af263fda9ee	New Job Application	Someone applied for your job: Senior Backend Developer	application	t	2025-09-08 07:44:41.029
3e2319db-929e-40f5-8a99-8d252d924234	14902734-a1af-454b-8c06-7af263fda9ee	New Job Application	Someone applied for your job: Senior Backend Developer4	application	t	2025-09-08 07:46:26.058
667e0732-43fb-4e0f-bfa8-6282acdc0b4c	14902734-a1af-454b-8c06-7af263fda9ee	New Job Application	Someone applied for your job: Senior Backend Developer4	application	t	2025-09-08 07:53:33.195
3d63cd7c-acfd-4df7-9dbb-cf1ada37e0b0	14902734-a1af-454b-8c06-7af263fda9ee	New Job Alert	A new job has been posted in your industryy.	job_alert	f	2025-09-09 06:26:27.563
\.


--
-- TOC entry 4895 (class 0 OID 115538)
-- Dependencies: 225
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, password, first_name, last_name, phone, role, avatar, is_active, created_at, updated_at) FROM stdin;
4307242d-5d0c-4dde-af09-72b18c310539	test@gmail.com	$2a$12$m6C6RIIeUKhFdUl5yjDP6eS.P8IAxsVgo.cn2spZO.mHKKFviu6Rm	Test	User	9876543210	job_seeker	\N	t	2025-09-05 05:27:23.79	2025-09-05 05:27:23.79
14902734-a1af-454b-8c06-7af263fda9ee	employer@techcorp.com	$2a$12$NKY459ZuAB4T23VYr7J4culyJtZTPKlJLoNud7nvw3LONu/3zI.5i	Employer	Employer	9876543210	employer	\N	t	2025-09-05 07:57:50.989	2025-09-05 07:57:50.989
64c134cc-4f9f-46bc-9f28-acfdd759a333	employer2@techcorp.com	$2a$12$6Wq5tVvCjI8CriKG/JEhGuGfZH4DOwUDVDn/6WYhWFLWALMqmr3ve	Employer	Employer	9876543210	employer	\N	t	2025-09-08 09:03:27.437	2025-09-08 09:03:27.437
05fd8e91-1268-4372-8a30-68aff227e13f	test2@gmail.com	$2a$12$0bdpY4MtreVYtP1V95U03eWjdDkNwPM88cRdDwtpGKI/rm6uygAD6	Test	User	9876543210	job_seeker	\N	f	2025-09-05 06:07:55.872	2025-09-05 06:07:55.872
f6869171-5c49-45c6-9595-bc26e6e35067	jobseeker@example.com 	$2a$12$tkpJm81eIFQaM8XSZGqj0edbxmnJwiHITz9JPdfQeKB68dq9VjaRC	Job	Seeker	9876543210	job_seeker	\N	t	2025-09-09 08:35:40.102	2025-09-09 08:35:40.102
ff0aacd3-a374-4933-be30-44165f14d4fb	user02@gmail.com	$2a$12$eQLg2uqgU7ZuIMWDrGKDNOd71OHsR/UW1reDS9W/sutF6xsxku.zC	user 02	Userr	9876543210	job_seeker	\N	t	2025-09-10 10:33:35.409	2025-09-10 10:33:35.409
c94ea754-1779-4a79-b7c4-069431f74554	test3@gmail.com	$2a$12$NKY459ZuAB4T23VYr7J4culyJtZTPKlJLoNud7nvw3LONu/3zI.5i	Test	User	9876543210	job_seeker	\N	t	2025-09-09 04:50:09.719	2025-09-09 04:50:09.719
c53187da-7292-4b07-8ea0-6f1c5fe84fc0	admin@bahathjobz.com	$2a$12$k54DG5v6ZfXhcjEoaMTJp.wuak3Q0yL9uZHZzNaIEVCL/C4bdf5qy	Admin	User	9876543210	super_admin	\N	t	2025-09-05 10:29:24.039	2025-09-05 10:29:24.039
\.


--
-- TOC entry 4708 (class 2606 OID 115547)
-- Name: blog_comment blog_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_comment
    ADD CONSTRAINT blog_comment_pkey PRIMARY KEY (id);


--
-- TOC entry 4710 (class 2606 OID 115549)
-- Name: blog_post blog_post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post
    ADD CONSTRAINT blog_post_pkey PRIMARY KEY (id);


--
-- TOC entry 4713 (class 2606 OID 115551)
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- TOC entry 4730 (class 2606 OID 115636)
-- Name: contact_inquiry contact_inquiry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_inquiry
    ADD CONSTRAINT contact_inquiry_pkey PRIMARY KEY (id);


--
-- TOC entry 4715 (class 2606 OID 115555)
-- Name: engagement engagement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagement
    ADD CONSTRAINT engagement_pkey PRIMARY KEY (id);


--
-- TOC entry 4720 (class 2606 OID 115557)
-- Name: job_application job_application_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_application
    ADD CONSTRAINT job_application_pkey PRIMARY KEY (id);


--
-- TOC entry 4717 (class 2606 OID 115559)
-- Name: job job_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id);


--
-- TOC entry 4722 (class 2606 OID 115561)
-- Name: job_seeker job_seeker_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_seeker
    ADD CONSTRAINT job_seeker_pkey PRIMARY KEY (id);


--
-- TOC entry 4725 (class 2606 OID 115563)
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- TOC entry 4728 (class 2606 OID 115565)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4711 (class 1259 OID 115566)
-- Name: blog_post_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_post_slug_key ON public.blog_post USING btree (slug);


--
-- TOC entry 4718 (class 1259 OID 115567)
-- Name: job_application_job_id_job_seeker_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX job_application_job_id_job_seeker_id_key ON public.job_application USING btree (job_id, job_seeker_id);


--
-- TOC entry 4723 (class 1259 OID 115568)
-- Name: job_seeker_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX job_seeker_user_id_key ON public.job_seeker USING btree (user_id);


--
-- TOC entry 4726 (class 1259 OID 115569)
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- TOC entry 4731 (class 2606 OID 115570)
-- Name: blog_comment blog_comment_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_comment
    ADD CONSTRAINT blog_comment_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_post(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4732 (class 2606 OID 115575)
-- Name: blog_post blog_post_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post
    ADD CONSTRAINT blog_post_author_id_fkey FOREIGN KEY (author_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4733 (class 2606 OID 115580)
-- Name: company company_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4734 (class 2606 OID 115585)
-- Name: engagement engagement_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagement
    ADD CONSTRAINT engagement_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4735 (class 2606 OID 115590)
-- Name: engagement engagement_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagement
    ADD CONSTRAINT engagement_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4738 (class 2606 OID 115595)
-- Name: job_application job_application_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_application
    ADD CONSTRAINT job_application_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4739 (class 2606 OID 115600)
-- Name: job_application job_application_job_seeker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_application
    ADD CONSTRAINT job_application_job_seeker_id_fkey FOREIGN KEY (job_seeker_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4736 (class 2606 OID 115605)
-- Name: job job_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4737 (class 2606 OID 115610)
-- Name: job job_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4740 (class 2606 OID 115615)
-- Name: job_seeker job_seeker_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_seeker
    ADD CONSTRAINT job_seeker_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4741 (class 2606 OID 115620)
-- Name: notification notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2025-09-11 13:01:28

--
-- PostgreSQL database dump complete
--

