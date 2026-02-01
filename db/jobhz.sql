--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.1

-- Started on 2025-09-08 16:14:52

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
-- TOC entry 225 (class 1259 OID 28002)
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
-- TOC entry 224 (class 1259 OID 27989)
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
-- TOC entry 218 (class 1259 OID 27930)
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
-- TOC entry 222 (class 1259 OID 27972)
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
-- TOC entry 219 (class 1259 OID 27940)
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
-- TOC entry 220 (class 1259 OID 27953)
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
-- TOC entry 221 (class 1259 OID 27963)
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
-- TOC entry 223 (class 1259 OID 27980)
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
-- TOC entry 217 (class 1259 OID 27920)
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
-- TOC entry 4940 (class 0 OID 28002)
-- Dependencies: 225
-- Data for Name: blog_comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_comment (id, post_id, author_name, author_email, content, is_approved, created_at) FROM stdin;
\.


--
-- TOC entry 4939 (class 0 OID 27989)
-- Dependencies: 224
-- Data for Name: blog_post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_post (id, title, slug, excerpt, content, featured_image, category, author_id, is_published, is_featured, views, likes, created_at, updated_at, published_at) FROM stdin;
0c2d4bda-20e4-42a5-b44b-4963a5489e16	New Blog Post	new-blog-post	Short excerpt	Blog content here	\N	Tech	c53187da-7292-4b07-8ea0-6f1c5fe84fc0	f	f	0	0	2025-09-05 10:37:21.782	2025-09-05 10:37:21.782	\N
7b8a5b96-f8ea-4a3e-8a96-6dbacbff6a62	New Blog Post8	new-blog-post8	Short excerpt1	Blog content here1	/uploads/blog/featuredImage-1757311207829-523256430.jpg	Tech	c53187da-7292-4b07-8ea0-6f1c5fe84fc0	t	f	0	0	2025-09-08 06:00:07.835	2025-09-08 06:00:07.835	2025-09-08 06:00:07.834
7349a07d-7b19-49e4-be0e-7c2ae112d1a9	New Blog Post6	new-blog-post6	Short excerpt1	Updated blog content here	C:\\Krupa_Patkar\\bahath_jobz\\job_api\\uploads\\featuredImage-1757309993260-892684081.jpg	Tech-5	c53187da-7292-4b07-8ea0-6f1c5fe84fc0	t	f	1	0	2025-09-08 05:39:29.852	2025-09-08 05:39:29.852	2025-09-08 05:39:29.851
\.


--
-- TOC entry 4933 (class 0 OID 27930)
-- Dependencies: 218
-- Data for Name: company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company (id, name, logo, banner, tagline, description, industry, website, location, contact_email, contact_phone, is_approved, employer_id, created_at, updated_at) FROM stdin;
c9b1f6d2-3a6e-4fcd-8b79-123456789abc	Tech Solutions Ltd.	logo.png	banner.png	We build software solutions	Company description goes here	IT	https://www.mycompany.com	New York, NY	contact@mycompany.com	+1-555-123-4567	t	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 12:27:40.198	2025-09-08 12:27:40.198
\.


--
-- TOC entry 4937 (class 0 OID 27972)
-- Dependencies: 222
-- Data for Name: engagement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.engagement (id, job_id, user_id, type, content, created_at) FROM stdin;
2f13b12a-d233-49a0-b669-1e6567c09b73	d7f1a2b3-1234-4567-89ab-abcdef123456	05fd8e91-1268-4372-8a30-68aff227e13f	comment	This job looks amazing!	2025-09-08 07:50:43.588
4e42d9c9-0ec8-42e2-b491-c1eea06f1dbb	d7f1a2b3-1234-4567-89ab-abcdef123456	05fd8e91-1268-4372-8a30-68aff227e13f	comment	This job looks amazing!	2025-09-08 07:52:05.665
ab47579f-fed5-4778-8c7f-d87fec7ae73d	d7f1a2b3-1234-4567-89ab-abcdef123456	05fd8e91-1268-4372-8a30-68aff227e13f	comment	This job looks nice and amazing!	2025-09-08 07:52:16.818
\.


--
-- TOC entry 4934 (class 0 OID 27940)
-- Dependencies: 219
-- Data for Name: job; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job (id, title, description, responsibilities, requirements, benefits, location, work_type, industry, education, visa_eligible, seniority, salary_min, salary_max, currency, is_approved, is_active, company_id, employer_id, created_at, updated_at, deadline) FROM stdin;
d7f1a2b3-1234-4567-89ab-abcdef123456	Senior Backend Developer	Node.js, Express, PostgreSQL	Build APIs	3+ years experience	Health, Bonus	New York	Full-time	IT	Bachelor's	t	Senior	70000	90000	USD	f	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 12:28:17.237	2025-09-08 12:28:17.237	2025-10-15 00:00:00
b81f80f9-54ac-4fb3-aa10-8d16eb42b5c2	Senior Backend Developer	Node.js, Express, PostgreSQL	Build APIs	3+ years experience	Health, Bonus	New York	Full-time	IT	Bachelor's	t	Senior	70000	90000	USD	f	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 06:58:31.336	2025-09-08 06:58:31.336	2025-10-15 00:00:00
62c75148-8fc1-46dc-b2c5-5d5ca380adad	Senior Backend Developer2	Node.js, Express, PostgreSQL	Build APIs	3+ years experience	Health, Bonus	New York	Full-time	IT	Bachelor's	t	Senior	70000	90000	USD	f	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 06:58:39.164	2025-09-08 06:58:39.164	2025-10-15 00:00:00
14f5f096-635c-4f8e-a407-913f82fea8c0	Senior Backend Developer3	Node.js, Express, PostgreSQL	Build APIs	3+ years experience	Health, Bonus	New York	Full-time	IT	Bachelor's	t	Senior	70000	90000	USD	f	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 07:00:29.76	2025-09-08 07:00:29.76	2025-10-15 00:00:00
d1aa1753-8ffd-45ee-be90-4305e4a92a5c	Senior Backend Developer4	Node.js, Express, PostgreSQL	Build APIs	3+ years experience	Health, Bonus	New York	Full-time	IT	Bachelor's	t	Senior	70000	90000	USD	f	t	c9b1f6d2-3a6e-4fcd-8b79-123456789abc	14902734-a1af-454b-8c06-7af263fda9ee	2025-09-08 07:12:58.538	2025-09-08 07:12:58.538	2025-10-15 00:00:00
\.


--
-- TOC entry 4935 (class 0 OID 27953)
-- Dependencies: 220
-- Data for Name: job_application; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_application (id, job_id, job_seeker_id, cover_note, status, applied_at, updated_at) FROM stdin;
782a3cce-ad27-4ca7-b474-e11bcae6f2c5	d7f1a2b3-1234-4567-89ab-abcdef123456	05fd8e91-1268-4372-8a30-68aff227e13f	I am very interested in this position.	applied	2025-09-08 07:44:41.026	2025-09-08 07:44:41.026
6bc48769-ca88-4ad6-8a27-a0b82fd132e9	d1aa1753-8ffd-45ee-be90-4305e4a92a5c	05fd8e91-1268-4372-8a30-68aff227e13f	I am very interested in this position.	applied	2025-09-08 07:53:33.193	2025-09-08 07:53:33.193
\.


--
-- TOC entry 4936 (class 0 OID 27963)
-- Dependencies: 221
-- Data for Name: job_seeker; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_seeker (id, user_id, summary, availability, education, experience, skills, resume_url, location, visa_status, portfolio_url, linkedin_url, created_at, updated_at) FROM stdin;
015ba48f-fad6-4798-bd63-6bb29f55dcb9	4307242d-5d0c-4dde-af09-72b18c310539	5+ years experience in full stack development	Immediately	Bachelor's Degree	Worked at ABC Corp as a Software Engineer...	["Node.js", "Express", "React", "PostgreSQL"]	\N	San Francisco, CA	Citizen	https://yourportfolio.com	https://linkedin.com/in/yourprofile	2025-09-05 05:57:14.938	2025-09-05 05:57:14.938
cd5cb66e-8609-4d88-a436-9b975ae3e713	05fd8e91-1268-4372-8a30-68aff227e13f	2.5+ years experience in full stack development	Immediately	Bachelor's Degree	Worked at ABC Corp as a Software Engineer...	["Node.js", "Express", "React", "PostgreSQL"]	\N	San Francisco, CA	Citizen	https://yourportfolio.com	https://linkedin.com/in/yourprofile	2025-09-05 10:23:23.083	2025-09-08 05:34:22.749
\.


--
-- TOC entry 4938 (class 0 OID 27980)
-- Dependencies: 223
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (id, user_id, title, message, type, is_read, created_at) FROM stdin;
6ae0b201-9023-4443-ad20-131485b49362	14902734-a1af-454b-8c06-7af263fda9ee	New Job Application	Someone applied for your job: Senior Backend Developer	application	f	2025-09-08 07:44:41.029
3e2319db-929e-40f5-8a99-8d252d924234	14902734-a1af-454b-8c06-7af263fda9ee	New Job Application	Someone applied for your job: Senior Backend Developer4	application	f	2025-09-08 07:46:26.058
667e0732-43fb-4e0f-bfa8-6282acdc0b4c	14902734-a1af-454b-8c06-7af263fda9ee	New Job Application	Someone applied for your job: Senior Backend Developer4	application	f	2025-09-08 07:53:33.195
7dc21faf-e494-4190-bfbd-3106b413a071	14902734-a1af-454b-8c06-7af263fda9ee	New Job Alert	A new job has been posted in your industry.	job_alert	f	2025-09-08 09:48:08.482
77d776bb-c425-4ffb-ab9f-db52eac89838	05fd8e91-1268-4372-8a30-68aff227e13f	New Job Alerts	A new job has been posted in your industryy.	job_alert	t	2025-09-08 10:12:47.083
9a7d8ddd-476c-469c-8fad-bff23dceec8d	05fd8e91-1268-4372-8a30-68aff227e13f	New Job Alert	A new job has been posted in your industryy.	job_alert	t	2025-09-08 10:17:45.218
cf54d1dc-245b-4867-b235-fbf33dd552f8	05fd8e91-1268-4372-8a30-68aff227e13f	New Job Alert	A new job has been posted in your industryy.	job_alert	t	2025-09-08 10:36:14.984
\.


--
-- TOC entry 4932 (class 0 OID 27920)
-- Dependencies: 217
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, password, first_name, last_name, phone, role, avatar, is_active, created_at, updated_at) FROM stdin;
4307242d-5d0c-4dde-af09-72b18c310539	test@gmail.com	$2a$12$m6C6RIIeUKhFdUl5yjDP6eS.P8IAxsVgo.cn2spZO.mHKKFviu6Rm	Test	User	9876543210	job_seeker	\N	t	2025-09-05 05:27:23.79	2025-09-05 05:27:23.79
05fd8e91-1268-4372-8a30-68aff227e13f	test2@gmail.com	$2a$12$0bdpY4MtreVYtP1V95U03eWjdDkNwPM88cRdDwtpGKI/rm6uygAD6	Test	User	9876543210	job_seeker	\N	t	2025-09-05 06:07:55.872	2025-09-05 06:07:55.872
14902734-a1af-454b-8c06-7af263fda9ee	employer@techcorp.com	$2a$12$NKY459ZuAB4T23VYr7J4culyJtZTPKlJLoNud7nvw3LONu/3zI.5i	Employer	Employer	9876543210	employer	\N	t	2025-09-05 07:57:50.989	2025-09-05 07:57:50.989
c53187da-7292-4b07-8ea0-6f1c5fe84fc0	admin@bahathjobz.com	$2a$12$k54DG5v6ZfXhcjEoaMTJp.wuak3Q0yL9uZHZzNaIEVCL/C4bdf5qy	Admin	User	9876543210	super_admin	\N	t	2025-09-05 10:29:24.039	2025-09-05 10:29:24.039
64c134cc-4f9f-46bc-9f28-acfdd759a333	employer2@techcorp.com	$2a$12$6Wq5tVvCjI8CriKG/JEhGuGfZH4DOwUDVDn/6WYhWFLWALMqmr3ve	Employer	Employer	9876543210	employer	\N	t	2025-09-08 09:03:27.437	2025-09-08 09:03:27.437
\.


--
-- TOC entry 4775 (class 2606 OID 28010)
-- Name: blog_comment blog_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_comment
    ADD CONSTRAINT blog_comment_pkey PRIMARY KEY (id);


--
-- TOC entry 4772 (class 2606 OID 28001)
-- Name: blog_post blog_post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post
    ADD CONSTRAINT blog_post_pkey PRIMARY KEY (id);


--
-- TOC entry 4758 (class 2606 OID 27939)
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- TOC entry 4768 (class 2606 OID 27979)
-- Name: engagement engagement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagement
    ADD CONSTRAINT engagement_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 27962)
-- Name: job_application job_application_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_application
    ADD CONSTRAINT job_application_pkey PRIMARY KEY (id);


--
-- TOC entry 4760 (class 2606 OID 27952)
-- Name: job job_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id);


--
-- TOC entry 4765 (class 2606 OID 27971)
-- Name: job_seeker job_seeker_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_seeker
    ADD CONSTRAINT job_seeker_pkey PRIMARY KEY (id);


--
-- TOC entry 4770 (class 2606 OID 27988)
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- TOC entry 4756 (class 2606 OID 27929)
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 4773 (class 1259 OID 28014)
-- Name: blog_post_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_post_slug_key ON public.blog_post USING btree (slug);


--
-- TOC entry 4761 (class 1259 OID 28012)
-- Name: job_application_job_id_job_seeker_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX job_application_job_id_job_seeker_id_key ON public.job_application USING btree (job_id, job_seeker_id);


--
-- TOC entry 4766 (class 1259 OID 28013)
-- Name: job_seeker_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX job_seeker_user_id_key ON public.job_seeker USING btree (user_id);


--
-- TOC entry 4754 (class 1259 OID 28011)
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- TOC entry 4786 (class 2606 OID 28065)
-- Name: blog_comment blog_comment_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_comment
    ADD CONSTRAINT blog_comment_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_post(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4785 (class 2606 OID 28060)
-- Name: blog_post blog_post_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post
    ADD CONSTRAINT blog_post_author_id_fkey FOREIGN KEY (author_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4776 (class 2606 OID 28015)
-- Name: company company_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4782 (class 2606 OID 28045)
-- Name: engagement engagement_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagement
    ADD CONSTRAINT engagement_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4783 (class 2606 OID 28050)
-- Name: engagement engagement_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagement
    ADD CONSTRAINT engagement_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4779 (class 2606 OID 28030)
-- Name: job_application job_application_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_application
    ADD CONSTRAINT job_application_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4780 (class 2606 OID 28035)
-- Name: job_application job_application_job_seeker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_application
    ADD CONSTRAINT job_application_job_seeker_id_fkey FOREIGN KEY (job_seeker_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4777 (class 2606 OID 28020)
-- Name: job job_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4778 (class 2606 OID 28025)
-- Name: job job_employer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4781 (class 2606 OID 28040)
-- Name: job_seeker job_seeker_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_seeker
    ADD CONSTRAINT job_seeker_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4784 (class 2606 OID 28055)
-- Name: notification notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2025-09-08 16:14:52

--
-- PostgreSQL database dump complete
--

