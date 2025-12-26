--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS "FK_dfb1935b711a420d68429ff7134";
ALTER TABLE IF EXISTS ONLY public.sections DROP CONSTRAINT IF EXISTS "FK_d5f20ca11e0e24c02e6f6345101";
ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS "FK_9e5684667ea189ade0fc79fa4f1";
ALTER TABLE IF EXISTS ONLY public.itees_records DROP CONSTRAINT IF EXISTS "FK_2c8ce129cca5c7a680e008494bd";
ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS "FK_29b14d5bb99ac9fe8ba6c5aa728";
ALTER TABLE IF EXISTS ONLY public.sections DROP CONSTRAINT IF EXISTS "FK_0fc0dc8ce98e7dc47c273f85e3d";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3";
ALTER TABLE IF EXISTS ONLY public.rooms DROP CONSTRAINT IF EXISTS "UQ_368d83b661b9670e7be1bbb9cdd";
ALTER TABLE IF EXISTS ONLY public.sections DROP CONSTRAINT IF EXISTS "PK_f9749dd3bffd880a497d007e450";
ALTER TABLE IF EXISTS ONLY public.assignments DROP CONSTRAINT IF EXISTS "PK_c54ca359535e0012b04dcbd80ee";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS "PK_a3ffb1c0c8416b9fc6f907b7433";
ALTER TABLE IF EXISTS ONLY public.itees_records DROP CONSTRAINT IF EXISTS "PK_85b6e4c3ca2ccf77d06ed00ddfb";
ALTER TABLE IF EXISTS ONLY public.faculty DROP CONSTRAINT IF EXISTS "PK_635ca3484f9c747b6635a494ad9";
ALTER TABLE IF EXISTS ONLY public.courses DROP CONSTRAINT IF EXISTS "PK_3f70a487cc718ad8eda4e6d58c9";
ALTER TABLE IF EXISTS ONLY public.rooms DROP CONSTRAINT IF EXISTS "PK_0368a2d7c215f2d0458a54933f2";
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.sections;
DROP TABLE IF EXISTS public.rooms;
DROP TABLE IF EXISTS public.itees_records;
DROP TABLE IF EXISTS public.faculty;
DROP TABLE IF EXISTS public.courses;
DROP TABLE IF EXISTS public.assignments;
DROP TYPE IF EXISTS public.users_role_enum;
DROP TYPE IF EXISTS public.sections_status_enum;
DROP TYPE IF EXISTS public.sections_classtype_enum;
DROP TYPE IF EXISTS public.rooms_type_enum;
DROP TYPE IF EXISTS public.itees_records_rating_enum;
DROP TYPE IF EXISTS public.faculty_type_enum;
DROP TYPE IF EXISTS public.assignments_type_enum;
DROP TYPE IF EXISTS public.assignments_status_enum;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: assignments_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.assignments_status_enum AS ENUM (
    'Proposed',
    'Approved',
    'Active',
    'Completed'
);


ALTER TYPE public.assignments_status_enum OWNER TO postgres;

--
-- Name: assignments_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.assignments_type_enum AS ENUM (
    'Regular',
    'Extra',
    'OJT',
    'Seminar'
);


ALTER TYPE public.assignments_type_enum OWNER TO postgres;

--
-- Name: faculty_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.faculty_type_enum AS ENUM (
    'Regular',
    'PartTime',
    'Temporary',
    'Designee',
    'AdminFaculty'
);


ALTER TYPE public.faculty_type_enum OWNER TO postgres;

--
-- Name: itees_records_rating_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.itees_records_rating_enum AS ENUM (
    'Outstanding',
    'Very Satisfactory',
    'Satisfactory',
    'Fair',
    'Poor'
);


ALTER TYPE public.itees_records_rating_enum OWNER TO postgres;

--
-- Name: rooms_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rooms_type_enum AS ENUM (
    'Lecture',
    'Laboratory',
    'Multi-purpose',
    'Other'
);


ALTER TYPE public.rooms_type_enum OWNER TO postgres;

--
-- Name: sections_classtype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sections_classtype_enum AS ENUM (
    'Regular',
    'Laboratory',
    'Lecture',
    'Combined'
);


ALTER TYPE public.sections_classtype_enum OWNER TO postgres;

--
-- Name: sections_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sections_status_enum AS ENUM (
    'Planning',
    'Assigned',
    'Active',
    'Completed',
    'Cancelled'
);


ALTER TYPE public.sections_status_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'Admin',
    'Chair',
    'Faculty',
    'Dean'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "facultyId" uuid NOT NULL,
    "courseId" uuid NOT NULL,
    type public.assignments_type_enum NOT NULL,
    status public.assignments_status_enum DEFAULT 'Proposed'::public.assignments_status_enum NOT NULL,
    "timeSlot" jsonb NOT NULL,
    semester character varying NOT NULL,
    "academicYear" character varying NOT NULL,
    section character varying,
    "sectionId" uuid,
    room character varying,
    "creditHours" numeric(4,1) NOT NULL,
    "contactHours" numeric(4,1) NOT NULL,
    "lectureHours" numeric(3,1) DEFAULT '0'::numeric NOT NULL,
    "laboratoryHours" numeric(3,1) DEFAULT '0'::numeric NOT NULL,
    "approvedBy" character varying,
    "approvedAt" timestamp without time zone,
    notes character varying,
    "isSubstitution" boolean DEFAULT false NOT NULL,
    "originalFacultyId" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.assignments OWNER TO postgres;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying NOT NULL,
    name character varying NOT NULL,
    credits numeric(3,1) NOT NULL,
    "contactHours" numeric(4,1) NOT NULL,
    "lectureHours" numeric(3,1) DEFAULT '0'::numeric NOT NULL,
    "laboratoryHours" numeric(3,1) DEFAULT '0'::numeric NOT NULL,
    program character varying NOT NULL,
    department character varying NOT NULL,
    semester character varying NOT NULL,
    "academicYear" character varying NOT NULL,
    "requiresNightSection" boolean DEFAULT false NOT NULL,
    "preferredTimeSlots" jsonb,
    room character varying,
    "maxStudents" integer DEFAULT 40 NOT NULL,
    "enrolledStudents" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: faculty; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.faculty (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "employeeId" character varying NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    email character varying NOT NULL,
    type public.faculty_type_enum NOT NULL,
    department character varying NOT NULL,
    college character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    preferences jsonb,
    "currentRegularLoad" integer DEFAULT 0 NOT NULL,
    "currentExtraLoad" integer DEFAULT 0 NOT NULL,
    "consecutiveLowRatings" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.faculty OWNER TO postgres;

--
-- Name: itees_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.itees_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "facultyId" uuid NOT NULL,
    semester character varying NOT NULL,
    "academicYear" character varying NOT NULL,
    rating public.itees_records_rating_enum NOT NULL,
    "numericalScore" numeric(3,2) NOT NULL,
    "evaluatorCount" integer,
    comments character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.itees_records OWNER TO postgres;

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying NOT NULL,
    name character varying,
    building character varying,
    type public.rooms_type_enum DEFAULT 'Lecture'::public.rooms_type_enum NOT NULL,
    capacity integer DEFAULT 40 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "sectionCode" character varying NOT NULL,
    "courseId" uuid NOT NULL,
    "facultyId" uuid,
    status public.sections_status_enum DEFAULT 'Planning'::public.sections_status_enum NOT NULL,
    "classType" public.sections_classtype_enum DEFAULT 'Regular'::public.sections_classtype_enum NOT NULL,
    semester character varying NOT NULL,
    "academicYear" character varying NOT NULL,
    "maxStudents" integer DEFAULT 30 NOT NULL,
    "enrolledStudents" integer DEFAULT 0 NOT NULL,
    room character varying,
    "timeSlots" jsonb,
    "isNightSection" boolean DEFAULT false NOT NULL,
    "lectureHours" numeric(3,1) DEFAULT '0'::numeric NOT NULL,
    "laboratoryHours" numeric(3,1) DEFAULT '0'::numeric NOT NULL,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sections OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    role public.users_role_enum DEFAULT 'Faculty'::public.users_role_enum NOT NULL,
    department character varying,
    college character varying,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignments (id, "facultyId", "courseId", type, status, "timeSlot", semester, "academicYear", section, "sectionId", room, "creditHours", "contactHours", "lectureHours", "laboratoryHours", "approvedBy", "approvedAt", notes, "isSubstitution", "originalFacultyId", "createdAt", "updatedAt") FROM stdin;
b5fca394-2093-4604-97fa-48958da56b5c	bd9d5947-770b-4252-9443-8c20a49baaec	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	Regular	Active	{"endTime": "19:30", "dayOfWeek": 1, "startTime": "16:30"}	First	2025-2026	DCPET 1-1	\N	\N	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.179423	2025-06-19 09:53:31.179423
77aa23cd-fda0-4cab-977f-ce8f9dbe3d17	bd9d5947-770b-4252-9443-8c20a49baaec	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	Regular	Active	{"endTime": "19:30", "dayOfWeek": 4, "startTime": "16:30"}	First	2025-2026	DCPET 1-1	\N	\N	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.182991	2025-06-19 09:53:31.182991
61f68dd2-e381-4fb0-affa-93cadbf63e25	bd9d5947-770b-4252-9443-8c20a49baaec	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	Regular	Active	{"endTime": "10:30", "dayOfWeek": 2, "startTime": "07:30"}	First	2025-2026	DCPET 1-2	\N	IT205	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.185397	2025-06-19 09:53:31.185397
2a85525d-11d5-408c-a70e-9be546f0a7d3	bd9d5947-770b-4252-9443-8c20a49baaec	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	Regular	Active	{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}	First	2025-2026	DCPET 1-2	\N	IT205	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.187881	2025-06-19 09:53:31.187881
5718a553-45b0-4764-8d99-fc28a3660257	bd9d5947-770b-4252-9443-8c20a49baaec	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	Regular	Active	{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}	First	2025-2026	DCPET 1-3	\N	IT205	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.190511	2025-06-19 09:53:31.190511
e5ca5848-c98b-4f07-a4f7-30356772e615	bd9d5947-770b-4252-9443-8c20a49baaec	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	Regular	Active	{"endTime": "16:30", "dayOfWeek": 4, "startTime": "13:30"}	First	2025-2026	DCPET 1-3	\N	IT205	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.192856	2025-06-19 09:53:31.192856
0d5301ab-279a-4690-985f-ee1c230bb76f	bfc7543a-6184-4572-9073-52a63086312b	182ca134-660c-4c11-a321-d62870e9a1a2	Regular	Active	{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}	First	2025-2026	DCPET 1-1	\N	IT204	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.195381	2025-06-19 09:53:31.195381
c786b9f4-a535-4aaf-9a2b-bf96cf6b3d64	bfc7543a-6184-4572-9073-52a63086312b	182ca134-660c-4c11-a321-d62870e9a1a2	Regular	Active	{"endTime": "13:30", "dayOfWeek": 4, "startTime": "10:30"}	First	2025-2026	DCPET 1-1	\N	IT204	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.197763	2025-06-19 09:53:31.197763
5af116fe-6e79-4565-9923-ca4b35f42e14	bfc7543a-6184-4572-9073-52a63086312b	182ca134-660c-4c11-a321-d62870e9a1a2	Regular	Active	{"endTime": "18:00", "dayOfWeek": 1, "startTime": "16:30"}	First	2025-2026	DCPET 1-3	\N	IT204	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.200212	2025-06-19 09:53:31.200212
a5d190c3-8771-4ec3-8c0c-9d2be2ebbc86	bfc7543a-6184-4572-9073-52a63086312b	182ca134-660c-4c11-a321-d62870e9a1a2	Regular	Active	{"endTime": "18:00", "dayOfWeek": 4, "startTime": "16:30"}	First	2025-2026	DCPET 1-3	\N	IT204	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.202591	2025-06-19 09:53:31.202591
ca7f3d2c-7693-4bb4-bbbf-58d30f49250f	bfc7543a-6184-4572-9073-52a63086312b	182ca134-660c-4c11-a321-d62870e9a1a2	Regular	Active	{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}	First	2025-2026	DCPET 1-3	\N	IT204	2.0	6.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.20491	2025-06-19 09:53:31.20491
1d62cc34-4ad0-4ec0-a6b9-426b8db83c1b	f79ad68d-e276-4acb-9f9a-dc26a56df575	7e289bb8-3457-4c3d-a426-9deb394b4e76	Regular	Active	{"endTime": "10:30", "dayOfWeek": 1, "startTime": "07:30"}	First	2025-2026	DCPET 1-1	\N	IT204	3.0	5.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.207302	2025-06-19 09:53:31.207302
6be83efb-54bf-404c-8dab-423c332d79c6	f79ad68d-e276-4acb-9f9a-dc26a56df575	7e289bb8-3457-4c3d-a426-9deb394b4e76	Regular	Active	{"endTime": "09:30", "dayOfWeek": 4, "startTime": "07:30"}	First	2025-2026	DCPET 1-1	\N	IT204	3.0	5.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.209578	2025-06-19 09:53:31.209578
b6a1f6dd-1fbb-4d15-a07e-1ec9746d7104	f79ad68d-e276-4acb-9f9a-dc26a56df575	7e289bb8-3457-4c3d-a426-9deb394b4e76	Regular	Active	{"endTime": "13:30", "dayOfWeek": 2, "startTime": "10:30"}	First	2025-2026	DCPET 1-2	\N	IT204	3.0	5.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.212059	2025-06-19 09:53:31.212059
9645d113-edf6-4935-9196-2dc0f8bd5441	f79ad68d-e276-4acb-9f9a-dc26a56df575	7e289bb8-3457-4c3d-a426-9deb394b4e76	Regular	Active	{"endTime": "12:30", "dayOfWeek": 5, "startTime": "10:30"}	First	2025-2026	DCPET 1-2	\N	IT204	3.0	5.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.214529	2025-06-19 09:53:31.214529
4feafa38-84cd-42b8-a841-c58f2730f5ec	f79ad68d-e276-4acb-9f9a-dc26a56df575	7e289bb8-3457-4c3d-a426-9deb394b4e76	Regular	Active	{"endTime": "12:30", "dayOfWeek": 1, "startTime": "10:30"}	First	2025-2026	DCPET 1-3	\N	IT204	3.0	5.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.216917	2025-06-19 09:53:31.216917
198fec0b-e2a1-4fc2-ad84-e0bb132742aa	f79ad68d-e276-4acb-9f9a-dc26a56df575	7e289bb8-3457-4c3d-a426-9deb394b4e76	Regular	Active	{"endTime": "13:00", "dayOfWeek": 4, "startTime": "10:00"}	First	2025-2026	DCPET 1-3	\N	IT204	3.0	5.0	0.0	0.0	\N	\N	\N	f	\N	2025-06-19 09:53:31.219342	2025-06-19 09:53:31.219342
1f848a76-ff36-44b6-8593-4663480575a4	bfc7543a-6184-4572-9073-52a63086312b	95e06763-bc9d-4e6b-81f2-6d25892ff526	Regular	Active	{"endTime": "13:30", "dayOfWeek": 2, "startTime": "10:30"}	First	2025-2026	DCPET 2-1	7d0338b8-5026-455e-a9ac-f58eee761f6c	TBA	2.0	6.0	0.0	0.0	System	2025-06-19 19:13:38.24	Auto-created from section assignment	f	\N	2025-06-19 11:13:38.241224	2025-06-19 11:13:38.241224
02da8d7c-18e7-427c-8687-791b5d95c8eb	f79ad68d-e276-4acb-9f9a-dc26a56df575	40582042-1cb3-4923-9eef-cd23bb4eda13	Regular	Active	{"endTime": "09:30", "dayOfWeek": 2, "startTime": "07:30"}	Second	2025-2026	DCPET 1-1	c5ae4a71-a5ae-4575-ace7-3989d091bf8a	201	3.0	5.0	2.0	3.0	System	2025-12-15 13:32:27.175	Auto-created from section assignment	f	\N	2025-12-15 05:32:27.176297	2025-12-15 05:32:27.176297
6f4b7dc5-0972-448a-9a6a-cf2c23977e64	bd9d5947-770b-4252-9443-8c20a49baaec	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	Regular	Active	{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}	Second	2025-2026	DCPET 1-1	70a46687-7ef5-4b3f-a5ca-53e5cb7166cc	DCPET 1-1	2.0	6.0	0.0	0.0	System	2025-12-15 13:33:43.953	Auto-created from section assignment	f	\N	2025-12-15 05:33:43.95417	2025-12-15 05:33:43.95417
fb8156b3-f771-41cf-bb7c-1f8e4ec9ccef	b07069bd-2310-4bf9-a080-fbb91b1c1cde	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	Regular	Active	{"endTime": "13:30", "dayOfWeek": 2, "startTime": "10:30"}	Second	2025-2026	DCPET 1-1	379ed55c-2e64-4d1c-bfb1-e63d2ec673d7	TRA	1.0	3.0	0.0	0.0	System	2025-12-15 13:41:40.982	Auto-created from section assignment	f	\N	2025-12-15 05:41:40.983194	2025-12-15 05:41:40.983194
2043e08c-5f59-4e94-9f98-54c69fb4246a	bfc7543a-6184-4572-9073-52a63086312b	b4248701-7003-4365-9414-58b0fcce28ce	Regular	Active	{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}	Second	2025-2026	DCPET 1-1	e9fe7224-7c8c-4a31-8c12-658541003f1d	IT204	2.0	6.0	0.0	6.0	System	2025-12-15 13:43:27.133	Auto-created from section assignment	f	\N	2025-12-15 05:43:27.133754	2025-12-15 05:43:27.133754
39eb9bed-9376-4069-a54e-5eca81dba232	bd9d5947-770b-4252-9443-8c20a49baaec	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	Extra	Active	{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}	Second	2025-2026	DCPET 1-2	56dc97ad-0cb7-4c6f-9f0c-c15ec10f3455	205	2.0	6.0	0.0	0.0	System	2025-12-15 13:48:38.444	Auto-created from section assignment	f	\N	2025-12-15 05:48:38.444565	2025-12-15 05:48:38.444565
8a2b92e4-9ba7-4724-a342-4c10d3aa040d	b07069bd-2310-4bf9-a080-fbb91b1c1cde	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	Regular	Active	{"endTime": "10:30", "dayOfWeek": 1, "startTime": "07:30"}	Second	2025-2026	DCPET 1-2	79f443d6-4a97-493d-b32b-dba62e10f702	IT205	1.0	3.0	0.0	0.0	System	2025-12-15 13:49:16.102	Auto-created from section assignment	f	\N	2025-12-15 05:49:16.102619	2025-12-15 05:49:16.102619
f4805b80-3a53-4782-9c77-d8ff806213a0	f79ad68d-e276-4acb-9f9a-dc26a56df575	40582042-1cb3-4923-9eef-cd23bb4eda13	Regular	Active	{"endTime": "11:30", "dayOfWeek": 2, "startTime": "09:30"}	Second	2025-2026	DCPET 1-2	7b6161e7-42b6-48da-b8ba-87fc676efa38	201	3.0	5.0	2.0	3.0	System	2025-12-15 14:07:45.279	Auto-created from section assignment	f	\N	2025-12-15 06:07:45.279559	2025-12-15 06:07:45.279559
da9d0601-6039-4b47-9b3e-ce52a9eeb16d	bd9d5947-770b-4252-9443-8c20a49baaec	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	Extra	Active	{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}	Second	2025-2026	DCPET 1-3	c7e47104-e2a3-43dd-b84a-ef540e8522c9	DCPET 1-2	2.0	6.0	0.0	0.0	System	2025-12-15 14:12:47.19	Auto-created from section assignment	f	\N	2025-12-15 06:12:47.190515	2025-12-15 06:12:47.190515
444d29a4-5a20-48f7-b4e0-08ffe2cd9712	b07069bd-2310-4bf9-a080-fbb91b1c1cde	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	Regular	Active	{"endTime": "10:30", "dayOfWeek": 2, "startTime": "07:30"}	Second	2025-2026	DCPET 1-3	9960633b-8cf3-4619-a8bb-11428d85480c	TRA	1.0	3.0	0.0	0.0	System	2025-12-15 14:13:14.732	Auto-created from section assignment	f	\N	2025-12-15 06:13:14.732739	2025-12-15 06:13:14.732739
d45510c4-f2fe-408c-afbf-dc7daa3da111	f79ad68d-e276-4acb-9f9a-dc26a56df575	40582042-1cb3-4923-9eef-cd23bb4eda13	Extra	Active	{"endTime": "15:30", "dayOfWeek": 2, "startTime": "13:30"}	Second	2025-2026	DCPET 1-3	6c91eff6-dfb2-4517-a36d-e6c9a0b053f0	204	3.0	5.0	2.0	3.0	System	2025-12-15 14:42:56.319	Auto-created from section assignment	f	\N	2025-12-15 06:42:56.320083	2025-12-15 06:42:56.320083
b383823b-e5f7-41fb-ae85-b74fbdc4aba1	401ff400-4855-4d7a-93b4-39de2b6acd3a	186afdfd-e8fa-45a8-acbe-c734e1f4f735	Regular	Active	{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}	Second	2025-2026	DCPET 2-1	118fe8fa-8fea-4629-87c2-19452e8a800a	IT212	4.0	6.0	3.0	3.0	System	2025-12-15 16:19:48.888	Auto-created from section assignment	f	\N	2025-12-15 08:19:48.889363	2025-12-15 08:19:48.889363
4ed0e97a-bc7e-4cc0-9963-f9a19dc8ff57	677387ce-78df-41af-aba9-9d010ee3f9bf	9883306d-ffac-4029-8298-97a25bb5e83d	Regular	Active	{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}	Second	2025-2026	DCPET 2-1	d2d5c7bd-e9dc-40d3-9187-41c7ea42ccd1	201	3.0	3.0	3.0	0.0	System	2025-12-15 16:20:56.442	Auto-created from section assignment	f	\N	2025-12-15 08:20:56.442433	2025-12-15 08:20:56.442433
4e1a5e90-8b66-4926-94ad-88481436917b	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	5f101b5b-bbf6-4f02-a448-d066e9e55b93	Regular	Active	{"endTime": "13:30", "dayOfWeek": 2, "startTime": "11:30"}	Second	2025-2026	DCPET 2-1	c74d1cb3-a5f1-44de-ae02-992c9eb29dd0	IT204	3.0	5.0	2.0	3.0	System	2025-12-15 16:22:23.656	Auto-created from section assignment	f	\N	2025-12-15 08:22:23.657041	2025-12-15 08:22:23.657041
a0886c22-6e86-4764-975a-c48c2f1dbab8	681ca93b-d7f4-4140-a189-77d76f6c0621	82076eb1-258d-4c81-b862-cefe4541f77d	Regular	Active	{"endTime": "21:00", "dayOfWeek": 2, "startTime": "18:00"}	Second	2025-2026	DCPET 2-1	c4b3e8da-4641-490d-88b8-d53dbc49babe	204	2.0	6.0	0.0	6.0	System	2025-12-15 16:23:34.2	Auto-created from section assignment	f	\N	2025-12-15 08:23:34.200765	2025-12-15 08:23:34.200765
5daf4926-15e6-475a-a9bd-88b5621c7477	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	Regular	Active	{"endTime": "12:00", "dayOfWeek": 3, "startTime": "09:00"}	Second	2025-2026	DCPET 2-1	81be8b02-cc51-4a7b-aa70-e6402180812f	DCPET 2-1	3.0	5.0	2.0	3.0	System	2025-12-15 16:31:59.636	Auto-created from section assignment	f	\N	2025-12-15 08:31:59.63746	2025-12-15 08:31:59.63746
c55ac3a3-356f-42ef-aa94-9e09dd3e46a5	401ff400-4855-4d7a-93b4-39de2b6acd3a	186afdfd-e8fa-45a8-acbe-c734e1f4f735	Extra	Active	{"endTime": "09:00", "dayOfWeek": 1, "startTime": "07:30"}	Second	2025-2026	DCPET 2-2	b02aca5d-3153-4998-b5a2-da978c4ca680	IT212	4.0	6.0	3.0	3.0	System	2025-12-15 16:37:12.968	Auto-created from section assignment	f	\N	2025-12-15 08:37:12.968676	2025-12-15 08:37:12.968676
c4049f95-4ce5-4aad-b4c0-6faf998a71d3	677387ce-78df-41af-aba9-9d010ee3f9bf	9883306d-ffac-4029-8298-97a25bb5e83d	Regular	Active	{"endTime": "15:00", "dayOfWeek": 4, "startTime": "12:00"}	Second	2025-2026	DCPET 2-2	8cdaf3f9-79c1-43c9-992d-3ba8907ec157	IT204	3.0	3.0	3.0	0.0	System	2025-12-15 16:43:06.704	Auto-created from section assignment	f	\N	2025-12-15 08:43:06.705325	2025-12-15 08:43:06.705325
a41c406d-a6ac-4632-8e3c-540ac0f41fcd	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	Regular	Active	{"endTime": "16:00", "dayOfWeek": 3, "startTime": "13:00"}	Second	2025-2026	DCPET 2-2	2600589e-ea9a-4cc7-9d8b-79d8250c8bcf	DCPET 2-2	3.0	5.0	2.0	3.0	System	2025-12-15 16:43:49.209	Auto-created from section assignment	f	\N	2025-12-15 08:43:49.209415	2025-12-15 08:43:49.209415
385a4968-e1a5-4340-bf20-ac7ce9fb7601	681ca93b-d7f4-4140-a189-77d76f6c0621	82076eb1-258d-4c81-b862-cefe4541f77d	Regular	Active	{"endTime": "13:30", "dayOfWeek": 2, "startTime": "10:30"}	Second	2025-2026	DCPET 2-2	7209f1a4-2fb0-4d92-b26f-0200de73e630	204	2.0	6.0	0.0	6.0	System	2025-12-15 16:46:32.084	Auto-created from section assignment	f	\N	2025-12-15 08:46:32.084667	2025-12-15 08:46:32.084667
103f61e3-0ab4-4566-94ef-1d5b4ac7c50d	781a823d-3e2f-4902-a402-56ab3363e762	3538ba22-33a5-4388-859e-a7bf9f3c8db6	Regular	Active	{"endTime": "16:30", "dayOfWeek": 2, "startTime": "13:30"}	Second	2025-2026	DCPET 2-1	9dcc3e19-c7de-4278-b3ce-49e7e770f5c4	205	2.0	6.0	0.0	6.0	System	2025-12-15 16:51:38	Auto-created from section assignment	f	\N	2025-12-15 08:51:38.001013	2025-12-15 08:51:38.001013
085d2aee-3110-4ea7-ad71-d454139be3fc	781a823d-3e2f-4902-a402-56ab3363e762	40cb7f22-3883-4382-aee7-b026152a446f	Regular	Active	{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}	Second	2025-2026	DC PET 3-1	82e1459f-ffcb-4379-aa09-707b7b937388	DC PET 3-1	3.0	7.0	1.0	6.0	System	2025-12-15 18:08:26.393	Auto-created from section assignment	f	\N	2025-12-15 10:08:26.393948	2025-12-15 10:08:26.393948
10c06cd2-658c-4e43-ac72-cb7d50107608	bfc7543a-6184-4572-9073-52a63086312b	589aed1c-55dc-476f-9c47-304b89643863	Extra	Active	{"endTime": "21:00", "dayOfWeek": 6, "startTime": "18:00"}	Second	2025-2026	DC PET 3-1	7a3844df-c400-4ef8-9245-c0f46a0ecc4a	TBA	2.0	6.0	0.0	6.0	System	2025-12-15 18:10:48.822	Auto-created from section assignment	f	\N	2025-12-15 10:10:48.822999	2025-12-15 10:10:48.822999
937d941f-67de-4262-aba2-59e4cd95e6f0	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	3538ba22-33a5-4388-859e-a7bf9f3c8db6	Regular	Active	{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}	Second	2025-2026	DCPET 2-3	90eba4de-331c-44c6-b9b9-f86db6bb3f99	204	2.0	6.0	0.0	6.0	System	2025-12-15 18:28:23.254	Auto-created from section assignment	f	\N	2025-12-15 10:28:23.255374	2025-12-15 10:28:23.255374
45a887c2-d1e5-43da-8f32-9ec4c7c3ace0	a988a353-7a8d-4643-8884-8ce7ddea676b	186afdfd-e8fa-45a8-acbe-c734e1f4f735	Regular	Active	{"endTime": "20:00", "dayOfWeek": 1, "startTime": "17:00"}	Second	2025-2026	DCPET 2-3	f24458f7-e2f5-4bd3-9495-75a28da9af58	205	4.0	6.0	3.0	3.0	System	2025-12-15 18:38:38.696	Auto-created from section assignment	f	\N	2025-12-15 10:38:38.697282	2025-12-15 10:38:38.697282
d8d7324b-c1d5-4951-ac20-737a6fe88736	677387ce-78df-41af-aba9-9d010ee3f9bf	9883306d-ffac-4029-8298-97a25bb5e83d	Regular	Active	{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}	Second	2025-2026	DCPET 2-3	a5ead9a6-75f2-4257-a713-68ac2af5683b	IT205	3.0	3.0	3.0	0.0	System	2025-12-15 18:46:21.538	Auto-created from section assignment	f	\N	2025-12-15 10:46:21.539127	2025-12-15 10:46:21.539127
cf3faa47-83d9-41ef-baf1-cc1f19b44382	f79ad68d-e276-4acb-9f9a-dc26a56df575	5f101b5b-bbf6-4f02-a448-d066e9e55b93	Extra	Active	{"endTime": "17:00", "dayOfWeek": 3, "startTime": "14:00"}	Second	2025-2026	DCPET 2-3	f349292e-09f3-4ac5-b409-24d02af0beea	204	3.0	5.0	2.0	3.0	System	2025-12-15 18:47:22.379	Auto-created from section assignment	f	\N	2025-12-15 10:47:22.379716	2025-12-15 10:47:22.379716
de173f9c-1605-40e3-8304-ce7bba59a5b7	681ca93b-d7f4-4140-a189-77d76f6c0621	82076eb1-258d-4c81-b862-cefe4541f77d	Regular	Active	{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}	Second	2025-2026	DCPET 2-3	032b0335-93db-463b-be4c-524ed19b842c	204	2.0	6.0	0.0	6.0	System	2025-12-15 18:49:12.09	Auto-created from section assignment	f	\N	2025-12-15 10:49:12.090357	2025-12-15 10:49:12.090357
13f8d7fe-fdf7-4927-b73d-b53360c5f6e3	401ff400-4855-4d7a-93b4-39de2b6acd3a	04236cc6-1cc8-45fa-8b1c-5277b89666d6	Regular	Active	{"endTime": "12:30", "dayOfWeek": 4, "startTime": "09:30"}	Second	2025-2026	DC PET 3-1	d54ddbe6-499b-42f4-ac48-ce1cf73169a4	field	2.0	6.0	0.0	6.0	System	2025-12-15 19:05:32.508	Auto-created from section assignment	f	\N	2025-12-15 11:05:32.508731	2025-12-15 11:05:32.508731
5cac9453-ff63-4511-adcf-04c2204f1976	401ff400-4855-4d7a-93b4-39de2b6acd3a	40cb7f22-3883-4382-aee7-b026152a446f	Extra	Active	{"endTime": "21:00", "dayOfWeek": 5, "startTime": "18:00"}	Second	2025-2026	DC PET 3-2	8847c335-0f2d-4b9e-b4ff-2f1fcfdeb08a	DC PET 3-2	3.0	7.0	1.0	6.0	System	2025-12-15 19:08:37.794	Auto-created from section assignment	f	\N	2025-12-15 11:08:37.795249	2025-12-15 11:08:37.795249
60970448-91a0-4aa9-9871-d71472e50a33	401ff400-4855-4d7a-93b4-39de2b6acd3a	589aed1c-55dc-476f-9c47-304b89643863	Extra	Active	{"endTime": "21:00", "dayOfWeek": 2, "startTime": "18:00"}	Second	2025-2026	DC PET 3-2	419b7331-3065-4b23-97c5-e6458257322e	field	2.0	6.0	0.0	6.0	System	2025-12-15 19:10:48.686	Auto-created from section assignment	f	\N	2025-12-15 11:10:48.687122	2025-12-15 11:10:48.687122
1884b5c1-1c97-42c7-a140-b075303cd53b	681ca93b-d7f4-4140-a189-77d76f6c0621	04236cc6-1cc8-45fa-8b1c-5277b89666d6	Regular	Active	{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}	Second	2025-2026	DC PET 3-2	c653c85c-44d9-4ab5-8864-85ac31b052ac	201	2.0	6.0	0.0	6.0	System	2025-12-15 19:13:02.154	Auto-created from section assignment	f	\N	2025-12-15 11:13:02.155072	2025-12-15 11:13:02.155072
69c82179-6d12-48e9-b975-019959cc7a6e	677387ce-78df-41af-aba9-9d010ee3f9bf	40cb7f22-3883-4382-aee7-b026152a446f	Regular	Active	{"endTime": "21:00", "dayOfWeek": 1, "startTime": "18:00"}	Second	2025-2026	DC PET 3-3	8d869914-372f-45ee-8b0c-28c6129e9af7	DC PET 3-3	3.0	7.0	1.0	6.0	System	2025-12-15 19:14:38.953	Auto-created from section assignment	f	\N	2025-12-15 11:14:38.95432	2025-12-15 11:14:38.95432
e83e239b-1fab-4b0e-b340-1b06160f5e6e	d7d4dc55-08c9-433a-99f4-09d84041aec7	589aed1c-55dc-476f-9c47-304b89643863	Regular	Active	{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}	Second	2025-2026	DC PET 3-3	2fdc6d32-9194-40f3-9624-ebd5f19c3143	online	2.0	6.0	0.0	6.0	System	2025-12-15 19:17:01.793	Auto-created from section assignment	f	\N	2025-12-15 11:17:01.793564	2025-12-15 11:17:01.793564
af3cbf31-e2fb-4f6b-9c97-eafb5161b3fd	781a823d-3e2f-4902-a402-56ab3363e762	04236cc6-1cc8-45fa-8b1c-5277b89666d6	Regular	Active	{"endTime": "21:00", "dayOfWeek": 5, "startTime": "18:00"}	Second	2025-2026	DC PET 3-3	939b0fad-d785-4059-b782-7b7e57d400e2	TBA	2.0	6.0	0.0	6.0	System	2025-12-15 19:19:55.675	Auto-created from section assignment	f	\N	2025-12-15 11:19:55.675933	2025-12-15 11:19:55.675933
c7b62443-3655-454b-b9f0-3ada0cea6dec	b07069bd-2310-4bf9-a080-fbb91b1c1cde	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	Regular	Active	{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}	Second	2025-2026	DECET 1-1	0e98e5b0-c721-4dcf-86ba-04968525e9f3	213	1.0	3.0	0.0	0.0	System	2025-12-15 19:23:54.9	Auto-created from section assignment	f	\N	2025-12-15 11:23:54.9009	2025-12-15 11:23:54.9009
342891eb-c496-40ca-9acd-40693b95b971	d7098608-af01-4f3b-8727-9c5bda6569dc	9b31cc69-9761-4bc5-84d9-9ea2f3b6081d	Regular	Active	{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}	Second	2025-2026	DECET 1-1	ea40a644-e638-4620-8ab3-f8678e535155	200	3.0	5.0	2.0	3.0	System	2025-12-15 19:37:08.847	Auto-created from section assignment	f	\N	2025-12-15 11:37:08.847397	2025-12-15 11:37:08.847397
3f7b43cb-9d71-465c-9691-6a2420691240	0b3f53cd-6504-4e29-af93-e727d98b58b0	eb110c4f-3ed9-42b6-89be-86fb3e1777ff	Regular	Active	{"endTime": "10:30", "dayOfWeek": 2, "startTime": "07:30"}	Second	2025-2026	DECET 1-1	595e7f5f-610d-4237-b0b5-db237234fc12	200	2.0	6.0	0.0	6.0	System	2025-12-15 19:43:40.105	Auto-created from section assignment	f	\N	2025-12-15 11:43:40.105513	2025-12-15 11:43:40.105513
407a39dc-c9e7-4083-a01e-0370b72bdba7	0b3f53cd-6504-4e29-af93-e727d98b58b0	9ac920a5-a95d-46c4-9a0f-2830ccebd73b	Regular	Active	{"endTime": "16:30", "dayOfWeek": 2, "startTime": "13:30"}	Second	2025-2026	DECET 1-1	54082bb2-3b69-4f6c-8b44-92c855752fe3	201	4.0	6.0	3.0	3.0	System	2025-12-15 19:46:14.186	Auto-created from section assignment	f	\N	2025-12-15 11:46:14.186671	2025-12-15 11:46:14.186671
fff1cc4d-e052-4282-814c-e1060df93924	b07069bd-2310-4bf9-a080-fbb91b1c1cde	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	Extra	Active	{"endTime": "13:30", "dayOfWeek": 4, "startTime": "10:30"}	Second	2025-2026	DECET 1-2	71fa4e8d-dbc5-4259-8264-b52a0aea6242	205	1.0	3.0	0.0	0.0	System	2025-12-15 20:04:07.493	Auto-created from section assignment	f	\N	2025-12-15 12:04:07.493543	2025-12-15 12:04:07.493543
e74e0163-7fa0-4763-bd1e-ca3a0f17c7c5	0b3f53cd-6504-4e29-af93-e727d98b58b0	eb110c4f-3ed9-42b6-89be-86fb3e1777ff	Regular	Active	{"endTime": "13:00", "dayOfWeek": 3, "startTime": "10:00"}	Second	2025-2026	DECET 1-2	9edbd1bd-d6e0-48bc-8bea-120f510df7ed	200	2.0	6.0	0.0	6.0	System	2025-12-15 20:06:53.014	Auto-created from section assignment	f	\N	2025-12-15 12:06:53.014643	2025-12-15 12:06:53.014643
35eea0ec-7cba-4a88-987f-17036be48216	0b3f53cd-6504-4e29-af93-e727d98b58b0	9ac920a5-a95d-46c4-9a0f-2830ccebd73b	Regular	Active	{"endTime": "19:30", "dayOfWeek": 1, "startTime": "16:30"}	Second	2025-2026	DECET 1-2	0b4e179e-0d66-406e-826e-6d9c821fed19	201	4.0	6.0	3.0	3.0	System	2025-12-15 20:08:26.964	Auto-created from section assignment	f	\N	2025-12-15 12:08:26.964795	2025-12-15 12:08:26.964795
42dcb459-30d3-466a-8feb-87f9909539e1	d7098608-af01-4f3b-8727-9c5bda6569dc	9b31cc69-9761-4bc5-84d9-9ea2f3b6081d	Regular	Active	{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}	Second	2025-2026	DECET 1-2	cc48680e-01d7-4e61-94e9-c82e10317b4a	200	3.0	5.0	2.0	3.0	System	2025-12-15 20:10:18.392	Auto-created from section assignment	f	\N	2025-12-15 12:10:18.392948	2025-12-15 12:10:18.392948
41568fb8-81ad-4c3d-b35a-e80321f9edd2	13d8d74c-39c9-414a-af69-cf5769391fd5	7a0b27a6-138c-4031-a872-fff8e4129c21	Regular	Active	{"endTime": "21:00", "dayOfWeek": 1, "startTime": "18:00"}	Second	2025-2026	DECET 2-1	4a375e16-8970-4695-ab0e-caa52a41ce87	2000	4.0	6.0	3.0	3.0	System	2025-12-15 20:14:03.858	Auto-created from section assignment	f	\N	2025-12-15 12:14:03.858694	2025-12-15 12:14:03.858694
d3a56bf4-bd4b-4805-9cd7-4c42e1938383	64060dc0-651f-4fa2-93d6-ff9b2b9fc3ce	b2715617-754c-4a0f-bcdd-85d11e167d9c	Regular	Active	{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}	Second	2025-2026	DECET 2-1	fcc8d4a0-1b5c-42f4-82c8-1234e8fa0fbc	2000	3.0	5.0	2.0	3.0	System	2025-12-15 20:16:23.155	Auto-created from section assignment	f	\N	2025-12-15 12:16:23.156064	2025-12-15 12:16:23.156064
5714c162-320c-4b25-9d0f-6f7cc1ea5c9d	d7098608-af01-4f3b-8727-9c5bda6569dc	b02f88b8-d420-4cff-904a-d498800c74cf	Regular	Active	{"endTime": "13:30", "dayOfWeek": 4, "startTime": "10:30"}	Second	2025-2026	DECET 2-1	e179fb27-d394-489b-ad6b-0c3eaad582ab	DECET 2-1	2.0	6.0	0.0	6.0	System	2025-12-15 20:17:30.978	Auto-created from section assignment	f	\N	2025-12-15 12:17:30.978755	2025-12-15 12:17:30.978755
a3dfc801-79c7-493f-b1ac-7a5388607175	13d8d74c-39c9-414a-af69-cf5769391fd5	7a0b27a6-138c-4031-a872-fff8e4129c21	Regular	Active	{"endTime": "21:00", "dayOfWeek": 3, "startTime": "18:00"}	Second	2025-2026	DECET 2-2	05bbfed9-cd27-4a9b-9af7-cc293729c945	209	4.0	6.0	3.0	3.0	System	2025-12-15 20:26:29.611	Auto-created from section assignment	f	\N	2025-12-15 12:26:29.6121	2025-12-15 12:26:29.6121
1c913bd0-dd94-4c5d-b011-a3160190d504	64060dc0-651f-4fa2-93d6-ff9b2b9fc3ce	b2715617-754c-4a0f-bcdd-85d11e167d9c	Regular	Active	{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}	Second	2025-2026	DECET 2-2	480bb56f-9f1d-41b9-bde6-ece50c827e81	2000	3.0	5.0	2.0	3.0	System	2025-12-15 20:28:13.983	Auto-created from section assignment	f	\N	2025-12-15 12:28:13.983666	2025-12-15 12:28:13.983666
6e0b0737-faa7-4ebc-a279-54e8e63676e0	64060dc0-651f-4fa2-93d6-ff9b2b9fc3ce	b02f88b8-d420-4cff-904a-d498800c74cf	Regular	Active	{"endTime": "10:30", "dayOfWeek": 1, "startTime": "07:30"}	Second	2025-2026	DECET 2-2	651dbde1-ec6c-46b3-8459-241941a8655e	200	2.0	6.0	0.0	6.0	System	2025-12-15 20:29:10.532	Auto-created from section assignment	f	\N	2025-12-15 12:29:10.532714	2025-12-15 12:29:10.532714
19072b0b-619a-4883-9007-b1934f1c6773	b4db07cb-214f-4777-96d2-eaee498773dd	9042c970-d653-4cf2-be1a-634ce8fed5ab	Regular	Active	{"endTime": "18:00", "dayOfWeek": 4, "startTime": "15:00"}	Second	2025-2026	DECET 2-2	27d727d5-7a69-4ebe-83cb-eefd003145d9	tbaa	2.0	6.0	0.0	6.0	System	2025-12-15 20:35:23.996	Auto-created from section assignment	f	\N	2025-12-15 12:35:23.997089	2025-12-15 12:35:23.997089
35aba580-f224-4f5a-a280-d31ce4018ce1	1cbac665-ccff-4f11-b685-3050c54bb323	9042c970-d653-4cf2-be1a-634ce8fed5ab	Regular	Active	{"endTime": "16:30", "dayOfWeek": 3, "startTime": "13:30"}	Second	2025-2026	DECET 2-1	287677d4-1d97-4c25-a9ca-c22602cb87cf	DECET 2-1	2.0	6.0	0.0	6.0	System	2025-12-15 20:36:41.298	Auto-created from section assignment	f	\N	2025-12-15 12:36:41.29859	2025-12-15 12:36:41.29859
e632c1a4-80c9-4eb6-9c4c-7e046e769e9e	f79ad68d-e276-4acb-9f9a-dc26a56df575	b4248701-7003-4365-9414-58b0fcce28ce	Extra	Active	{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}	Second	2025-2026	DCPET 1-3	39c6a384-15a1-4516-990a-d56c07e753b8	204	2.0	6.0	0.0	6.0	System	2025-12-16 14:47:41.37	Auto-created from section assignment	f	\N	2025-12-16 06:47:41.371535	2025-12-16 06:47:41.371535
414bb400-1b52-4bc3-bd82-d72a95074e9c	f79ad68d-e276-4acb-9f9a-dc26a56df575	b4248701-7003-4365-9414-58b0fcce28ce	Extra	Active	{"endTime": "16:30", "dayOfWeek": 6, "startTime": "13:30"}	Second	2025-2026	DCPET 1-2	557cf5a9-7f6e-427d-b9a0-00531b0692ee	FIELD	2.0	6.0	0.0	6.0	System	2025-12-16 14:51:40.329	Auto-created from section assignment	f	\N	2025-12-16 06:51:40.329441	2025-12-16 06:51:40.329441
d6e10b7f-c38d-46a7-8659-a1934d0bb054	ff533903-dff6-429f-ac16-e1ea0261e6f2	5f101b5b-bbf6-4f02-a448-d066e9e55b93	Regular	Active	{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}	Second	2025-2026	DCPET 2-2	d81629c9-bc75-41a0-a80c-2c15fede43c9	201	3.0	5.0	2.0	3.0	System	2025-12-16 15:04:09.696	Auto-created from section assignment	f	\N	2025-12-16 07:04:09.696435	2025-12-16 07:04:09.696435
3a6fade0-3080-486b-aa3a-c9065354d2ef	a988a353-7a8d-4643-8884-8ce7ddea676b	2a5da3be-2ed4-4323-8b56-6f0e84dd6eb5	Regular	Active	{"endTime": "21:00", "dayOfWeek": 5, "startTime": "18:00"}	Second	2025-2026	DECET 3-1	a5e8ff6c-91da-4711-9fa5-6fabf8698ed3	FIELD	2.0	6.0	0.0	6.0	System	2025-12-16 16:53:02.252	Auto-created from section assignment	f	\N	2025-12-16 08:53:02.253185	2025-12-16 08:53:02.253185
d73bfe09-3c05-46a1-910d-80e19aaa868b	d7098608-af01-4f3b-8727-9c5bda6569dc	abc8fae0-349e-47b1-8b56-591ccf6fb5c7	Extra	Active	{"endTime": "13:30", "dayOfWeek": 6, "startTime": "12:30"}	Second	2025-2026	DECET 3-1	f8cbefab-13be-4277-af69-a72db695ed2a	FIELD	3.0	7.0	1.0	6.0	System	2025-12-16 16:57:21.623	Auto-created from section assignment	f	\N	2025-12-16 08:57:21.623998	2025-12-16 08:57:21.623998
bb31ce22-7f04-4ad4-93c9-e693721e4de8	b4db07cb-214f-4777-96d2-eaee498773dd	2a5da3be-2ed4-4323-8b56-6f0e84dd6eb5	Regular	Active	{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}	Second	2025-2026	DECET 3-2	e06267fd-37b1-44d2-90c4-952c18a56ddc	FIELD	2.0	6.0	0.0	6.0	System	2025-12-16 16:59:24.934	Auto-created from section assignment	f	\N	2025-12-16 08:59:24.934892	2025-12-16 08:59:24.934892
78b7a815-d300-4b79-b883-6eb31a96aae5	a988a353-7a8d-4643-8884-8ce7ddea676b	abc8fae0-349e-47b1-8b56-591ccf6fb5c7	Regular	Active	{"endTime": "21:00", "dayOfWeek": 6, "startTime": "18:00"}	Second	2025-2026	DECET 3-2	4bed1650-4e92-43b5-a2be-261631da796d	FIELD	3.0	7.0	1.0	6.0	System	2025-12-16 17:01:58.352	Auto-created from section assignment	f	\N	2025-12-16 09:01:58.352697	2025-12-16 09:01:58.352697
a08b9d51-81c4-417c-9c72-88879227031f	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	Extra	Active	{"endTime": "20:30", "dayOfWeek": 3, "startTime": "17:30"}	Second	2025-2026	DCPET 2-3	9c5f5720-0858-4e19-b2df-c15dc3df5e99	201	3.0	5.0	2.0	3.0	System	2025-12-16 19:10:47.723	Auto-created from section assignment	f	\N	2025-12-16 11:10:47.727088	2025-12-16 11:10:47.727088
8541f4bc-4af9-418e-a659-5f90cad6247c	a988a353-7a8d-4643-8884-8ce7ddea676b	abc8fae0-349e-47b1-8b56-591ccf6fb5c7	Regular	Active	{"endTime": "16:30", "dayOfWeek": 6, "startTime": "14:00"}	Second	2025-2026	DECET 3-2	cf6b958b-ac9a-4a37-8bf4-1ab44244a4d1		3.0	7.0	1.0	6.0	System	2025-12-16 19:20:26.623	Auto-created from section assignment	f	\N	2025-12-16 11:20:26.624311	2025-12-16 11:20:26.624311
38ec10e5-8d41-489a-a31e-e14f57d928ff	a988a353-7a8d-4643-8884-8ce7ddea676b	abc8fae0-349e-47b1-8b56-591ccf6fb5c7	Extra	Active	{"endTime": "17:30", "dayOfWeek": 6, "startTime": "16:30"}	Second	2025-2026	DECET 3-2	375e4603-a583-4c77-807e-024555758b71		3.0	7.0	1.0	6.0	System	2025-12-16 19:20:57.363	Auto-created from section assignment	f	\N	2025-12-16 11:20:57.364419	2025-12-16 11:20:57.364419
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, code, name, credits, "contactHours", "lectureHours", "laboratoryHours", program, department, semester, "academicYear", "requiresNightSection", "preferredTimeSlots", room, "maxStudents", "enrolledStudents", "isActive", "createdAt", "updatedAt") FROM stdin;
a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	CMPE 103	Object Oriented Programming	2.0	6.0	0.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	25	t	2025-06-19 09:53:30.951672	2025-06-19 09:53:30.951672
182ca134-660c-4c11-a321-d62870e9a1a2	CPET 101	Visual Graphic Design	2.0	6.0	0.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	28	t	2025-06-19 09:53:30.954829	2025-06-19 09:53:30.954829
7e289bb8-3457-4c3d-a426-9deb394b4e76	CPET 103	Web Technology and Programming 2	3.0	5.0	0.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	f	\N	\N	30	27	t	2025-06-19 09:53:30.957595	2025-06-19 09:53:30.957595
d3537276-4d6f-42c9-aab2-c55dfaa84d2a	ENSC 014	Computer-Aided Drafting	1.0	3.0	0.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	26	t	2025-06-19 09:53:30.960072	2025-06-19 09:53:30.960072
0d40872e-0d81-4633-9bcc-3049f598cf25	MATH 201	Discrete Mathematics	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	f	\N	\N	30	0	t	2025-06-19 09:53:30.966008	2025-06-19 09:53:30.966008
aad64730-5582-4ff9-b792-11741a9ca3cb	CPE 201	CPE Professional Course 1	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	f	\N	\N	30	0	t	2025-06-19 09:53:30.97071	2025-06-19 09:53:30.97071
95e06763-bc9d-4e6b-81f2-6d25892ff526	CPET 201	2D Animation	2.0	6.0	1.0	5.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	0	t	2025-06-19 09:53:30.973002	2025-06-19 09:53:30.973002
d0f84eb9-066b-4ca9-a348-0358e1d68a25	ELEC 201	Fundamentals of Electronics Circuits	3.0	5.0	2.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	f	\N	\N	30	0	t	2025-06-19 09:53:30.975425	2025-06-19 09:53:30.975425
dfd62e5a-d3a7-475a-a79d-8ef858cfed96	ELEC 202	Fundamentals of Electrical Circuits	3.0	5.0	2.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	0	t	2025-06-19 09:53:30.977785	2025-06-19 09:53:30.977785
6a2b40d2-4a01-4aaf-9f49-97601bcb2b59	FIL 201	Filipinolohiya at Pambansang Kaulanran	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	General Education	First	2025-2026	f	\N	\N	30	0	t	2025-06-19 09:53:30.980054	2025-06-19 09:53:30.980054
518ffd6d-dde0-4c46-b2c3-ac9088bbda08	PE 203	Physical Activity Towards Health and Fitness 3	2.0	2.0	0.0	2.0	Diploma in Computer Engineering Technology	Physical Education	First	2025-2026	f	\N	\N	30	0	t	2025-06-19 09:53:30.982434	2025-06-19 09:53:30.982434
947829a6-f2a9-46ed-addf-f4e16371fe91	CMPE 301	Computer Engineering Drafting and Design	3.0	5.0	2.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	0	t	2025-06-19 09:53:30.98495	2025-06-19 09:53:30.98495
f5857806-274c-4803-a454-7875f4e415bd	CMPE 302	Data and Digital Communications	3.0	5.0	2.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	f	\N	\N	30	0	t	2025-06-19 09:53:30.987304	2025-06-19 09:53:30.987304
55e8da9d-eec8-41e2-aff6-93764b5d4302	CPE 301	CPE Laws and Professional Practice	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	0	t	2025-06-19 09:53:30.989584	2025-06-19 09:53:30.989584
630f662e-e7fa-4b02-8b9c-08d9b0b7931d	CMPE 303	Microprocessors	3.0	5.0	2.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	0	t	2025-06-19 09:53:30.991899	2025-06-19 09:53:30.991899
30958bc4-b3fd-4d60-bee4-fa9c12eb2cad	CPE 302	CPE Professional Course 3	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	f	\N	\N	30	0	t	2025-06-19 09:53:30.994184	2025-06-19 09:53:30.994184
6bd77fe8-3c33-450a-8d32-d1b84cebdf3d	CPET 301	CpET Project Development 1	3.0	6.0	1.0	5.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	0	t	2025-06-19 09:53:30.996584	2025-06-19 09:53:30.996584
2ae3f74b-ce33-4b90-9141-f90477645125	CPET 302	Database Management System 2	3.0	5.0	2.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	f	\N	\N	30	0	t	2025-06-19 09:53:30.998985	2025-06-19 09:53:30.998985
e7aa1a46-e5f0-45f1-962d-aaf8162cc629	ENG 301	Technical Communication	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	General Education	First	2025-2026	t	\N	\N	30	0	t	2025-06-19 09:53:31.001213	2025-06-19 09:53:31.001213
931701e4-ee14-4148-acf3-de8ff59e7a30	CHEM 015	Chemistry for Engineers	4.0	6.0	0.0	0.0	DCPET	Computer Engineering	First	2025-2026	f	\N	\N	40	0	t	2025-06-19 12:22:41.10725	2025-06-19 12:22:41.10725
744951e5-2a2f-449a-a18d-d39fc7f1a206	CMPE 102	Programming Logic and Design	2.0	6.0	0.0	0.0	DCPET	Computer Engineering	First	2025-2026	f	\N	\N	40	0	t	2025-06-19 12:22:41.119697	2025-06-19 12:22:41.119697
9722ca14-c65f-462e-974e-dae1c5301ede	MATH 101	Calculus 1	3.0	3.0	0.0	0.0	DCPET	Computer Engineering	First	2025-2026	f	\N	\N	40	0	t	2025-06-19 12:22:41.123521	2025-06-19 12:22:41.123521
4789d95d-108b-4eed-9512-310f324ad1de	CPET 102	Web Technology and Programming	3.0	5.0	0.0	0.0	DCPET	Computer Engineering	First	2025-2026	f	\N	\N	40	0	t	2025-06-19 12:22:41.126901	2025-06-19 12:22:41.126901
6af77b41-d101-42e5-8e20-793255bd7e2e	PATHFIT 1	Physical Activity Towards Health and Fitness 1	2.0	2.0	0.0	0.0	DCPET	Computer Engineering	First	2025-2026	f	\N	\N	40	0	t	2025-06-19 12:22:41.130913	2025-06-19 12:22:41.130913
8f62f0b1-a11c-4f73-aea1-1c6403c467b4	CWTS 001	Civic Welfare Training Service 1	3.0	0.0	0.0	0.0	DCPET	Computer Engineering	First	2025-2026	f	\N	\N	40	0	t	2025-06-19 12:22:41.134592	2025-06-19 12:22:41.134592
652a4c5c-910c-4bef-9605-bccf6611e6b6	ROTC 001	Reserved Officer Training Corps 1	3.0	3.0	0.0	0.0	DCPET	Computer Engineering	First	2025-2026	f	\N	\N	40	0	t	2025-06-19 12:22:41.137608	2025-06-19 12:22:41.137608
6f2d9599-ff32-4d99-bf58-1e0f6f967f54	CMPE 105	Computer Hardware Fundamentals	2.0	6.0	0.0	0.0	DCPET	Computer Engineering	First	2025-2026	t	\N	\N	40	0	t	2025-06-19 12:22:41.140744	2025-06-19 12:22:41.140744
36ea268e-e028-4082-960b-cbf79c53fe29	ENSC 013	Engineering Drawing	2.0	6.0	0.0	0.0	DCPET	Computer Engineering	First	2025-2026	t	\N	\N	40	0	t	2025-06-19 12:22:41.144676	2025-06-19 12:22:41.144676
b4248701-7003-4365-9414-58b0fcce28ce	CPT 101	Visual Graphic Design	2.0	6.0	0.0	6.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:14:32.225398	2025-12-15 03:14:32.225398
40582042-1cb3-4923-9eef-cd23bb4eda13	CPT 103	Web Technology and Programming 2	3.0	5.0	2.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:14:32.253344	2025-12-15 03:14:32.253344
564569fc-1c1a-4f24-bb9f-fdd439e5a207	CWTS 002	Civic Welfare Training Service 2	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:14:32.260603	2025-12-15 03:14:32.260603
344c787d-01e0-417e-8203-d02d2388e8dd	SEED 005	Composite Communication/Malayuning Komunikasyon	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:14:32.266322	2025-12-15 03:14:32.266322
d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	CMPE 202	Operating Systems	3.0	5.0	2.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	0	t	2025-06-19 09:53:30.968341	2025-12-15 08:30:04.649348
290b617f-ddaf-4537-b790-d6b996f050e6	MATH 103	Calculus 2	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:14:32.269697	2025-12-15 03:14:32.269697
8ca7edad-38f5-46be-9170-0e2cad659b61	PATHFIT 2	Physical Activity Towards Health and Fitness 2	2.0	2.0	2.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:14:32.275835	2025-12-15 03:14:32.275835
be8121b8-2877-4deb-b215-ec3df77d38d5	PHYS 013	Physics for Engineers (Calculus-based)	4.0	6.0	3.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:14:32.279574	2025-12-15 03:14:32.279574
56213fa5-f8f6-4052-8b1e-89ec49cef677	ROTC 002	Reserved Officer Training Corps 2	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:14:32.283084	2025-12-15 03:14:32.283084
186afdfd-e8fa-45a8-acbe-c734e1f4f735	CMPE 304	Logic Circuits and Design	4.0	6.0	3.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:29:43.068098	2025-12-15 03:29:43.068098
9883306d-ffac-4029-8298-97a25bb5e83d	CMPE 306	Fundamentals of Mixed Signals and Sensors	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:29:43.086629	2025-12-15 03:29:43.086629
3538ba22-33a5-4388-859e-a7bf9f3c8db6	CMPE 401	Database Management Systems	2.0	6.0	0.0	6.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:29:43.090791	2025-12-15 03:29:43.090791
5f101b5b-bbf6-4f02-a448-d066e9e55b93	CMPE-PC2	CPE Professional Course 2	3.0	5.0	2.0	3.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:29:43.094323	2025-12-15 03:29:43.094323
82076eb1-258d-4c81-b862-cefe4541f77d	CPET 202	Computer Programming (JAVA)	2.0	6.0	0.0	6.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:29:43.10036	2025-12-15 03:29:43.10036
03684182-4ccf-4bb3-88e4-d9d0ab5ff83c	SEED 008	Ethics/Etika	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:29:43.104092	2025-12-15 03:29:43.104092
cff588e7-1092-4648-8f6d-1dfd4c6a3278	PATHFIT 4	Physical Activity Towards Health and Fitness 4	2.0	2.0	2.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:29:43.108426	2025-12-15 03:29:43.108426
402a7351-9241-4f71-ac32-42944a29bc27	STAT 012	Engineering Data Analysis	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 03:29:43.113658	2025-12-15 03:29:43.113658
40cb7f22-3883-4382-aee7-b026152a446f	CPET B03	Practicum 2 (300 hours)	3.0	7.0	1.0	6.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:12:08.553431	2025-12-15 04:12:08.553431
589aed1c-55dc-476f-9c47-304b89643863	CPET B04	Seminars on Issues and Trends in CpET	2.0	6.0	0.0	6.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:12:08.567633	2025-12-15 04:12:08.567633
04236cc6-1cc8-45fa-8b1c-5277b89666d6	CPET B05	CpET Project Development 2	2.0	6.0	0.0	6.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:12:08.574763	2025-12-15 04:12:08.574763
2135d4a1-897f-4f63-b5ff-5d8a2a1249a8	ENSC P29	Technopreneurship 101	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:12:08.578453	2025-12-15 04:12:08.578453
eb110c4f-3ed9-42b6-89be-86fb3e1777ff	ECEN 102	Basic Electronics 2	2.0	6.0	0.0	6.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:16:05.961372	2025-12-15 04:16:05.961372
9ac920a5-a95d-46c4-9a0f-2830ccebd73b	ECEN 201	Electronics 1: Electronic Devices and Circuits Theory	4.0	6.0	3.0	3.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:16:05.976791	2025-12-15 04:16:05.976791
9b31cc69-9761-4bc5-84d9-9ea2f3b6081d	ECET 102	Consumer Electronics Servicing 2	3.0	5.0	2.0	3.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:16:05.981276	2025-12-15 04:16:05.981276
fded90ba-10ff-4e47-ace4-9a9cf6ba235d	ENGL 012	Technical Communication	3.0	3.0	3.0	0.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:16:05.984932	2025-12-15 04:16:05.984932
2471b001-c40e-4676-aead-126f9c0ccd02	ECEN 205	Digital Electronics I: Logic Circuits and Switching Theory	4.0	6.0	3.0	3.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:19:22.620696	2025-12-15 04:19:22.620696
7a0b27a6-138c-4031-a872-fff8e4129c21	ECEN 310	Electronics I: Electronic Systems and Design	4.0	6.0	3.0	3.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:19:22.650821	2025-12-15 04:19:22.650821
b2715617-754c-4a0f-bcdd-85d11e167d9c	ECET 202	AM/FM Broadcast System and Receivers	3.0	5.0	2.0	3.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:19:22.655378	2025-12-15 04:19:22.655378
b02f88b8-d420-4cff-904a-d498800c74cf	ECET 203	Television Broadcast System and Receivers	2.0	6.0	0.0	6.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:19:22.659835	2025-12-15 04:19:22.659835
9042c970-d653-4cf2-be1a-634ce8fed5ab	ECET 204	ECET Project Development 1	2.0	6.0	0.0	6.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:19:22.665558	2025-12-15 04:19:22.665558
d0b6eba8-fd04-4e4a-bda1-acf1d537ce05	SEED 032	Pilipinolohiya at Pambansang Kaunlaran	3.0	3.0	3.0	0.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:19:22.669601	2025-12-15 04:19:22.669601
f81b6e2b-598c-4393-b5d0-bad69de5ee63	MATH 209	Differential Equations	3.0	3.0	3.0	0.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-15 04:19:22.674136	2025-12-15 04:19:22.674136
cb487f86-f23e-4c6d-a03e-6d60684ae6fd	CMPE 201	Data Structures and Algorithm	3.0	3.0	3.0	0.0	Diploma in Computer Engineering Technology	Department Of Computer And Electronics Engineering Technology	First	2025-2026	t	\N	\N	30	0	t	2025-06-19 09:53:30.962577	2025-12-15 08:30:04.640797
2a5da3be-2ed4-4323-8b56-6f0e84dd6eb5	ECET 306	Seminars, Issues and Trends in ECET	2.0	6.0	0.0	6.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-16 08:51:17.898089	2025-12-16 08:51:17.898089
abc8fae0-349e-47b1-8b56-591ccf6fb5c7	ECET 305	Practicum 2 (300 hours)	3.0	7.0	1.0	6.0	Diploma in Electronics Engineering Technology	Department Of Computer And Electronics Engineering Technology	Second	2025-2026	f	\N	\N	60	0	t	2025-12-16 08:51:17.92186	2025-12-16 08:51:17.92186
\.


--
-- Data for Name: faculty; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.faculty (id, "employeeId", "firstName", "lastName", email, type, department, college, "isActive", preferences, "currentRegularLoad", "currentExtraLoad", "consecutiveLowRatings", "createdAt", "updatedAt") FROM stdin;
8697ef4e-73b4-4adc-813b-712762d399a8	PUP-DCEET-012	Kenneth	Dazon	kpdazon@pup.edu.ph	Regular	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	0	0	0	2025-06-19 09:53:30.937704	2025-06-19 12:08:15.562472
401ff400-4855-4d7a-93b4-39de2b6acd3a	PUP-DCEET-005	Jomar B.	Ruiz	jbruiz@pup.edu.ph	Designee	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	18	19	0	2025-06-19 09:53:30.910177	2025-12-15 11:10:48.68207
681ca93b-d7f4-4140-a189-77d76f6c0621	PUP-DCEET-013	Jose Marie B.	Dipay	jmbdipay@pup.edu.ph	Regular	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	24	0	0	2025-06-19 09:53:30.940209	2025-12-15 11:13:02.151058
64060dc0-651f-4fa2-93d6-ff9b2b9fc3ce	005	Jayson	Moscare	moscare@gmail.com	PartTime	Computer Engineering	College of Computer and Information Sciences	t	\N	16	0	0	2025-12-15 12:14:57.100213	2025-12-15 12:29:10.529457
677387ce-78df-41af-aba9-9d010ee3f9bf	PUP-DCEET-003	Jonathan C.	Manarang	jcmanarang@pup.edu.ph	Temporary	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	19	0	0	2025-06-19 09:53:30.904549	2025-12-15 11:14:38.950266
df626545-addc-4522-8df2-534bdd810c8b	PUP-DCEET-009	Roste Mae	Macalos	rmmacalos@pup.edu.ph	PartTime	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	0	0	0	2025-06-19 09:53:30.928024	2025-06-19 12:08:15.584528
d7d4dc55-08c9-433a-99f4-09d84041aec7	FA0168MN2020	Ryan S.	Evangelista	rsevangelista@pup.edu.ph	PartTime	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	6	0	0	2025-06-19 09:53:30.923247	2025-12-15 11:17:01.789614
869e2464-d26e-4b39-8d38-4eba396d3f96	PUP-DCEET-006	Carlo O.	Cunanan	cocunanan@pup.edu.ph	PartTime	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	0	0	0	2025-06-19 09:53:30.918652	2025-06-19 12:08:15.544804
ff533903-dff6-429f-ac16-e1ea0261e6f2	000032	gacad	gacad	gacad@gmail.com	Regular	Computer Engineering	College of Computer and Information Sciences	t	\N	5	0	0	2025-12-16 07:01:17.239761	2025-12-16 07:04:09.692794
6e2c20cd-ef52-4997-96a3-4fe331dddc45	PUP-DCEET-002	Ronald D	Fernando	rdfernando@pup.edu.ph	Regular	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	0	0	0	2025-06-19 09:53:30.902193	2025-12-16 11:12:54.163802
0b3f53cd-6504-4e29-af93-e727d98b58b0	002	Juan	Montano	montano@gmail.com	PartTime	Computer Engineering	College of Computer and Information Sciences	t	\N	24	0	0	2025-12-15 11:41:55.71602	2025-12-15 12:08:26.961326
bfc7543a-6184-4572-9073-52a63086312b	PUP-DCEET-001	Frescian C.	Ruiz	fcruiz@pup.edu.ph	Designee	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	24	6	0	2025-06-19 09:53:30.899189	2025-12-15 11:28:52.690321
1cbac665-ccff-4f11-b685-3050c54bb323	007	Mark Andrew	Yague	yague@gmail.com	PartTime	Computer Engineering	College of Computer and Information Sciences	t	\N	6	0	0	2025-12-15 12:32:09.954227	2025-12-15 12:36:41.294995
bd9d5947-770b-4252-9443-8c20a49baaec	FA0140MN2020	Jake M.	Libed	jmlibed@pup.edu.ph	Regular	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	24	12	0	2025-06-19 09:53:30.945359	2025-12-15 06:12:47.186053
d7098608-af01-4f3b-8727-9c5bda6569dc	PUP-DCEET-004	Remegio C.	Rios	rcrios@pup.edu.ph	Designee	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	16	13	0	2025-06-19 09:53:30.90697	2025-12-16 08:57:21.618711
a37b4768-2165-4084-b39b-309f645c7971	FA0043MN2021	Tanya	Martinez	tsmartinez@pup.edu.ph	PartTime	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	0	0	0	2025-06-19 09:53:30.930369	2025-06-19 12:08:15.555851
a6895881-65ff-407b-90b5-5e47525c835f	PUP-DCEET-010	Jess Rhyan A.	Tiburcio	jratiburcio@pup.edu.ph	PartTime	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	0	0	0	2025-06-19 09:53:30.932903	2025-06-19 12:08:15.557914
dd3f7208-fcb4-4874-b772-1e7999a734a8	PUP-DCEET-011	Roel D.	Cabrera	rdcabrera@pup.edu.ph	Regular	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	0	0	0	2025-06-19 09:53:30.935282	2025-06-19 12:08:15.56053
b4db07cb-214f-4777-96d2-eaee498773dd	006	Ruben	Del Rosario	delrosario@gmail.com	PartTime	Computer Engineering	College of Computer and Information Sciences	t	\N	12	0	0	2025-12-15 12:31:44.014864	2025-12-16 08:59:24.930089
2a7de823-18de-4102-9cd4-135ba64bdf73	PUP-DCEET-008	Patrick Jiorgen U.	Hulipas	pjuhulipas@pup.edu.ph	PartTime	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	0	0	0	2025-06-19 09:53:30.925388	2025-06-19 12:08:15.582503
781a823d-3e2f-4902-a402-56ab3363e762	PUP-DCEET-014	John Michael V.	Legaspi	jmvlegaspi@pup.edu.ph	Designee	Computer Engineering	College of Engineering	t	\N	19	0	0	2025-06-19 09:53:30.943078	2025-12-17 09:16:12.988625
13d8d74c-39c9-414a-af69-cf5769391fd5	FA0320MN2023	Aaron Charles Regis	Alday	acralday@pup.edu.ph	PartTime	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	12	0	0	2025-06-19 09:53:30.913245	2025-12-15 12:26:29.60859
b07069bd-2310-4bf9-a080-fbb91b1c1cde	001	Charmaine Chrescel	Nudalo	ccd.nudalo@iskolarngbayan.pup.edu.ph	PartTime	Computer Engineering	College of Computer and Information Sciences	t	\N	12	3	0	2025-12-15 05:40:43.860849	2025-12-16 06:48:27.765396
f79ad68d-e276-4acb-9f9a-dc26a56df575	PUP-DCEET-007	Jerome	De Guzman	jtdeguzman@pup.edu.ph	PartTime	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	25	22	0	2025-06-19 09:53:30.920997	2025-12-16 06:51:40.324874
9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	FA0135MN2019	Isaiah Nikkolai M.	Andaya	inmandaya@pup.edu.ph	PartTime	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	21	5	0	2025-06-19 09:53:30.915966	2025-12-16 11:10:47.676974
a988a353-7a8d-4643-8884-8ce7ddea676b	PUP-DCEET-015	Joseph	Lequigan	jblequigan@pup.edu.ph	AdminFaculty	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	\N	26	7	0	2025-06-19 09:53:30.94795	2025-12-17 09:48:02.60444
\.


--
-- Data for Name: itees_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.itees_records (id, "facultyId", semester, "academicYear", rating, "numericalScore", "evaluatorCount", comments, "createdAt") FROM stdin;
14445023-9e21-41b3-b1c0-10482a10a2a6	bfc7543a-6184-4572-9073-52a63086312b	First	2023-2024	Outstanding	4.80	25	Excellent performance in teaching and research.	2025-06-19 09:53:31.164771
c888b4ed-e0bd-451f-8877-96879b2d4743	6e2c20cd-ef52-4997-96a3-4fe331dddc45	First	2023-2024	Very Satisfactory	4.20	25	Excellent performance in teaching and research.	2025-06-19 09:53:31.167472
7d663dc9-081d-4ecb-bd81-6f35492df7f1	677387ce-78df-41af-aba9-9d010ee3f9bf	First	2023-2024	Satisfactory	3.50	25	Excellent performance in teaching and research.	2025-06-19 09:53:31.169766
7023bfc9-b6d8-4c46-a7f0-a83dcdf355d7	d7098608-af01-4f3b-8727-9c5bda6569dc	First	2023-2024	Very Satisfactory	4.00	25	Excellent performance in teaching and research.	2025-06-19 09:53:31.171991
ed29cd5f-8a50-43c0-b3b1-0abb2be09a05	401ff400-4855-4d7a-93b4-39de2b6acd3a	First	2023-2024	Outstanding	4.90	25	Excellent performance in teaching and research.	2025-06-19 09:53:31.174151
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (id, code, name, building, type, capacity, "isActive", "createdAt", "updatedAt") FROM stdin;
9f9e13ce-37cb-4871-bc46-dab1370b7a6e	200	ece room	\N	Lecture	40	t	2025-12-16 08:06:27.110338	2025-12-16 08:06:27.110338
238dd222-5e48-49c5-a5da-6b97f27f2b9f	201	ece room	\N	Lecture	40	t	2025-12-16 08:06:40.661138	2025-12-16 08:06:40.661138
632eee02-5bf9-4447-914f-d3e988c61d42	204	computer lab	\N	Laboratory	40	t	2025-12-16 08:06:56.390166	2025-12-16 08:06:56.390166
19e4408c-90e3-49b2-b703-44ae81c5d1b7	205	computer lab cad	\N	Laboratory	40	t	2025-12-16 08:07:40.958307	2025-12-16 08:07:40.958307
d62c09f4-00f6-4e7f-9f5c-19713f92d4a6	209	me ee	\N	Lecture	40	t	2025-12-16 08:08:24.721906	2025-12-16 08:08:24.721906
4a26c377-341b-4fac-b241-7dce2b254ef4	212	lec lab omit cpet	\N	Lecture	40	t	2025-12-16 08:08:46.089917	2025-12-16 08:08:46.089917
3a690b55-dcc5-4510-9035-7803951098ee	213	drawing room	\N	Lecture	40	t	2025-12-16 08:08:58.391389	2025-12-16 08:08:58.391389
0083eda6-7818-4028-839a-7be94e44d119	303	\N	\N	Lecture	40	t	2025-12-26 05:37:29.956677	2025-12-26 05:37:29.956677
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sections (id, "sectionCode", "courseId", "facultyId", status, "classType", semester, "academicYear", "maxStudents", "enrolledStudents", room, "timeSlots", "isNightSection", "lectureHours", "laboratoryHours", notes, "isActive", "createdAt", "updatedAt") FROM stdin;
23f478c1-0ba5-42a1-a2b0-1925e6f2fbb1	DCPET 2-1	cb487f86-f23e-4c6d-a03e-6d60684ae6fd	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 1, "startTime": "07:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.038083	2025-06-19 09:53:31.038083
17b2a92b-7a29-4e00-bf05-b15480472e59	DCPET 2-2	cb487f86-f23e-4c6d-a03e-6d60684ae6fd	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "19:30", "dayOfWeek": 2, "startTime": "16:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.040475	2025-06-19 09:53:31.040475
6bd62b66-3218-486b-820d-94a9885109ff	DCPET 2-3	cb487f86-f23e-4c6d-a03e-6d60684ae6fd	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "16:30", "dayOfWeek": 3, "startTime": "13:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.043116	2025-06-19 09:53:31.043116
12d0b521-5a28-4369-9177-73127c4253e1	DCPET 2-1	0d40872e-0d81-4633-9bcc-3049f598cf25	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.045501	2025-06-19 09:53:31.045501
575546b1-a4e7-4b8c-8793-fc6a95bc1836	DCPET 2-2	0d40872e-0d81-4633-9bcc-3049f598cf25	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.047871	2025-06-19 09:53:31.047871
c3f866f8-9cc8-4de7-b1e0-6a95e16589b8	DCPET 2-3	0d40872e-0d81-4633-9bcc-3049f598cf25	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "13:30", "dayOfWeek": 4, "startTime": "10:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.050307	2025-06-19 09:53:31.050307
24f7177b-1a5a-4661-9fb7-30b01b130db0	DCPET 2-1	aad64730-5582-4ff9-b792-11741a9ca3cb	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 2, "startTime": "07:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.061311	2025-06-19 09:53:31.061311
e7414648-845f-4dfb-8832-404e2465f5aa	DCPET 2-2	aad64730-5582-4ff9-b792-11741a9ca3cb	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 4, "startTime": "07:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.06385	2025-06-19 09:53:31.06385
09c7b5e7-17a8-495d-8dcb-adac5b3a6374	DCPET 2-3	aad64730-5582-4ff9-b792-11741a9ca3cb	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.066341	2025-06-19 09:53:31.066341
b71a7889-25d7-4ce1-9c3f-9e704c343cbe	DCPET 2-1	d0f84eb9-066b-4ca9-a348-0358e1d68a25	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "16:30", "dayOfWeek": 5, "startTime": "13:30"}, {"endTime": "15:30", "dayOfWeek": 6, "startTime": "13:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.075788	2025-06-19 09:53:31.075788
6a22569e-5646-48e4-a2bd-7c598b4045fd	DCPET 2-2	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	bd9d5947-770b-4252-9443-8c20a49baaec	Assigned	Laboratory	First	2025-2026	30	0	IT201	[{"endTime": "21:00", "dayOfWeek": 2, "startTime": "18:00"}]	t	0.0	3.0	Jake Libed - Laboratory hours (Part-time schedule). Team teaching with John Michael Legaspi for lecture component.	t	2025-06-19 09:53:31.055313	2025-06-19 10:14:17.977384
6f96e21c-f732-4e14-9160-2624bae259f0	DCPET 2-3	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	bd9d5947-770b-4252-9443-8c20a49baaec	Assigned	Laboratory	First	2025-2026	30	0	IT201	[{"endTime": "13:30", "dayOfWeek": 3, "startTime": "10:30"}, {"endTime": "09:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	0.0	3.0	Jake Libed - Laboratory hours only. Team teaching with John Michael Legaspi for lecture component.	t	2025-06-19 09:53:31.05783	2025-06-19 10:14:38.363093
7d0338b8-5026-455e-a9ac-f58eee761f6c	DCPET 2-1	95e06763-bc9d-4e6b-81f2-6d25892ff526	bfc7543a-6184-4572-9073-52a63086312b	Assigned	Laboratory	First	2025-2026	30	0	TBA	[{"endTime": "13:30", "dayOfWeek": 2, "startTime": "10:30"}, {"endTime": "13:30", "dayOfWeek": 5, "startTime": "10:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.068709	2025-06-19 11:13:38.230134
5630348e-54c1-474a-9842-85f24a472d34	DCPET 1-1	56213fa5-f8f6-4052-8b1e-89ec49cef677	\N	Planning	Lecture	Second	2025-2026	60	0	FIELD	\N	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.385638	2025-12-15 03:14:32.385638
f2d1339d-f80e-4bca-bd1d-06f8e7806316	DCPET 2-2	95e06763-bc9d-4e6b-81f2-6d25892ff526	bfc7543a-6184-4572-9073-52a63086312b	Planning	Laboratory	First	2025-2026	30	0	TBA	[{"endTime": "21:00", "dayOfWeek": 2, "startTime": "18:00"}, {"endTime": "09:00", "dayOfWeek": 2, "startTime": "07:03"}]	t	0.0	3.0		t	2025-06-19 09:53:31.071012	2025-06-19 11:31:43.549233
699a4cbd-362b-43fb-b7c9-fc266f888b9a	DCPET 2-3	95e06763-bc9d-4e6b-81f2-6d25892ff526	bfc7543a-6184-4572-9073-52a63086312b	Planning	Laboratory	First	2025-2026	30	0	TBA	[{"endTime": "09:00", "dayOfWeek": 5, "startTime": "07:30"}, {"endTime": "21:00", "dayOfWeek": 5, "startTime": "18:00"}]	t	2.0	3.0		t	2025-06-19 09:53:31.07342	2025-06-19 11:31:14.97714
3446ef57-1fe7-4ced-b05e-884bd7e021a4	DCPET 1-2	564569fc-1c1a-4f24-bb9f-fdd439e5a207	\N	Planning	Lecture	Second	2025-2026	60	0	FIELD	\N	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.400858	2025-12-15 03:14:32.400858
2a7026db-1f73-41e8-b460-c396129575a5	DCPET 1-2	56213fa5-f8f6-4052-8b1e-89ec49cef677	\N	Planning	Lecture	Second	2025-2026	60	0	FIELD	\N	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.421738	2025-12-15 03:14:32.421738
dc18b418-82ef-477b-b75e-85633359a0cd	DCPET 1-3	564569fc-1c1a-4f24-bb9f-fdd439e5a207	\N	Planning	Lecture	Second	2025-2026	60	0	FIELD	\N	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.433568	2025-12-15 03:14:32.433568
91dab3a4-0fdd-4fb7-bbca-823a305850ce	DCPET 1-3	56213fa5-f8f6-4052-8b1e-89ec49cef677	\N	Planning	Lecture	Second	2025-2026	60	0	DCPET 1-3	\N	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.453534	2025-12-15 03:14:32.453534
e28f5644-f011-4531-b897-e7c8c5759bb2	DCPET 1-3	290b617f-ddaf-4537-b790-d6b996f050e6	\N	Planning	Lecture	Second	2025-2026	60	0	TBA	[{"endTime": "18:00", "dayOfWeek": 4, "startTime": "15:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.442797	2025-12-15 06:45:39.200179
3e41ce38-428c-484d-9b84-b17abc6ed877	DCPET 1-3	344c787d-01e0-417e-8203-d02d2388e8dd	\N	Planning	Lecture	Second	2025-2026	60	0	209	[{"endTime": "13:30", "dayOfWeek": 3, "startTime": "10:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.437547	2025-12-26 05:06:12.168804
654924c8-0f51-483d-afec-db661b9f0321	DCPET 1-2	be8121b8-2877-4deb-b215-ec3df77d38d5	\N	Planning	Combined	Second	2025-2026	60	0	TRA	[{"endTime": "16:30", "dayOfWeek": 2, "startTime": "13:30"}, {"endTime": "16:30", "dayOfWeek": 4, "startTime": "13:30"}]	f	3.0	3.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.416886	2025-12-15 06:10:41.72834
902e3b8e-f902-43fc-b9de-7b82f33e0c7d	DCPET 1-2	344c787d-01e0-417e-8203-d02d2388e8dd	\N	Planning	Lecture	Second	2025-2026	60	0	212	[{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.405622	2025-12-26 04:57:17.683273
4784daee-366f-48d2-bf75-72c74dd2173c	DCPET 1-2	290b617f-ddaf-4537-b790-d6b996f050e6	\N	Planning	Lecture	Second	2025-2026	60	0	200	[{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.409349	2025-12-26 04:58:39.152863
5db19949-8262-4720-85f7-316c262724b3	DCPET 1-3	8ca7edad-38f5-46be-9170-0e2cad659b61	\N	Planning	Lecture	Second	2025-2026	60	0	TBA	[{"endTime": "13:00", "dayOfWeek": 2, "startTime": "11:00"}]	f	2.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.446865	2025-12-15 06:45:15.58501
28aa433f-051b-488f-a4fc-1d0bd1a3a52d	OCPET 2-1	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	\N	Planning	Lecture	Second	2025-2026	60	0	OCPET 2-1	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.118856	2025-12-15 08:17:24.093289
97108011-da1e-472c-8c5b-b29ab79a40e8	DCPET 2-2	d0f84eb9-066b-4ca9-a348-0358e1d68a25	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}, {"endTime": "20:00", "dayOfWeek": 4, "startTime": "18:00"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.078099	2025-06-19 09:53:31.078099
39a6fdd9-22cb-4612-b63a-e9e649172b3a	DCPET 2-3	d0f84eb9-066b-4ca9-a348-0358e1d68a25	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "16:30", "dayOfWeek": 2, "startTime": "13:30"}, {"endTime": "18:30", "dayOfWeek": 5, "startTime": "16:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.080507	2025-06-19 09:53:31.080507
374ad156-2cbf-4670-9162-e8374387b32d	DCPET 2-1	dfd62e5a-d3a7-475a-a79d-8ef858cfed96	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}, {"endTime": "18:30", "dayOfWeek": 6, "startTime": "16:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.082855	2025-06-19 09:53:31.082855
c39b42b1-6c3f-451b-8ac1-4ebadfd8988c	DCPET 2-2	dfd62e5a-d3a7-475a-a79d-8ef858cfed96	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "21:00", "dayOfWeek": 1, "startTime": "18:00"}, {"endTime": "22:00", "dayOfWeek": 4, "startTime": "20:00"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.085234	2025-06-19 09:53:31.085234
6239fcf3-7cb3-4aae-9f39-55f1b495545d	DCPET 2-3	dfd62e5a-d3a7-475a-a79d-8ef858cfed96	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}, {"endTime": "09:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.087508	2025-06-19 09:53:31.087508
b5656094-8888-4cd7-bcf6-eff9ad5d8913	DCPET 2-1	6a2b40d2-4a01-4aaf-9f49-97601bcb2b59	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "19:30", "dayOfWeek": 3, "startTime": "16:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.09024	2025-06-19 09:53:31.09024
913f2e29-51d7-4016-ae1e-4403be9cd76e	DCPET 2-2	6a2b40d2-4a01-4aaf-9f49-97601bcb2b59	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "21:00", "dayOfWeek": 5, "startTime": "18:00"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.092548	2025-06-19 09:53:31.092548
5913c5f2-f8b2-47fd-9c13-7a2269d8ba50	DCPET 2-3	6a2b40d2-4a01-4aaf-9f49-97601bcb2b59	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "16:30", "dayOfWeek": 2, "startTime": "13:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.094843	2025-06-19 09:53:31.094843
c9c29459-b436-4fa4-a5fc-5004415d083d	DCPET 2-1	518ffd6d-dde0-4c46-b2c3-ac9088bbda08	\N	Planning	Laboratory	First	2025-2026	30	0	TBA	[{"endTime": "17:30", "dayOfWeek": 6, "startTime": "15:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.097113	2025-06-19 09:53:31.097113
a7116474-6acc-4cda-beb9-b314201bdd3e	DCPET 2-2	518ffd6d-dde0-4c46-b2c3-ac9088bbda08	\N	Planning	Laboratory	First	2025-2026	30	0	TBA	[{"endTime": "15:30", "dayOfWeek": 6, "startTime": "13:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.099546	2025-06-19 09:53:31.099546
20404ee1-3e1f-4ac2-988b-419ef4c3320f	DCPET 2-3	518ffd6d-dde0-4c46-b2c3-ac9088bbda08	\N	Planning	Laboratory	First	2025-2026	30	0	TBA	[{"endTime": "12:30", "dayOfWeek": 6, "startTime": "10:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.102266	2025-06-19 09:53:31.102266
148d8767-fba2-4604-b72e-b3a55b199622	DCPET 3-1	947829a6-f2a9-46ed-addf-f4e16371fe91	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 1, "startTime": "07:30"}, {"endTime": "09:30", "dayOfWeek": 4, "startTime": "07:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.104582	2025-06-19 09:53:31.104582
18612a58-973c-49ad-9b30-8d9d3e0ed5ca	DCPET 3-2	947829a6-f2a9-46ed-addf-f4e16371fe91	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "19:30", "dayOfWeek": 2, "startTime": "16:30"}, {"endTime": "18:30", "dayOfWeek": 5, "startTime": "16:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.106873	2025-06-19 09:53:31.106873
5a933b2f-0058-41e5-8641-55ac31d7f6eb	DCPET 3-3	947829a6-f2a9-46ed-addf-f4e16371fe91	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "13:30", "dayOfWeek": 3, "startTime": "10:30"}, {"endTime": "09:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.109682	2025-06-19 09:53:31.109682
009b4af1-01ec-49a7-aa53-674a8fb98ba9	DCPET 3-2	f5857806-274c-4803-a454-7875f4e415bd	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}, {"endTime": "12:30", "dayOfWeek": 6, "startTime": "10:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.114431	2025-06-19 09:53:31.114431
5f219ba6-eb94-4142-bb7a-c47071b67448	DCPET 3-3	f5857806-274c-4803-a454-7875f4e415bd	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 2, "startTime": "07:30"}, {"endTime": "09:30", "dayOfWeek": 5, "startTime": "07:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.116777	2025-06-19 09:53:31.116777
06124693-6719-4e08-83de-f803a9174321	DCPET 3-1	55e8da9d-eec8-41e2-aff6-93764b5d4302	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.119205	2025-06-19 09:53:31.119205
55f29b21-b158-4f2d-8dca-6011ad0e0960	DCPET 3-2	55e8da9d-eec8-41e2-aff6-93764b5d4302	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "19:30", "dayOfWeek": 3, "startTime": "16:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.121534	2025-06-19 09:53:31.121534
45350d36-9616-4202-938e-ccd5999a4d17	DCPET 3-3	55e8da9d-eec8-41e2-aff6-93764b5d4302	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "16:30", "dayOfWeek": 4, "startTime": "13:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.123853	2025-06-19 09:53:31.123853
e715fd5f-927b-4b2c-887b-1cf0bab5dce3	DCPET 3-1	630f662e-e7fa-4b02-8b9c-08d9b0b7931d	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "13:30", "dayOfWeek": 2, "startTime": "10:30"}, {"endTime": "12:30", "dayOfWeek": 5, "startTime": "10:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.126245	2025-06-19 09:53:31.126245
62f8b617-ee03-4eda-82c1-438989af21cb	DCPET 3-2	630f662e-e7fa-4b02-8b9c-08d9b0b7931d	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "19:30", "dayOfWeek": 1, "startTime": "16:30"}, {"endTime": "18:30", "dayOfWeek": 4, "startTime": "16:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.128701	2025-06-19 09:53:31.128701
77601270-02fd-4559-9b4b-aa92589f543f	DCPET 3-3	630f662e-e7fa-4b02-8b9c-08d9b0b7931d	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "16:30", "dayOfWeek": 3, "startTime": "13:30"}, {"endTime": "15:30", "dayOfWeek": 6, "startTime": "13:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.131592	2025-06-19 09:53:31.131592
c42b976b-1780-4780-bac7-1fa200a42edf	DCPET 3-2	30958bc4-b3fd-4d60-bee4-fa9c12eb2cad	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "21:30", "dayOfWeek": 4, "startTime": "18:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.136576	2025-06-19 09:53:31.136576
f2ad20c9-0a2f-415e-a483-e478be45c6c2	DCPET 3-3	30958bc4-b3fd-4d60-bee4-fa9c12eb2cad	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "16:30", "dayOfWeek": 5, "startTime": "13:30"}]	f	0.0	0.0	\N	t	2025-06-19 09:53:31.138866	2025-06-19 09:53:31.138866
0cc810be-e013-4fc2-b318-5e79e37e634c	DCPET 3-2	6bd77fe8-3c33-450a-8d32-d1b84cebdf3d	\N	Planning	Laboratory	First	2025-2026	30	0	TBA	[{"endTime": "21:00", "dayOfWeek": 1, "startTime": "18:00"}, {"endTime": "21:30", "dayOfWeek": 4, "startTime": "19:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.143583	2025-06-19 09:53:31.143583
775f670b-d6a3-46fe-b38e-03fd79a5c861	DCPET 3-3	6bd77fe8-3c33-450a-8d32-d1b84cebdf3d	\N	Planning	Laboratory	First	2025-2026	30	0	TBA	[{"endTime": "21:00", "dayOfWeek": 2, "startTime": "18:00"}, {"endTime": "20:00", "dayOfWeek": 5, "startTime": "18:00"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.146036	2025-06-19 09:53:31.146036
9818701d-80de-48f5-87b5-bad94c244c8e	DCPET 3-1	30958bc4-b3fd-4d60-bee4-fa9c12eb2cad	401ff400-4855-4d7a-93b4-39de2b6acd3a	Planning	Laboratory	First	2025-2026	30	0	TBA	[{"endTime": "12:30", "dayOfWeek": 6, "startTime": "10:30"}, {"endTime": "16:30", "dayOfWeek": 6, "startTime": "13:30"}]	f	0.0	5.0		t	2025-06-19 09:53:31.13424	2025-06-19 12:40:36.393331
3d966f06-3101-4ae4-9981-1d4bfbc8d51e	DCPET 3-1	f5857806-274c-4803-a454-7875f4e415bd	401ff400-4855-4d7a-93b4-39de2b6acd3a	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "09:00", "dayOfWeek": 1, "startTime": "07:30"}, {"endTime": "09:00", "dayOfWeek": 4, "startTime": "07:30"}, {"endTime": "21:00", "dayOfWeek": 2, "startTime": "18:00"}]	f	0.0	6.0		t	2025-06-19 09:53:31.112007	2025-06-19 12:41:24.018482
ee18193c-00d7-47b6-b77c-f426dc157646	DCPET 3-1	2ae3f74b-ce33-4b90-9141-f90477645125	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "21:30", "dayOfWeek": 1, "startTime": "18:30"}, {"endTime": "22:30", "dayOfWeek": 4, "startTime": "21:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.148785	2025-06-19 09:53:31.148785
7eaff4ee-c022-46f8-b59f-9e3da6f60868	DCPET 3-3	2ae3f74b-ce33-4b90-9141-f90477645125	\N	Planning	Combined	First	2025-2026	30	0	TBA	[{"endTime": "22:00", "dayOfWeek": 5, "startTime": "19:00"}, {"endTime": "22:30", "dayOfWeek": 6, "startTime": "20:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.153412	2025-06-19 09:53:31.153412
3fb10ea6-50a6-4607-b8d8-dc386130f02f	DCPET 3-1	e7aa1a46-e5f0-45f1-962d-aaf8162cc629	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "19:30", "dayOfWeek": 5, "startTime": "16:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.155795	2025-06-19 09:53:31.155795
1d746ee7-33f9-4fd1-a6a4-9cf05f5c47c5	DCPET 3-2	e7aa1a46-e5f0-45f1-962d-aaf8162cc629	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "18:30", "dayOfWeek": 6, "startTime": "15:30"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.158099	2025-06-19 09:53:31.158099
7d113767-614b-43ba-89fe-741f09d96e1a	DCPET 3-3	e7aa1a46-e5f0-45f1-962d-aaf8162cc629	\N	Planning	Lecture	First	2025-2026	30	0	TBA	[{"endTime": "23:00", "dayOfWeek": 3, "startTime": "20:00"}]	t	0.0	0.0	\N	t	2025-06-19 09:53:31.160508	2025-06-19 09:53:31.160508
47e908ac-f8b3-42e6-b125-257d09b7913f	DCPET 2-1	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	bd9d5947-770b-4252-9443-8c20a49baaec	Assigned	Laboratory	First	2025-2026	30	0	IT201	[{"endTime": "13:30", "dayOfWeek": 2, "startTime": "10:30"}, {"endTime": "12:30", "dayOfWeek": 5, "startTime": "10:30"}]	f	0.0	3.0	Jake Libed - Laboratory hours only. Team teaching with John Michael Legaspi for lecture component.	t	2025-06-19 09:53:31.052942	2025-06-19 10:13:59.942294
a9b5f83a-799b-49f3-9961-0eb26c30ea33	DCPET 3-2	2ae3f74b-ce33-4b90-9141-f90477645125	781a823d-3e2f-4902-a402-56ab3363e762	Assigned	Combined	First	2025-2026	30	0	TBA	[{"endTime": "22:30", "dayOfWeek": 3, "startTime": "19:30"}, {"endTime": "20:30", "dayOfWeek": 6, "startTime": "18:30"}]	t	0.0	0.0	John Michael Legaspi assigned to teach Database Management System 2	t	2025-06-19 09:53:31.151208	2025-06-19 10:30:09.123104
4762f754-5443-4037-a6c4-cbb8733074be	TEST-REGULAR-HOURS	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	\N	Planning	Laboratory	First	2025-2026	30	0	IT201	[{"endTime": "13:00", "dayOfWeek": 1, "startTime": "10:00"}]	f	0.0	0.0	Test section for regular hours (10am-1pm)	t	2025-06-19 10:46:49.626408	2025-06-19 10:46:49.626408
6a9766bf-78de-4063-9017-2a64fa60a87e	DCPET 3-1	6bd77fe8-3c33-450a-8d32-d1b84cebdf3d	bfc7543a-6184-4572-9073-52a63086312b	Planning	Laboratory	First	2025-2026	30	0	TBA	[{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}]	t	0.0	3.0		t	2025-06-19 09:53:31.14128	2025-06-19 11:29:43.90681
005880f2-10e6-439e-abcc-4a529acfbb4b	DCPET 1-1	931701e4-ee14-4148-acf3-de8ff59e7a30	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 213	[{"room": "ITECH 213", "endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}, {"room": "ITECH 212", "endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	3.0	3.0	Updated schedule for CHEM 015 in DCPET 1-1	t	2025-06-19 12:23:57.587411	2025-06-19 12:23:57.587411
8787dc79-04cb-4365-9403-db6c83b812de	DCPET 1-1	4789d95d-108b-4eed-9512-310f324ad1de	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 201	[{"room": "ITECH 201", "endTime": "15:30", "dayOfWeek": 5, "startTime": "13:30"}, {"room": "ITECH 204", "endTime": "16:30", "dayOfWeek": 6, "startTime": "13:30"}]	f	2.0	3.0	Updated schedule for CPET 102 in DCPET 1-1	t	2025-06-19 12:23:57.60975	2025-06-19 12:23:57.60975
3accf1ba-8e78-48c0-b3d9-1c9c9f81406a	DCPET 1-1	6af77b41-d101-42e5-8e20-793255bd7e2e	\N	Planning	Lecture	First	2025-2026	40	30	OpnCourtPE	[{"room": "OpnCourtPE", "endTime": "12:30", "dayOfWeek": 5, "startTime": "10:30"}]	f	2.0	0.0	Updated schedule for PATHFIT 1 in DCPET 1-1	t	2025-06-19 12:23:57.618946	2025-06-19 12:23:57.618946
3c5e8c2c-043f-498f-8966-b7de21cce857	DCPET 1-1	8f62f0b1-a11c-4f73-aea1-1c6403c467b4	\N	Planning	Lecture	First	2025-2026	40	30	FIELD	[{"room": "FIELD", "endTime": "12:00", "dayOfWeek": 1, "startTime": "08:00"}, {"room": "FIELD", "endTime": "17:00", "dayOfWeek": 1, "startTime": "13:00"}]	f	3.0	0.0	Updated schedule for CWTS 001 in DCPET 1-1	t	2025-06-19 12:23:57.624068	2025-06-19 12:23:57.624068
19f6e404-e8b5-4529-a472-d0ef0de06954	DCPET 1-1	652a4c5c-910c-4bef-9605-bccf6611e6b6	\N	Planning	Lecture	First	2025-2026	40	30	FIELD	[{"room": "FIELD", "endTime": "12:00", "dayOfWeek": 1, "startTime": "08:00"}, {"room": "FIELD", "endTime": "17:00", "dayOfWeek": 1, "startTime": "13:00"}]	f	3.0	0.0	Updated schedule for ROTC 001 in DCPET 1-1	t	2025-06-19 12:23:57.629891	2025-06-19 12:23:57.629891
d7d64a90-8098-41ee-b4a8-ab40079787b4	DCPET 1-1	6f2d9599-ff32-4d99-bf58-1e0f6f967f54	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 212	[{"room": "ITECH 212", "endTime": "20:00", "dayOfWeek": 1, "startTime": "17:00"}, {"room": "ITECH 212", "endTime": "19:00", "dayOfWeek": 4, "startTime": "17:00"}]	f	0.0	6.0	Updated schedule for CMPE 105 in DCPET 1-1	t	2025-06-19 12:23:57.634654	2025-06-19 12:23:57.634654
9fa81911-8a80-47c4-8c3e-bf2a695bbe20	DCPET 1-1	36ea268e-e028-4082-960b-cbf79c53fe29	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 213	[{"room": "ITECH 213", "endTime": "21:00", "dayOfWeek": 3, "startTime": "18:00"}, {"room": "ITECH 213", "endTime": "21:00", "dayOfWeek": 6, "startTime": "18:00"}]	t	0.0	6.0	Updated schedule for ENSC 013 in DCPET 1-1	t	2025-06-19 12:23:57.640168	2025-06-19 12:23:57.640168
790311bf-0293-4703-b875-155303e2ac14	DCPET 1-2	6af77b41-d101-42e5-8e20-793255bd7e2e	\N	Planning	Lecture	First	2025-2026	40	30	OpnCourtPE	[{"room": "OpnCourtPE", "endTime": "16:30", "dayOfWeek": 1, "startTime": "14:30"}]	f	2.0	0.0	Updated schedule for PATHFIT 1 in DCPET 1-2	t	2025-06-19 12:27:47.674454	2025-06-19 12:27:47.674454
f66d3c99-cdbf-44ae-a55e-bc3559635fa2	DCPET 1-2	4789d95d-108b-4eed-9512-310f324ad1de	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 204	[{"room": "ITECH 204", "endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}, {"room": "ITECH 201", "endTime": "09:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	2.0	3.0	Updated schedule for CPET 102 in DCPET 1-2	t	2025-06-19 12:27:47.687616	2025-06-19 12:27:47.687616
444c38e9-c0b6-4058-968c-3241bad3e6c3	DCPET 1-2	744951e5-2a2f-449a-a18d-d39fc7f1a206	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 205	[{"room": "ITECH 205", "endTime": "16:30", "dayOfWeek": 5, "startTime": "13:30"}, {"room": "ITECH 205", "endTime": "16:30", "dayOfWeek": 2, "startTime": "13:30"}]	f	0.0	6.0	Updated schedule for CMPE 102 in DCPET 1-2	t	2025-06-19 12:27:47.695441	2025-06-19 12:27:47.695441
c5ad1cc6-8bfc-484b-99dc-b1649b736356	DCPET 1-2	9722ca14-c65f-462e-974e-dae1c5301ede	\N	Planning	Lecture	First	2025-2026	40	30	ITECH 213	[{"room": "ITECH 213", "endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}]	f	3.0	0.0	Updated schedule for MATH 101 in DCPET 1-2	t	2025-06-19 12:27:47.702029	2025-06-19 12:27:47.702029
92be6d75-0d47-42d2-bb3f-ca95ee57601c	DCPET 1-1	744951e5-2a2f-449a-a18d-d39fc7f1a206	401ff400-4855-4d7a-93b4-39de2b6acd3a	Planning	Laboratory	First	2025-2026	40	30	ITECH 205	[{"room": "ITECH 205", "endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}, {"room": "ITECH 205", "endTime": "16:00", "dayOfWeek": 4, "startTime": "13:00"}]	f	0.0	6.0	Updated schedule for CMPE 102 in DCPET 1-1	t	2025-06-19 12:23:57.59895	2025-06-19 12:33:36.844046
f65c09c7-3c9b-4f8d-b3f2-2fb1d6f895a0	DCPET 1-1	9722ca14-c65f-462e-974e-dae1c5301ede	\N	Planning	Lecture	First	2025-2026	40	30	ITECH 201	[{"room": "ITECH 201", "endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	3.0	0.0	Updated schedule for MATH 101 in DCPET 1-1	t	2025-06-19 12:23:57.604144	2025-12-15 05:53:26.130185
f0c08b7b-0a33-49e6-bcdb-4f218a263ed6	DCPET 1-2	931701e4-ee14-4148-acf3-de8ff59e7a30	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 212	[{"room": "ITECH 212", "endTime": "13:30", "dayOfWeek": 3, "startTime": "10:30"}, {"room": "ITECH 212", "endTime": "13:30", "dayOfWeek": 6, "startTime": "10:30"}]	f	3.0	3.0	Updated schedule for CHEM 015 in DCPET 1-2	t	2025-06-19 12:27:47.707957	2025-06-19 12:27:47.707957
bdc71de2-906b-4a33-aef1-517ecb05085d	DCPET 1-2	36ea268e-e028-4082-960b-cbf79c53fe29	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 213	[{"room": "ITECH 213", "endTime": "21:00", "dayOfWeek": 1, "startTime": "18:00"}, {"room": "ITECH 213", "endTime": "16:30", "dayOfWeek": 6, "startTime": "13:30"}]	t	0.0	6.0	Updated schedule for ENSC 013 in DCPET 1-2	t	2025-06-19 12:27:47.71896	2025-06-19 12:27:47.71896
eb5b0cad-6e7b-4f97-b873-586c3bc5d9d2	DCPET 1-2	6f2d9599-ff32-4d99-bf58-1e0f6f967f54	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 212	[{"room": "ITECH 212", "endTime": "20:00", "dayOfWeek": 2, "startTime": "17:00"}, {"room": "ITECH 212", "endTime": "19:00", "dayOfWeek": 5, "startTime": "17:00"}]	f	0.0	6.0	Updated schedule for CMPE 105 in DCPET 1-2	t	2025-06-19 12:27:47.727111	2025-06-19 12:27:47.727111
5b9ead0e-c120-4f95-8bdd-d68918ad2fb1	DCPET 1-2	8f62f0b1-a11c-4f73-aea1-1c6403c467b4	\N	Planning	Lecture	First	2025-2026	40	30	FIELD	[{"room": "FIELD", "endTime": "12:00", "dayOfWeek": 1, "startTime": "08:00"}, {"room": "FIELD", "endTime": "17:00", "dayOfWeek": 1, "startTime": "13:00"}]	f	3.0	0.0	Updated schedule for CWTS 001 in DCPET 1-2	t	2025-06-19 12:27:47.733778	2025-06-19 12:27:47.733778
36ba0b04-6988-401a-b175-56b6b64b176c	DCPET 1-2	652a4c5c-910c-4bef-9605-bccf6611e6b6	\N	Planning	Lecture	First	2025-2026	40	30	FIELD	[{"room": "FIELD", "endTime": "12:00", "dayOfWeek": 1, "startTime": "08:00"}, {"room": "FIELD", "endTime": "17:00", "dayOfWeek": 1, "startTime": "13:00"}]	f	3.0	0.0	Updated schedule for ROTC 001 in DCPET 1-2	t	2025-06-19 12:27:47.739645	2025-06-19 12:27:47.739645
73ed8407-c0b0-4e50-986e-9923b1b66066	DCPET 1-3	6af77b41-d101-42e5-8e20-793255bd7e2e	\N	Planning	Lecture	First	2025-2026	40	30	OpnCourtPE	[{"room": "OpnCourtPE", "endTime": "13:00", "dayOfWeek": 2, "startTime": "11:00"}]	f	2.0	0.0	Updated schedule for PATHFIT 1 in DCPET 1-3	t	2025-06-19 12:31:38.498276	2025-06-19 12:31:38.498276
0e5c45ff-668b-4e9f-af1b-8f35e0105580	DCPET 1-3	931701e4-ee14-4148-acf3-de8ff59e7a30	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 213	[{"room": "ITECH 213", "endTime": "10:30", "dayOfWeek": 2, "startTime": "07:30"}, {"room": "ITECH 213", "endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}]	f	3.0	3.0	Updated schedule for CHEM 015 in DCPET 1-3	t	2025-06-19 12:31:38.505046	2025-06-19 12:31:38.505046
14fceac9-0b94-4d71-9679-f2a637e2ecda	DCPET 1-3	744951e5-2a2f-449a-a18d-d39fc7f1a206	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 204	[{"room": "ITECH 204", "endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}, {"room": "ITECH 205", "endTime": "21:00", "dayOfWeek": 5, "startTime": "18:00"}]	t	0.0	6.0	Updated schedule for CMPE 102 in DCPET 1-3	t	2025-06-19 12:31:38.508636	2025-06-19 12:31:38.508636
2aea8070-ae3c-4989-9a13-32af0ee1f6ba	DCPET 1-3	36ea268e-e028-4082-960b-cbf79c53fe29	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 213	[{"room": "ITECH 213", "endTime": "13:30", "dayOfWeek": 6, "startTime": "10:30"}, {"room": "ITECH 213", "endTime": "21:00", "dayOfWeek": 2, "startTime": "18:00"}]	t	0.0	6.0	Updated schedule for ENSC 013 in DCPET 1-3	t	2025-06-19 12:31:38.512422	2025-06-19 12:31:38.512422
0b370d14-8a78-457d-bd18-860bc8fcedfb	DCPET 1-3	4789d95d-108b-4eed-9512-310f324ad1de	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 201	[{"room": "ITECH 201", "endTime": "15:30", "dayOfWeek": 2, "startTime": "13:30"}, {"room": "ITECH 204", "endTime": "16:30", "dayOfWeek": 5, "startTime": "13:30"}]	f	2.0	3.0	Updated schedule for CPET 102 in DCPET 1-3	t	2025-06-19 12:31:38.516404	2025-06-19 12:31:38.516404
51406732-17fe-4fd6-8966-1637ab25ff1d	DCPET 1-3	6f2d9599-ff32-4d99-bf58-1e0f6f967f54	\N	Planning	Laboratory	First	2025-2026	40	30	ITECH 212	[{"room": "ITECH 212", "endTime": "16:30", "dayOfWeek": 6, "startTime": "14:30"}, {"room": "ITECH 212", "endTime": "19:30", "dayOfWeek": 6, "startTime": "16:30"}]	f	0.0	6.0	Updated schedule for CMPE 105 in DCPET 1-3	t	2025-06-19 12:31:38.520895	2025-06-19 12:31:38.520895
81be847a-b52d-4aa7-8e89-77a1f1b891a8	DCPET 1-3	9722ca14-c65f-462e-974e-dae1c5301ede	\N	Planning	Lecture	First	2025-2026	40	30	ITECH 201	[{"room": "ITECH 201", "endTime": "10:30", "dayOfWeek": 1, "startTime": "07:30"}]	f	3.0	0.0	Updated schedule for MATH 101 in DCPET 1-3	t	2025-06-19 12:31:38.524046	2025-06-19 12:31:38.524046
3b08c489-6bac-429a-bbc3-3602a2232ffe	DCPET 1-3	8f62f0b1-a11c-4f73-aea1-1c6403c467b4	\N	Planning	Lecture	First	2025-2026	40	30	FIELD	[{"room": "FIELD", "endTime": "12:00", "dayOfWeek": 1, "startTime": "08:00"}, {"room": "FIELD", "endTime": "17:00", "dayOfWeek": 1, "startTime": "13:00"}]	f	3.0	0.0	Updated schedule for CWTS 001 in DCPET 1-3	t	2025-06-19 12:31:38.527823	2025-06-19 12:31:38.527823
73579942-fdb5-47ea-80bb-5e3c5e05767c	DCPET 1-3	652a4c5c-910c-4bef-9605-bccf6611e6b6	\N	Planning	Lecture	First	2025-2026	40	30	FIELD	[{"room": "FIELD", "endTime": "12:00", "dayOfWeek": 1, "startTime": "08:00"}, {"room": "FIELD", "endTime": "17:00", "dayOfWeek": 1, "startTime": "13:00"}]	f	3.0	0.0	Updated schedule for ROTC 001 in DCPET 1-3	t	2025-06-19 12:31:38.532236	2025-06-19 12:31:38.532236
9c833a64-7961-4ddd-9cc3-ada0fe24c7c4	DCPET 1-1	8f62f0b1-a11c-4f73-aea1-1c6403c467b4	\N	Planning	Lecture	Second	2025-2026	0	0	FIELD	\N	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:13:27.901676	2025-12-15 03:13:27.901676
474159c8-f595-4a58-bb0d-031f8e9f3949	DCPET 1-1	564569fc-1c1a-4f24-bb9f-fdd439e5a207	\N	Planning	Lecture	Second	2025-2026	60	0	FIELD	\N	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.297836	2025-12-15 03:14:32.297836
cc18b8b6-1c38-4cdd-b750-24de6f0791f5	DCPET 1-1	344c787d-01e0-417e-8203-d02d2388e8dd	\N	Active	Lecture	Second	2025-2026	60	0	200	[{"endTime": "16:30", "dayOfWeek": 6, "startTime": "13:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.363694	2025-12-26 04:55:53.990446
379ed55c-2e64-4d1c-bfb1-e63d2ec673d7	DCPET 1-1	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	b07069bd-2310-4bf9-a080-fbb91b1c1cde	Assigned	Laboratory	Second	2025-2026	60	0	205	[{"endTime": "13:30", "dayOfWeek": 2, "startTime": "10:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:13:27.90966	2025-12-16 08:29:33.624205
9960633b-8cf3-4619-a8bb-11428d85480c	DCPET 1-3	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	b07069bd-2310-4bf9-a080-fbb91b1c1cde	Assigned	Laboratory	Second	2025-2026	60	0	205	[{"endTime": "10:30", "dayOfWeek": 2, "startTime": "07:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:13:27.940037	2025-12-16 08:31:16.631904
56dc97ad-0cb7-4c6f-9f0c-c15ec10f3455	DCPET 1-2	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	bd9d5947-770b-4252-9443-8c20a49baaec	Assigned	Laboratory	Second	2025-2026	60	0	205	[{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}, {"endTime": "10:30", "dayOfWeek": 4, "startTime": "07:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:13:27.918675	2025-12-15 05:48:38.448911
79f443d6-4a97-493d-b32b-dba62e10f702	DCPET 1-2	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	b07069bd-2310-4bf9-a080-fbb91b1c1cde	Assigned	Laboratory	Second	2025-2026	60	0	205	[{"endTime": "10:30", "dayOfWeek": 1, "startTime": "07:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:13:27.925505	2025-12-16 08:09:46.352397
c1e6e7c3-44df-4ddd-8dc5-39fefeb27090	DCPET 1-1	290b617f-ddaf-4537-b790-d6b996f050e6	\N	Active	Lecture	Second	2025-2026	60	0	213	[{"endTime": "18:00", "dayOfWeek": 2, "startTime": "15:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.3673	2025-12-26 04:55:21.897053
6145de05-b2fe-4c83-81cf-a1a770b6f14f	DECET 1-1	564569fc-1c1a-4f24-bb9f-fdd439e5a207	\N	Planning	Lecture	Second	2025-2026	60	0	FIELD	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:05.994965	2025-12-15 04:16:05.994965
82e1459f-ffcb-4379-aa09-707b7b937388	DC PET 3-1	40cb7f22-3883-4382-aee7-b026152a446f	781a823d-3e2f-4902-a402-56ab3363e762	Assigned	Combined	Second	2025-2026	60	0		[{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	1.0	6.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.583283	2025-12-15 10:08:26.401878
7a3844df-c400-4ef8-9245-c0f46a0ecc4a	DC PET 3-1	589aed1c-55dc-476f-9c47-304b89643863	bfc7543a-6184-4572-9073-52a63086312b	Assigned	Laboratory	Second	2025-2026	60	0	TBA	[{"endTime": "21:00", "dayOfWeek": 6, "startTime": "18:00"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.589934	2025-12-15 10:10:48.827576
c499ad0c-28c2-44b4-a579-0ebd16aaa819	OCPET 2-1	5f101b5b-bbf6-4f02-a448-d066e9e55b93	\N	Planning	Combined	Second	2025-2026	60	0	IT204	\N	f	2.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.137742	2025-12-15 08:17:24.093289
d54ddbe6-499b-42f4-ac48-ce1cf73169a4	DC PET 3-1	04236cc6-1cc8-45fa-8b1c-5277b89666d6	401ff400-4855-4d7a-93b4-39de2b6acd3a	Assigned	Laboratory	Second	2025-2026	60	0	209	[{"endTime": "12:30", "dayOfWeek": 4, "startTime": "09:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.596869	2025-12-26 05:09:09.75975
8847c335-0f2d-4b9e-b4ff-2f1fcfdeb08a	DC PET 3-2	40cb7f22-3883-4382-aee7-b026152a446f	401ff400-4855-4d7a-93b4-39de2b6acd3a	Assigned	Combined	Second	2025-2026	60	0	DC PET 3-2	[{"endTime": "21:00", "dayOfWeek": 5, "startTime": "18:00"}]	f	1.0	6.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.616062	2025-12-15 11:08:37.798807
419b7331-3065-4b23-97c5-e6458257322e	DC PET 3-2	589aed1c-55dc-476f-9c47-304b89643863	401ff400-4855-4d7a-93b4-39de2b6acd3a	Assigned	Laboratory	Second	2025-2026	60	0	field	[{"endTime": "21:00", "dayOfWeek": 2, "startTime": "18:00"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.622768	2025-12-15 11:10:48.69214
939b0fad-d785-4059-b782-7b7e57d400e2	DC PET 3-3	04236cc6-1cc8-45fa-8b1c-5277b89666d6	781a823d-3e2f-4902-a402-56ab3363e762	Assigned	Laboratory	Second	2025-2026	60	0	204	[{"endTime": "21:00", "dayOfWeek": 5, "startTime": "18:00"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.650945	2025-12-26 05:11:50.160153
e7d71ef1-bbb0-4e57-aadc-07a7b9227a6f	DC PET 3-2	2135d4a1-897f-4f63-b5ff-5d8a2a1249a8	\N	Active	Lecture	Second	2025-2026	60	0	212	[{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.635377	2025-12-15 11:13:32.90747
8d869914-372f-45ee-8b0c-28c6129e9af7	DC PET 3-3	40cb7f22-3883-4382-aee7-b026152a446f	677387ce-78df-41af-aba9-9d010ee3f9bf	Assigned	Combined	Second	2025-2026	60	0	DC PET 3-3	[{"endTime": "21:00", "dayOfWeek": 1, "startTime": "18:00"}]	f	1.0	6.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.640704	2025-12-15 11:14:38.957874
ea40a644-e638-4620-8ab3-f8678e535155	DECET 1-1	9b31cc69-9761-4bc5-84d9-9ea2f3b6081d	d7098608-af01-4f3b-8727-9c5bda6569dc	Assigned	Combined	Second	2025-2026	60	0	200	[{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}, {"endTime": "18:30", "dayOfWeek": 4, "startTime": "16:30"}]	f	2.0	3.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.006986	2025-12-15 11:37:08.851593
4f231085-f273-4257-8ff5-fd31b5f47ffb	DC PET 3-3	2135d4a1-897f-4f63-b5ff-5d8a2a1249a8	\N	Active	Lecture	Second	2025-2026	60	0	212	[{"endTime": "10:30", "dayOfWeek": 4, "startTime": "07:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.655426	2025-12-15 11:16:15.722913
2fdc6d32-9194-40f3-9624-ebd5f19c3143	DC PET 3-3	589aed1c-55dc-476f-9c47-304b89643863	d7d4dc55-08c9-433a-99f4-09d84041aec7	Assigned	Laboratory	Second	2025-2026	60	0	online	[{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.64625	2025-12-15 11:17:01.797994
595e7f5f-610d-4237-b0b5-db237234fc12	DECET 1-1	eb110c4f-3ed9-42b6-89be-86fb3e1777ff	0b3f53cd-6504-4e29-af93-e727d98b58b0	Assigned	Laboratory	Second	2025-2026	60	0	200	[{"endTime": "10:30", "dayOfWeek": 2, "startTime": "07:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:05.9992	2025-12-15 11:43:40.109788
54082bb2-3b69-4f6c-8b44-92c855752fe3	DECET 1-1	9ac920a5-a95d-46c4-9a0f-2830ccebd73b	0b3f53cd-6504-4e29-af93-e727d98b58b0	Assigned	Combined	Second	2025-2026	60	0	201	[{"endTime": "16:30", "dayOfWeek": 2, "startTime": "13:30"}]	f	3.0	3.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.002844	2025-12-15 11:46:14.190416
c653c85c-44d9-4ab5-8864-85ac31b052ac	DC PET 3-2	04236cc6-1cc8-45fa-8b1c-5277b89666d6	681ca93b-d7f4-4140-a189-77d76f6c0621	Assigned	Laboratory	Second	2025-2026	60	0	201	[{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}, {"endTime": "16:30", "dayOfWeek": 4, "startTime": "13:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.630101	2025-12-16 07:09:30.700607
c48c2947-4359-4544-b867-57343f36c551	DC PET 3-1	2135d4a1-897f-4f63-b5ff-5d8a2a1249a8	\N	Active	Lecture	Second	2025-2026	60	0	209	[{"endTime": "17:00", "dayOfWeek": 4, "startTime": "14:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 3rd Year	t	2025-12-15 04:12:08.60749	2025-12-16 08:33:25.098993
bff0ea02-6054-4e43-be9f-66e37907804f	DECET 1-1	fded90ba-10ff-4e47-ace4-9a9cf6ba235d	\N	Active	Lecture	Second	2025-2026	60	0	209	[{"endTime": "16:30", "dayOfWeek": 3, "startTime": "13:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.011306	2025-12-16 08:41:28.067003
35e64ef1-9912-4aae-8e8c-e32b96890e36	DECET 1-1	56213fa5-f8f6-4052-8b1e-89ec49cef677	\N	Planning	Lecture	Second	2025-2026	60	0	TBA	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.032549	2025-12-15 04:16:06.032549
a2f68266-3d71-497c-bbec-98c83c4f00a3	DECET 1-2	564569fc-1c1a-4f24-bb9f-fdd439e5a207	\N	Planning	Lecture	Second	2025-2026	60	0	FIELD	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.036938	2025-12-15 04:16:06.036938
140f68a3-cd17-4e27-bee6-5672fdd2cdd2	DECET 1-2	56213fa5-f8f6-4052-8b1e-89ec49cef677	\N	Planning	Lecture	Second	2025-2026	60	0	FIELD	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.076386	2025-12-15 04:16:06.076386
1f252391-f25b-4fc7-b237-c1276105ac45	DCPET 1-2	8ca7edad-38f5-46be-9170-0e2cad659b61	\N	Planning	Lecture	Second	2025-2026	60	0	TRA	[{"endTime": "16:30", "dayOfWeek": 1, "startTime": "14:30"}]	f	2.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.412626	2025-12-15 04:29:05.379776
71fa4e8d-dbc5-4259-8264-b52a0aea6242	DECET 1-2	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	b07069bd-2310-4bf9-a080-fbb91b1c1cde	Assigned	Laboratory	Second	2025-2026	60	0	205	[{"endTime": "13:30", "dayOfWeek": 4, "startTime": "10:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.061159	2025-12-15 12:04:07.49736
9edbd1bd-d6e0-48bc-8bea-120f510df7ed	DECET 1-2	eb110c4f-3ed9-42b6-89be-86fb3e1777ff	0b3f53cd-6504-4e29-af93-e727d98b58b0	Assigned	Laboratory	Second	2025-2026	60	0	200	[{"endTime": "13:00", "dayOfWeek": 3, "startTime": "10:00"}, {"endTime": "13:30", "dayOfWeek": 6, "startTime": "10:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.04353	2025-12-15 12:06:53.019355
fcc8d4a0-1b5c-42f4-82c8-1234e8fa0fbc	DECET 2-1	b2715617-754c-4a0f-bcdd-85d11e167d9c	64060dc0-651f-4fa2-93d6-ff9b2b9fc3ce	Assigned	Combined	Second	2025-2026	60	0	213	[{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}, {"endTime": "13:30", "dayOfWeek": 6, "startTime": "10:30"}]	f	2.0	3.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.688781	2025-12-16 08:42:48.523493
05bbfed9-cd27-4a9b-9af7-cc293729c945	DECET 2-2	7a0b27a6-138c-4031-a872-fff8e4129c21	13d8d74c-39c9-414a-af69-cf5769391fd5	Assigned	Combined	Second	2025-2026	60	0	209	[{"endTime": "21:00", "dayOfWeek": 3, "startTime": "18:00"}, {"endTime": "13:30", "dayOfWeek": 6, "startTime": "10:30"}]	f	3.0	3.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.712441	2025-12-15 12:26:29.617134
e179fb27-d394-489b-ad6b-0c3eaad582ab	DECET 2-1	b02f88b8-d420-4cff-904a-d498800c74cf	d7098608-af01-4f3b-8727-9c5bda6569dc	Assigned	Laboratory	Second	2025-2026	60	0	201	[{"endTime": "13:30", "dayOfWeek": 4, "startTime": "10:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.69259	2025-12-16 08:42:55.378238
87a675bc-be43-41ca-b02c-e89e5bdcf105	DECET 2-2	2471b001-c40e-4676-aead-126f9c0ccd02	6e2c20cd-ef52-4997-96a3-4fe331dddc45	Active	Combined	Second	2025-2026	60	0	200	[{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}, {"endTime": "13:30", "dayOfWeek": 5, "startTime": "10:30"}]	f	3.0	3.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.708694	2025-12-15 12:22:37.436517
815e0eb3-4c67-42ec-b6ef-6e9ac0cf1a32	OCPET 2-1	cff588e7-1092-4648-8f6d-1dfd4c6a3278	\N	Planning	Lecture	Second	2025-2026	60	0	TBA	[{"endTime": "15:00", "dayOfWeek": 4, "startTime": "13:00"}]	f	2.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.148569	2025-12-15 08:17:24.093289
0e98e5b0-c721-4dcf-86ba-04968525e9f3	DECET 1-1	d3537276-4d6f-42c9-aab2-c55dfaa84d2a	b07069bd-2310-4bf9-a080-fbb91b1c1cde	Assigned	Laboratory	Second	2025-2026	60	0	213	[{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.015462	2025-12-15 11:23:54.906726
3a4c0d77-8cbf-492e-b6eb-ec6e324b69fc	DECET 1-2	290b617f-ddaf-4537-b790-d6b996f050e6	\N	Active	Lecture	Second	2025-2026	60	0	201	[{"endTime": "21:00", "dayOfWeek": 2, "startTime": "18:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.064245	2025-12-26 05:16:20.808272
f39dba51-f42a-407b-a6e8-f48456279eca	DECET 1-1	8ca7edad-38f5-46be-9170-0e2cad659b61	\N	Active	Lecture	Second	2025-2026	60	0	TBA	[{"endTime": "15:30", "dayOfWeek": 4, "startTime": "13:30"}]	f	2.0	0.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.02597	2025-12-15 11:37:58.072937
737c52a9-d00c-41f9-bafe-69795146dcbb	DECET 1-2	8ca7edad-38f5-46be-9170-0e2cad659b61	\N	Active	Lecture	Second	2025-2026	60	0	FIELD	[{"endTime": "10:00", "dayOfWeek": 3, "startTime": "08:00"}]	f	2.0	0.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.067683	2025-12-15 12:04:22.081031
27d727d5-7a69-4ebe-83cb-eefd003145d9	DECET 2-2	9042c970-d653-4cf2-be1a-634ce8fed5ab	b4db07cb-214f-4777-96d2-eaee498773dd	Assigned	Laboratory	Second	2025-2026	60	0	303	[{"endTime": "18:00", "dayOfWeek": 4, "startTime": "15:00"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.72874	2025-12-26 05:39:10.898405
cc48680e-01d7-4e61-94e9-c82e10317b4a	DECET 1-2	9b31cc69-9761-4bc5-84d9-9ea2f3b6081d	d7098608-af01-4f3b-8727-9c5bda6569dc	Assigned	Combined	Second	2025-2026	60	0	200	[{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.05243	2025-12-15 12:10:18.396909
4a375e16-8970-4695-ab0e-caa52a41ce87	DECET 2-1	7a0b27a6-138c-4031-a872-fff8e4129c21	13d8d74c-39c9-414a-af69-cf5769391fd5	Assigned	Combined	Second	2025-2026	60	0	204	[{"endTime": "21:00", "dayOfWeek": 1, "startTime": "18:00"}, {"endTime": "21:00", "dayOfWeek": 4, "startTime": "18:00"}]	f	3.0	3.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.684933	2025-12-16 08:42:41.933278
ddb46876-8ddd-4da7-ae1b-82c58c802be7	DECET 1-1	290b617f-ddaf-4537-b790-d6b996f050e6	\N	Active	Lecture	Second	2025-2026	60	0	209	[{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.021614	2025-12-26 05:12:51.0794
369021d2-4361-4d17-86a9-91fc4d1abe1d	DECET 2-1	cff588e7-1092-4648-8f6d-1dfd4c6a3278	\N	Active	Lecture	Second	2025-2026	60	0	field	[{"endTime": "09:30", "dayOfWeek": 1, "startTime": "07:30"}]	f	2.0	0.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.705079	2025-12-16 08:43:22.133429
575f00e3-531d-4db3-9270-9f3f14583d7f	DECET 2-1	d0b6eba8-fd04-4e4a-bda1-acf1d537ce05	\N	Active	Lecture	Second	2025-2026	60	0	online	[{"endTime": "15:00", "dayOfWeek": 1, "startTime": "12:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.699041	2025-12-15 12:19:19.225521
e12f0ab4-3616-4fad-bef8-fa7c61145067	DECET 2-2	cff588e7-1092-4648-8f6d-1dfd4c6a3278	\N	Active	Lecture	Second	2025-2026	60	0	DECET 2-2	[{"endTime": "12:30", "dayOfWeek": 3, "startTime": "10:30"}]	f	2.0	0.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.741646	2025-12-15 12:21:56.006996
651dbde1-ec6c-46b3-8459-241941a8655e	DECET 2-2	b02f88b8-d420-4cff-904a-d498800c74cf	64060dc0-651f-4fa2-93d6-ff9b2b9fc3ce	Assigned	Laboratory	Second	2025-2026	60	0	200	[{"endTime": "10:30", "dayOfWeek": 1, "startTime": "07:30"}, {"endTime": "12:00", "dayOfWeek": 4, "startTime": "09:00"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.725211	2025-12-15 12:29:10.536644
c2cb36a7-6e52-406a-98ca-fce809807c61	DECET 2-2	d0b6eba8-fd04-4e4a-bda1-acf1d537ce05	\N	Active	Lecture	Second	2025-2026	60	0	online	[{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.732703	2025-12-15 12:29:38.892093
f47936e9-8d0b-4982-a3d6-6a3a232de00e	DECET 1-2	fded90ba-10ff-4e47-ace4-9a9cf6ba235d	\N	Active	Lecture	Second	2025-2026	60	0	209	[{"endTime": "18:00", "dayOfWeek": 2, "startTime": "15:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.057721	2025-12-16 08:41:59.128585
49850a9e-8f25-4fca-a8e7-a71c7c97e2c6	DCPET 2-1	03684182-4ccf-4bb3-88e4-d9d0ab5ff83c	\N	Planning	Lecture	Second	2025-2026	60	0	212	[{"endTime": "13:30", "dayOfWeek": 3, "startTime": "10:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.074642	2025-12-26 05:07:05.936347
e9fe7224-7c8c-4a31-8c12-658541003f1d	DCPET 1-1	b4248701-7003-4365-9414-58b0fcce28ce	bfc7543a-6184-4572-9073-52a63086312b	Assigned	Laboratory	Second	2025-2026	60	0	204	[{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}, {"endTime": "16:30", "dayOfWeek": 4, "startTime": "13:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.287971	2025-12-16 08:29:46.226192
c5ae4a71-a5ae-4575-ace7-3989d091bf8a	DCPET 1-1	40582042-1cb3-4923-9eef-cd23bb4eda13	f79ad68d-e276-4acb-9f9a-dc26a56df575	Assigned	Lecture	Second	2025-2026	60	0	201	[{"endTime": "09:30", "dayOfWeek": 2, "startTime": "07:30"}]	f	2.0	3.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.293165	2025-12-15 06:35:49.09475
b3488c54-af71-4d03-a1b5-1bfc87544a73	DCPET 1-1	7e289bb8-3457-4c3d-a426-9deb394b4e76	f79ad68d-e276-4acb-9f9a-dc26a56df575	Assigned	Laboratory	Second	2025-2026	30	0	204	[{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}]	f	0.0	0.0		t	2025-12-15 06:37:11.998084	2025-12-15 06:37:33.806851
7b6161e7-42b6-48da-b8ba-87fc676efa38	DCPET 1-2	40582042-1cb3-4923-9eef-cd23bb4eda13	f79ad68d-e276-4acb-9f9a-dc26a56df575	Assigned	Combined	Second	2025-2026	60	0	201	[{"endTime": "11:30", "dayOfWeek": 2, "startTime": "09:30"}, {"endTime": "19:30", "dayOfWeek": 5, "startTime": "16:30"}]	f	2.0	3.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.39694	2025-12-15 06:40:44.830203
557cf5a9-7f6e-427d-b9a0-00531b0692ee	DCPET 1-2	b4248701-7003-4365-9414-58b0fcce28ce	f79ad68d-e276-4acb-9f9a-dc26a56df575	Assigned	Laboratory	Second	2025-2026	60	0	205	[{"endTime": "16:30", "dayOfWeek": 6, "startTime": "13:30"}, {"endTime": "19:30", "dayOfWeek": 6, "startTime": "16:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.391549	2025-12-16 08:30:32.624712
860ba781-40d6-4684-ad8a-99d79da21edd	DCPET 1-3	be8121b8-2877-4deb-b215-ec3df77d38d5	\N	Planning	Combined	Second	2025-2026	60	0	TBA	[{"endTime": "15:00", "dayOfWeek": 1, "startTime": "12:00"}, {"endTime": "13:30", "dayOfWeek": 4, "startTime": "10:30"}]	f	3.0	3.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.450211	2025-12-15 06:47:26.34403
8cdaf3f9-79c1-43c9-992d-3ba8907ec157	DCPET 2-2	9883306d-ffac-4029-8298-97a25bb5e83d	677387ce-78df-41af-aba9-9d010ee3f9bf	Assigned	Lecture	Second	2025-2026	60	0	212	[{"endTime": "15:00", "dayOfWeek": 4, "startTime": "12:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.093177	2025-12-16 08:34:29.762698
d2d5c7bd-e9dc-40d3-9187-41c7ea42ccd1	DCPET 2-1	9883306d-ffac-4029-8298-97a25bb5e83d	677387ce-78df-41af-aba9-9d010ee3f9bf	Assigned	Lecture	Second	2025-2026	60	0	201	[{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.058713	2025-12-15 08:20:56.44653
c4b3e8da-4641-490d-88b8-d53dbc49babe	DCPET 2-1	82076eb1-258d-4c81-b862-cefe4541f77d	681ca93b-d7f4-4140-a189-77d76f6c0621	Assigned	Laboratory	Second	2025-2026	60	0	204	[{"endTime": "21:00", "dayOfWeek": 2, "startTime": "18:00"}, {"endTime": "13:30", "dayOfWeek": 6, "startTime": "10:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.071263	2025-12-15 08:23:34.205063
70a46687-7ef5-4b3f-a5ca-53e5cb7166cc	DCPET 1-1	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	bd9d5947-770b-4252-9443-8c20a49baaec	Assigned	Laboratory	Second	2025-2026	60	0	205	[{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}, {"endTime": "13:30", "dayOfWeek": 3, "startTime": "10:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:13:27.827329	2025-12-15 10:27:33.77311
d6b4c054-8dfc-4b22-88ee-625fedbcd5ce	DCPET 2-2	03684182-4ccf-4bb3-88e4-d9d0ab5ff83c	\N	Active	Lecture	Second	2025-2026	60	0	201	[{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.108633	2025-12-16 08:34:41.758503
9c5f5720-0858-4e19-b2df-c15dc3df5e99	DCPET 2-3	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	Assigned	Lecture	Second	2025-2026	60	0	201	[{"endTime": "20:30", "dayOfWeek": 3, "startTime": "17:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.11899	2025-12-16 11:10:47.765161
a5ead379-4a75-4275-9607-26adbc1ff1d6	DCPET 2-2	cff588e7-1092-4648-8f6d-1dfd4c6a3278	\N	Active	Lecture	Second	2025-2026	60	0	GYM	[{"endTime": "18:30", "dayOfWeek": 2, "startTime": "16:30"}]	f	2.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.112287	2025-12-15 08:45:11.445588
d81629c9-bc75-41a0-a80c-2c15fede43c9	DCPET 2-2	5f101b5b-bbf6-4f02-a448-d066e9e55b93	ff533903-dff6-429f-ac16-e1ea0261e6f2	Assigned	Combined	Second	2025-2026	60	0	201	[{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}, {"endTime": "13:30", "dayOfWeek": 6, "startTime": "11:30"}]	f	2.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.101869	2025-12-16 07:04:47.893117
6c91eff6-dfb2-4517-a36d-e6c9a0b053f0	DCPET 1-3	40582042-1cb3-4923-9eef-cd23bb4eda13	f79ad68d-e276-4acb-9f9a-dc26a56df575	Assigned	Combined	Second	2025-2026	60	0	200	[{"endTime": "15:30", "dayOfWeek": 2, "startTime": "13:30"}]	f	2.0	3.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.429525	2025-12-15 09:54:32.327865
9b040d70-bb9f-445e-bf1e-62e01bf670b5	DCPET 2-2	402a7351-9241-4f71-ac32-42944a29bc27	\N	Active	Lecture	Second	2025-2026	60	0	209	[{"endTime": "13:00", "dayOfWeek": 1, "startTime": "10:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.115669	2025-12-16 08:34:49.559951
a5ead9a6-75f2-4257-a713-68ac2af5683b	DCPET 2-3	9883306d-ffac-4029-8298-97a25bb5e83d	677387ce-78df-41af-aba9-9d010ee3f9bf	Assigned	Lecture	Second	2025-2026	60	0	212	[{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.126396	2025-12-16 08:35:44.846708
b1cc3fcd-2645-4da9-ab41-74574a8dc3ea	DCPET 2-1	402a7351-9241-4f71-ac32-42944a29bc27	\N	Planning	Lecture	Second	2025-2026	60	0	212	[{"endTime": "18:00", "dayOfWeek": 5, "startTime": "15:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.082012	2025-12-26 05:07:23.229087
f24458f7-e2f5-4bd3-9495-75a28da9af58	DCPET 2-3	186afdfd-e8fa-45a8-acbe-c734e1f4f735	a988a353-7a8d-4643-8884-8ce7ddea676b	Assigned	Laboratory	Second	2025-2026	60	0	205	[{"endTime": "20:00", "dayOfWeek": 1, "startTime": "17:00"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.12208	2025-12-15 10:38:38.701333
2600589e-ea9a-4cc7-9d8b-79d8250c8bcf	DCPET 2-2	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	Assigned	Lecture	Second	2025-2026	60	0	201	[{"endTime": "17:00", "dayOfWeek": 3, "startTime": "14:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.086255	2025-12-15 10:44:48.943071
44bdf5cb-467b-4531-92da-d6675e748bea	DCPET 2-2	3538ba22-33a5-4388-859e-a7bf9f3c8db6	781a823d-3e2f-4902-a402-56ab3363e762	Planning	Laboratory	Second	2025-2026	60	0	205	[{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.098333	2025-12-16 08:34:23.494333
c7e47104-e2a3-43dd-b84a-ef540e8522c9	DCPET 1-3	a9cc8d81-496e-4e98-b5e7-2ddc158e3e42	bd9d5947-770b-4252-9443-8c20a49baaec	Assigned	Laboratory	Second	2025-2026	60	0	205	[{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}, {"endTime": "13:30", "dayOfWeek": 6, "startTime": "10:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:13:27.934004	2025-12-16 08:31:30.221125
118fe8fa-8fea-4629-87c2-19452e8a800a	DCPET 2-1	186afdfd-e8fa-45a8-acbe-c734e1f4f735	401ff400-4855-4d7a-93b4-39de2b6acd3a	Assigned	Combined	Second	2025-2026	60	0	212	[{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}, {"endTime": "18:00", "dayOfWeek": 4, "startTime": "15:00"}]	f	3.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.054988	2025-12-16 08:33:38.885824
6a855334-3e13-413c-97bd-30745d057a36	DCPET 1-1	8ca7edad-38f5-46be-9170-0e2cad659b61	\N	Active	Lecture	Second	2025-2026	60	0	TRA	[{"endTime": "12:30", "dayOfWeek": 5, "startTime": "10:30"}]	f	2.0	0.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.377782	2025-12-15 08:13:37.525083
20cc4e2b-83dd-4f9e-a947-a9fb17475696	OCPET 2-1	186afdfd-e8fa-45a8-acbe-c734e1f4f735	401ff400-4855-4d7a-93b4-39de2b6acd3a	Assigned	Combined	Second	2025-2026	60	0	IT212	[{"endTime": "16:30", "dayOfWeek": 1, "startTime": "13:30"}, {"endTime": "18:00", "dayOfWeek": 4, "startTime": "15:00"}]	f	3.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.125434	2025-12-15 08:17:24.093289
2b0fabd3-07db-453d-b57c-411d3a377e3c	OCPET 2-1	9883306d-ffac-4029-8298-97a25bb5e83d	677387ce-78df-41af-aba9-9d010ee3f9bf	Assigned	Lecture	Second	2025-2026	60	0	201	[{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.129864	2025-12-15 08:17:24.093289
d8bf1d0d-7587-405e-bf35-670524f26f52	OCPET 2-1	3538ba22-33a5-4388-859e-a7bf9f3c8db6	\N	Planning	Laboratory	Second	2025-2026	60	0	IT204	\N	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.133952	2025-12-15 08:17:24.093289
56c95c32-fac0-4a21-96ef-1a7960d6c2b3	OCPET 2-1	82076eb1-258d-4c81-b862-cefe4541f77d	\N	Planning	Laboratory	Second	2025-2026	60	0	IT212	\N	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.141687	2025-12-15 08:17:24.093289
a4429149-da95-45a0-a271-a5e46fa79768	OCPET 2-1	03684182-4ccf-4bb3-88e4-d9d0ab5ff83c	\N	Planning	Lecture	Second	2025-2026	60	0	IT201	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.144894	2025-12-15 08:17:24.093289
df452a39-8c61-46fd-a53b-3fb0be23f5e5	OCPET 2-1	402a7351-9241-4f71-ac32-42944a29bc27	\N	Planning	Lecture	Second	2025-2026	60	0	IT201	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.152636	2025-12-15 08:17:24.093289
902f045c-4c12-482b-b52d-c03f61d348f6	OCPET 2-2	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	\N	Planning	Lecture	Second	2025-2026	60	0	OCPET 2-2	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.155794	2025-12-15 08:17:24.093289
2a1f9179-cc0e-4a6e-8ae4-ee2dfa8c27cd	OCPET 2-2	186afdfd-e8fa-45a8-acbe-c734e1f4f735	\N	Planning	Combined	Second	2025-2026	60	0	IT212	\N	f	3.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.159169	2025-12-15 08:17:24.093289
b32176c0-c953-463b-94af-295bc4d08338	OCPET 2-2	9883306d-ffac-4029-8298-97a25bb5e83d	\N	Planning	Lecture	Second	2025-2026	60	0	IT204	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.164163	2025-12-15 08:17:24.093289
ad682fd3-9986-464a-8957-69317a38f225	OCPET 2-2	3538ba22-33a5-4388-859e-a7bf9f3c8db6	\N	Planning	Laboratory	Second	2025-2026	60	0	IT212	\N	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.168209	2025-12-15 08:17:24.093289
96e6ca20-470a-4d65-acb2-ffef84ebca56	OCPET 2-2	5f101b5b-bbf6-4f02-a448-d066e9e55b93	\N	Planning	Combined	Second	2025-2026	60	0	IT204	\N	f	2.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.172043	2025-12-15 08:17:24.093289
1e218177-c816-46d7-942c-fc4d582e90a1	OCPET 2-2	82076eb1-258d-4c81-b862-cefe4541f77d	\N	Planning	Laboratory	Second	2025-2026	60	0	IT205	\N	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.175522	2025-12-15 08:17:24.093289
c6bbd324-73cb-4bcb-b468-53e9f133297a	OCPET 2-2	03684182-4ccf-4bb3-88e4-d9d0ab5ff83c	\N	Planning	Lecture	Second	2025-2026	60	0	IT201	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.179017	2025-12-15 08:17:24.093289
5b615789-7522-451f-b9d8-f2635fb3f54f	OCPET 2-2	402a7351-9241-4f71-ac32-42944a29bc27	\N	Planning	Lecture	Second	2025-2026	60	0	IT201	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.18674	2025-12-15 08:17:24.093289
b8b4f408-0d84-4f4f-8820-a4ab91ac6e2f	OCPET 2-3	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	\N	Planning	Lecture	Second	2025-2026	60	0	OCPET 2-3	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.190448	2025-12-15 08:17:24.093289
a3655ba4-2c9c-4552-92c3-09829958555b	OCPET 2-3	186afdfd-e8fa-45a8-acbe-c734e1f4f735	\N	Planning	Combined	Second	2025-2026	60	0	IT205	\N	f	3.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.193765	2025-12-15 08:17:24.093289
eab05e1b-76ce-4fa7-9894-2680d20ec955	OCPET 2-3	9883306d-ffac-4029-8298-97a25bb5e83d	\N	Planning	Lecture	Second	2025-2026	60	0	IT205	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.197128	2025-12-15 08:17:24.093289
79448456-e8cd-4d85-817f-ec15dcf6fe67	OCPET 2-3	3538ba22-33a5-4388-859e-a7bf9f3c8db6	\N	Planning	Laboratory	Second	2025-2026	60	0	IT204	\N	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.201273	2025-12-15 08:17:24.093289
4bdcb9b8-e973-4db5-a72b-de6a688701bc	OCPET 2-3	5f101b5b-bbf6-4f02-a448-d066e9e55b93	\N	Planning	Combined	Second	2025-2026	60	0	IT204	\N	f	2.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.204626	2025-12-15 08:17:24.093289
befd68bd-1cf5-4e0e-b160-2ad812d85ff8	OCPET 2-3	82076eb1-258d-4c81-b862-cefe4541f77d	\N	Planning	Laboratory	Second	2025-2026	60	0	IT204	\N	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.208925	2025-12-15 08:17:24.093289
1f37512f-2353-4fff-9ba9-aad12a46feb3	OCPET 2-3	03684182-4ccf-4bb3-88e4-d9d0ab5ff83c	\N	Planning	Lecture	Second	2025-2026	60	0	IT201	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.213384	2025-12-15 08:17:24.093289
d66334a7-6a4a-48ae-826c-299e758ffe62	OCPET 2-3	402a7351-9241-4f71-ac32-42944a29bc27	\N	Planning	Lecture	Second	2025-2026	60	0	DCPET 2-3	\N	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.221479	2025-12-15 08:17:24.093289
b07169e0-d037-4c79-b1b7-19ec327344c4	OCPET 2-2	cff588e7-1092-4648-8f6d-1dfd4c6a3278	\N	Planning	Lecture	Second	2025-2026	60	0	GYM	[{"endTime": "18:03", "dayOfWeek": 2, "startTime": "16:30"}]	f	2.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.183193	2025-12-15 08:17:24.093289
191d9fb5-6afe-4ebb-b7df-3c7b33694dab	OCPET 2-3	cff588e7-1092-4648-8f6d-1dfd4c6a3278	\N	Planning	Lecture	Second	2025-2026	60	0	DCPET 2-3	[{"endTime": "18:30", "dayOfWeek": 2, "startTime": "16:30"}]	f	2.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	f	2025-12-15 03:29:43.218059	2025-12-15 08:17:24.093289
5afdbf47-cdbf-4bd9-8568-efca687ec0a8	DCPET 2-1	cff588e7-1092-4648-8f6d-1dfd4c6a3278	\N	Active	Lecture	Second	2025-2026	60	0	TBA	[{"endTime": "15:00", "dayOfWeek": 4, "startTime": "13:00"}]	f	2.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.078191	2025-12-15 08:24:55.331
c74d1cb3-a5f1-44de-ae02-992c9eb29dd0	DCPET 2-1	5f101b5b-bbf6-4f02-a448-d066e9e55b93	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	Assigned	Combined	Second	2025-2026	60	0	212	[{"endTime": "19:00", "dayOfWeek": 1, "startTime": "17:00"}, {"endTime": "10:30", "dayOfWeek": 4, "startTime": "07:30"}]	f	2.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.066934	2025-12-15 10:14:03.589511
f349292e-09f3-4ac5-b409-24d02af0beea	DCPET 2-3	5f101b5b-bbf6-4f02-a448-d066e9e55b93	f79ad68d-e276-4acb-9f9a-dc26a56df575	Assigned	Laboratory	Second	2025-2026	60	0	204	[{"endTime": "17:00", "dayOfWeek": 3, "startTime": "14:00"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.133904	2025-12-15 10:47:22.383764
032b0335-93db-463b-be4c-524ed19b842c	DCPET 2-3	82076eb1-258d-4c81-b862-cefe4541f77d	681ca93b-d7f4-4140-a189-77d76f6c0621	Assigned	Laboratory	Second	2025-2026	60	0	204	[{"endTime": "13:30", "dayOfWeek": 1, "startTime": "10:30"}, {"endTime": "13:30", "dayOfWeek": 4, "startTime": "10:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.13759	2025-12-15 10:49:12.094005
11ec0ca5-342c-49ee-a682-a6b4f1084fe1	DCPET 2-3	03684182-4ccf-4bb3-88e4-d9d0ab5ff83c	\N	Active	Lecture	Second	2025-2026	60	0	209	[{"endTime": "16:30", "dayOfWeek": 5, "startTime": "13:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.140656	2025-12-16 11:11:06.958185
4cb02e9f-3fbc-4394-9252-d3729867e717	DCPET 2-3	402a7351-9241-4f71-ac32-42944a29bc27	\N	Active	Lecture	Second	2025-2026	60	0	209	[{"endTime": "15:00", "dayOfWeek": 2, "startTime": "12:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.147306	2025-12-16 08:35:52.606937
c18d5a15-6e5b-4f64-ae7b-234626da819e	DCPET 1-1	be8121b8-2877-4deb-b215-ec3df77d38d5	\N	Active	Combined	Second	2025-2026	60	0		[{"endTime": "13:30", "dayOfWeek": 4, "startTime": "10:30"}, {"endTime": "12:00", "dayOfWeek": 1, "startTime": "09:00"}]	f	3.0	3.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.381616	2025-12-26 05:32:22.345683
7209f1a4-2fb0-4d92-b26f-0200de73e630	DCPET 2-2	82076eb1-258d-4c81-b862-cefe4541f77d	681ca93b-d7f4-4140-a189-77d76f6c0621	Assigned	Laboratory	Second	2025-2026	60	0	204	[{"endTime": "13:30", "dayOfWeek": 2, "startTime": "10:30"}, {"endTime": "13:30", "dayOfWeek": 5, "startTime": "10:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.105303	2025-12-15 08:46:32.08923
9dcc3e19-c7de-4278-b3ce-49e7e770f5c4	DCPET 2-1	3538ba22-33a5-4388-859e-a7bf9f3c8db6	781a823d-3e2f-4902-a402-56ab3363e762	Assigned	Laboratory	Second	2025-2026	60	0	204	[{"endTime": "16:30", "dayOfWeek": 2, "startTime": "13:30"}, {"endTime": "16:30", "dayOfWeek": 6, "startTime": "13:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.062643	2025-12-15 09:56:40.383262
59f0a002-6d12-4def-bb52-4c88a8b2e7f3	DCPET 2-3	cff588e7-1092-4648-8f6d-1dfd4c6a3278	\N	Active	Lecture	Second	2025-2026	60	0	field	[{"endTime": "18:30", "dayOfWeek": 2, "startTime": "16:30"}]	f	2.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.143997	2025-12-16 08:36:07.842513
90eba4de-331c-44c6-b9b9-f86db6bb3f99	DCPET 2-3	3538ba22-33a5-4388-859e-a7bf9f3c8db6	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	Assigned	Laboratory	Second	2025-2026	60	0	204	[{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.13028	2025-12-15 10:28:23.260256
6c5dd8b3-438d-4bd9-a1cc-1f475e52ce1e	DCPET 2-3	3538ba22-33a5-4388-859e-a7bf9f3c8db6	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	Assigned	Laboratory	Second	2025-2026	30	0	201	[{"endTime": "13:30", "dayOfWeek": 3, "startTime": "10:30"}]	f	0.0	3.0		t	2025-12-15 10:35:52.108211	2025-12-15 10:45:31.175209
b02aca5d-3153-4998-b5a2-da978c4ca680	DCPET 2-2	186afdfd-e8fa-45a8-acbe-c734e1f4f735	401ff400-4855-4d7a-93b4-39de2b6acd3a	Assigned	Combined	Second	2025-2026	60	0	213	[{"endTime": "09:00", "dayOfWeek": 1, "startTime": "07:30"}, {"endTime": "09:00", "dayOfWeek": 4, "startTime": "07:30"}, {"endTime": "18:00", "dayOfWeek": 6, "startTime": "15:00"}]	f	3.0	3.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.089801	2025-12-16 08:38:00.068947
52024a13-d7ca-4de9-8d19-ce52c50ee3ef	DC PET 3-1	40cb7f22-3883-4382-aee7-b026152a446f	bfc7543a-6184-4572-9073-52a63086312b	Assigned	Regular	Second	2025-2026	30	0		[{"endTime": "16:30", "dayOfWeek": 6, "startTime": "13:30"}]	f	0.0	0.0		t	2025-12-15 10:09:08.801059	2025-12-15 10:53:05.462223
96e903a0-100b-421f-9344-497ef1827ff1	DC PET 3-1	589aed1c-55dc-476f-9c47-304b89643863	781a823d-3e2f-4902-a402-56ab3363e762	Assigned	Regular	Second	2025-2026	30	0	field	[{"endTime": "09:00", "dayOfWeek": 2, "startTime": "07:30"}, {"endTime": "09:00", "dayOfWeek": 5, "startTime": "07:30"}]	f	0.0	0.0		t	2025-12-15 10:54:29.57193	2025-12-15 10:54:37.50021
0915d93a-5f61-4315-8c22-8b451a0ac118	DC PET 3-3	04236cc6-1cc8-45fa-8b1c-5277b89666d6	bfc7543a-6184-4572-9073-52a63086312b	Planning	Regular	Second	2025-2026	30	0	205	[{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	0.0	0.0		t	2025-12-15 11:35:00.568626	2025-12-26 05:11:36.426012
542881bd-26f9-4fc4-925d-ae882762ff51	DC PET 3-2	40cb7f22-3883-4382-aee7-b026152a446f	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	Assigned	Regular	Second	2025-2026	30	0		[{"endTime": "21:00", "dayOfWeek": 6, "startTime": "17:00"}]	f	0.0	0.0		t	2025-12-15 11:09:38.365621	2025-12-15 11:09:38.365621
5dd00207-2546-4c33-aed3-e1160a205043	DC PET 3-2	589aed1c-55dc-476f-9c47-304b89643863	401ff400-4855-4d7a-93b4-39de2b6acd3a	Assigned	Regular	Second	2025-2026	30	0	field	[{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	0.0	0.0		t	2025-12-15 11:11:54.493548	2025-12-15 11:12:03.045314
123ff965-6b3b-46ae-9e9e-a23fd083d632	DC PET 3-3	40cb7f22-3883-4382-aee7-b026152a446f	681ca93b-d7f4-4140-a189-77d76f6c0621	Assigned	Regular	Second	2025-2026	30	0		[{"endTime": "21:00", "dayOfWeek": 6, "startTime": "17:00"}]	f	0.0	0.0		t	2025-12-15 11:15:26.705974	2025-12-15 11:15:40.758308
108cca00-c4c6-4953-be24-7c863b11c77d	DC PET 3-3	589aed1c-55dc-476f-9c47-304b89643863	677387ce-78df-41af-aba9-9d010ee3f9bf	Assigned	Regular	Second	2025-2026	30	0	online	[{"endTime": "14:00", "dayOfWeek": 6, "startTime": "11:00"}]	f	0.0	0.0		t	2025-12-15 11:18:41.895005	2025-12-15 11:18:41.895005
81be8b02-cc51-4a7b-aa70-e6402180812f	DCPET 2-1	d8ef51f9-6fab-4af5-88bf-58b9a7a144a4	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	Assigned	Lecture	Second	2025-2026	60	0	205	[{"endTime": "13:30", "dayOfWeek": 5, "startTime": "10:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year	t	2025-12-15 07:03:59.041387	2025-12-16 08:33:57.162526
ecdc9ae9-87ae-455b-a425-c75987da887c	DECET 1-1	be8121b8-2877-4deb-b215-ec3df77d38d5	\N	Active	Combined	Second	2025-2026	60	0		[{"endTime": "10:30", "dayOfWeek": 1, "startTime": "07:30"}, {"endTime": "10:30", "dayOfWeek": 4, "startTime": "07:30"}]	f	3.0	3.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.029407	2025-12-26 05:32:41.824782
00d6455c-9769-4238-b8fd-54d3b627bf9b	DECET 1-1	9ac920a5-a95d-46c4-9a0f-2830ccebd73b	0b3f53cd-6504-4e29-af93-e727d98b58b0	Assigned	Regular	Second	2025-2026	30	0	200	[{"endTime": "19:30", "dayOfWeek": 5, "startTime": "16:30"}]	f	0.0	0.0		t	2025-12-15 11:48:19.31368	2025-12-16 08:41:19.279733
58c1acf3-1c3b-4618-ab5f-3a08dd17f69f	DECET 1-2	be8121b8-2877-4deb-b215-ec3df77d38d5	\N	Active	Combined	Second	2025-2026	60	0	TBA	[{"endTime": "10:30", "dayOfWeek": 1, "startTime": "07:30"}, {"endTime": "10:30", "dayOfWeek": 4, "startTime": "07:30"}]	f	3.0	3.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.072805	2025-12-15 12:05:43.683095
0b4e179e-0d66-406e-826e-6d9c821fed19	DECET 1-2	9ac920a5-a95d-46c4-9a0f-2830ccebd73b	0b3f53cd-6504-4e29-af93-e727d98b58b0	Assigned	Combined	Second	2025-2026	60	0	201	[{"endTime": "19:30", "dayOfWeek": 1, "startTime": "16:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester - 1st Year DECET	t	2025-12-15 04:16:06.047879	2025-12-15 12:08:26.969728
71a226bb-49ea-41bc-b91b-17288a417ba7	DECET 1-2	9ac920a5-a95d-46c4-9a0f-2830ccebd73b	0b3f53cd-6504-4e29-af93-e727d98b58b0	Assigned	Regular	Second	2025-2026	30	0	200	[{"endTime": "18:00", "dayOfWeek": 4, "startTime": "15:00"}]	f	0.0	0.0		t	2025-12-15 12:09:29.137796	2025-12-15 12:09:29.137796
a2bd07af-d6a6-4bc4-8ae0-709641c96701	DECET 1-2	9b31cc69-9761-4bc5-84d9-9ea2f3b6081d	d7098608-af01-4f3b-8727-9c5bda6569dc	Assigned	Regular	Second	2025-2026	30	0	201	[{"endTime": "17:00", "dayOfWeek": 6, "startTime": "15:00"}]	f	0.0	0.0		t	2025-12-15 12:11:18.022803	2025-12-15 12:11:18.022803
39c6a384-15a1-4516-990a-d56c07e753b8	DCPET 1-3	b4248701-7003-4365-9414-58b0fcce28ce	f79ad68d-e276-4acb-9f9a-dc26a56df575	Assigned	Laboratory	Second	2025-2026	60	0	204	[{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	0.0	3.0	Added for 2025-2026 Second Semester	t	2025-12-15 03:14:32.426072	2025-12-16 06:47:41.430104
7b846956-2233-4353-a26f-80227c506dc1	DECET 1-1	eb110c4f-3ed9-42b6-89be-86fb3e1777ff	0b3f53cd-6504-4e29-af93-e727d98b58b0	Assigned	Regular	Second	2025-2026	30	0	201	[{"endTime": "16:30", "dayOfWeek": 5, "startTime": "13:30"}]	f	0.0	0.0		t	2025-12-15 11:44:36.699203	2025-12-16 08:41:09.648032
bea069ef-11e4-414f-8b3b-ff2a6370f705	DCPET 2-3	5f101b5b-bbf6-4f02-a448-d066e9e55b93	f79ad68d-e276-4acb-9f9a-dc26a56df575	Assigned	Regular	Second	2025-2026	30	0	212	[{"endTime": "12:30", "dayOfWeek": 5, "startTime": "10:30"}]	f	0.0	0.0		t	2025-12-15 10:48:27.230554	2025-12-16 08:38:29.425982
d8c2d4aa-6368-4b03-b158-a92776162e55	DCPET 2-2	3538ba22-33a5-4388-859e-a7bf9f3c8db6	9fb7b4cb-d1a0-4ffb-bdc6-94474ed68b2d	Assigned	Regular	Second	2025-2026	30	0	205	[{"endTime": "19:30", "dayOfWeek": 4, "startTime": "16:30"}]	f	0.0	0.0		t	2025-12-15 09:59:06.526355	2025-12-16 08:35:14.993178
eafae04c-9e29-465d-b192-a2cfb6151f2d	DCPET 2-3	186afdfd-e8fa-45a8-acbe-c734e1f4f735	a988a353-7a8d-4643-8884-8ce7ddea676b	Active	Lecture	Second	2025-2026	30	0	213	[{"endTime": "20:30", "dayOfWeek": 4, "startTime": "17:30"}]	f	0.0	0.0		t	2025-12-15 10:41:57.534979	2025-12-16 08:36:16.833716
c56de88b-8369-451e-973c-9c5cf39febbf	DC PET 3-1	04236cc6-1cc8-45fa-8b1c-5277b89666d6	677387ce-78df-41af-aba9-9d010ee3f9bf	Assigned	Regular	Second	2025-2026	30	0	212	[{"endTime": "21:00", "dayOfWeek": 4, "startTime": "18:00"}]	f	0.0	0.0		t	2025-12-15 11:06:21.862544	2025-12-26 05:09:03.715254
d23e8d63-e142-43d5-808c-8656d1829d1b	DCPET 1-3	7e289bb8-3457-4c3d-a426-9deb394b4e76	f79ad68d-e276-4acb-9f9a-dc26a56df575	Assigned	Regular	Second	2025-2026	30	0	204	[{"endTime": "16:30", "dayOfWeek": 5, "startTime": "13:30"}]	f	0.0	0.0		t	2025-12-15 09:56:18.307076	2025-12-16 09:12:32.213108
367ad608-57e5-40e9-bcb4-dbd2cb76f5ba	DECET 2-1	2471b001-c40e-4676-aead-126f9c0ccd02	6e2c20cd-ef52-4997-96a3-4fe331dddc45	Assigned	Combined	Second	2025-2026	60	30	200	[{"endTime": "13:30", "dayOfWeek": 2, "startTime": "10:30"}, {"endTime": "16:30", "dayOfWeek": 5, "startTime": "13:30"}]	f	3.0	3.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.68071	2025-12-15 12:13:00.813036
a9f1fce1-9c98-4286-971c-8ba6bf1b98f1	DECET 2-1	b02f88b8-d420-4cff-904a-d498800c74cf	64060dc0-651f-4fa2-93d6-ff9b2b9fc3ce	Assigned	Regular	Second	2025-2026	30	0	213	[{"endTime": "10:30", "dayOfWeek": 5, "startTime": "07:30"}]	f	0.0	0.0		t	2025-12-15 12:18:24.449897	2025-12-15 12:18:24.449897
480bb56f-9f1d-41b9-bde6-ece50c827e81	DECET 2-2	b2715617-754c-4a0f-bcdd-85d11e167d9c	64060dc0-651f-4fa2-93d6-ff9b2b9fc3ce	Assigned	Combined	Second	2025-2026	60	0	2000	[{"endTime": "10:30", "dayOfWeek": 3, "startTime": "07:30"}, {"endTime": "18:00", "dayOfWeek": 6, "startTime": "15:00"}]	f	2.0	3.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.717442	2025-12-15 12:28:13.987422
06b3a86b-149d-44c1-8830-41502e12c45f	DCPET 1-3	182ca134-660c-4c11-a321-d62870e9a1a2	bfc7543a-6184-4572-9073-52a63086312b	Assigned	Regular	Second	2025-2026	30	0	204	[{"endTime": "09:00", "dayOfWeek": 1, "startTime": "07:30"}, {"endTime": "09:00", "dayOfWeek": 4, "startTime": "07:30"}]	f	0.0	0.0		t	2025-12-15 11:33:30.608585	2025-12-16 08:31:52.593282
a5e8ff6c-91da-4711-9fa5-6fabf8698ed3	DECET 3-1	2a5da3be-2ed4-4323-8b56-6f0e84dd6eb5	a988a353-7a8d-4643-8884-8ce7ddea676b	Assigned	Laboratory	Second	2025-2026	60	0	FIELD	[{"endTime": "21:00", "dayOfWeek": 5, "startTime": "18:00"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 3rd Year DECET	t	2025-12-16 08:51:17.926016	2025-12-16 08:53:02.265531
361a5140-0f74-4d78-b5e7-a48d94b43cbc	DECET 3-1	2a5da3be-2ed4-4323-8b56-6f0e84dd6eb5	d7098608-af01-4f3b-8727-9c5bda6569dc	Assigned	Regular	Second	2025-2026	30	0		[{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	0.0	0.0		t	2025-12-16 08:54:07.592115	2025-12-16 08:54:07.592115
232c0f04-eb7f-4829-ac1e-b002e8ce8383	DECET 3-1	abc8fae0-349e-47b1-8b56-591ccf6fb5c7	a988a353-7a8d-4643-8884-8ce7ddea676b	Assigned	Regular	Second	2025-2026	30	0		[{"endTime": "21:00", "dayOfWeek": 3, "startTime": "18:00"}]	f	0.0	0.0		t	2025-12-16 08:55:44.021747	2025-12-16 08:55:44.021747
0d035fad-9a16-4071-bd08-9e34db1e8d3f	DECET 3-1	abc8fae0-349e-47b1-8b56-591ccf6fb5c7	d7098608-af01-4f3b-8727-9c5bda6569dc	Assigned	Regular	Second	2025-2026	30	0		[{"endTime": "12:30", "dayOfWeek": 6, "startTime": "10:30"}]	f	0.0	0.0		t	2025-12-16 08:56:44.077998	2025-12-16 08:56:44.077998
f8cbefab-13be-4277-af69-a72db695ed2a	DECET 3-1	abc8fae0-349e-47b1-8b56-591ccf6fb5c7	d7098608-af01-4f3b-8727-9c5bda6569dc	Assigned	Combined	Second	2025-2026	60	0	FIELD	[{"endTime": "13:30", "dayOfWeek": 6, "startTime": "12:30"}]	f	1.0	6.0	Added for 2025-2026 Second Semester - 3rd Year DECET	t	2025-12-16 08:51:17.931463	2025-12-16 08:57:21.629512
91b87199-099b-4a06-a0eb-0396533355dc	DECET 3-2	2a5da3be-2ed4-4323-8b56-6f0e84dd6eb5	b4db07cb-214f-4777-96d2-eaee498773dd	Assigned	Regular	Second	2025-2026	30	0		[{"endTime": "21:00", "dayOfWeek": 5, "startTime": "18:00"}]	f	0.0	0.0		t	2025-12-16 08:58:26.503027	2025-12-16 08:58:26.503027
e06267fd-37b1-44d2-90c4-952c18a56ddc	DECET 3-2	2a5da3be-2ed4-4323-8b56-6f0e84dd6eb5	b4db07cb-214f-4777-96d2-eaee498773dd	Assigned	Laboratory	Second	2025-2026	60	0	FIELD	[{"endTime": "10:30", "dayOfWeek": 6, "startTime": "07:30"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 3rd Year DECET	t	2025-12-16 08:51:17.936171	2025-12-16 08:59:24.939913
cf6b958b-ac9a-4a37-8bf4-1ab44244a4d1	DECET 3-2	abc8fae0-349e-47b1-8b56-591ccf6fb5c7	a988a353-7a8d-4643-8884-8ce7ddea676b	Assigned	Regular	Second	2025-2026	30	0		[{"endTime": "16:30", "dayOfWeek": 6, "startTime": "14:00"}]	f	0.0	0.0		t	2025-12-16 09:00:37.121663	2025-12-16 11:20:26.630461
4bed1650-4e92-43b5-a2be-261631da796d	DECET 3-2	abc8fae0-349e-47b1-8b56-591ccf6fb5c7	a988a353-7a8d-4643-8884-8ce7ddea676b	Assigned	Combined	Second	2025-2026	60	0	FIELD	[{"endTime": "21:00", "dayOfWeek": 6, "startTime": "18:00"}]	f	1.0	6.0	Added for 2025-2026 Second Semester - 3rd Year DECET	t	2025-12-16 08:51:17.940437	2025-12-16 09:01:58.35655
287677d4-1d97-4c25-a9ca-c22602cb87cf	DECET 2-1	9042c970-d653-4cf2-be1a-634ce8fed5ab	1cbac665-ccff-4f11-b685-3050c54bb323	Assigned	Laboratory	Second	2025-2026	60	0	212	[{"endTime": "16:30", "dayOfWeek": 3, "startTime": "13:30"}, {"endTime": "20:00", "dayOfWeek": 3, "startTime": "17:00"}]	f	0.0	6.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.695901	2025-12-16 09:41:38.769018
7ab2e812-8a2c-4ba1-a448-b2b6803e8508	DECET 2-1	f81b6e2b-598c-4393-b5d0-bad69de5ee63	\N	Active	Lecture	Second	2025-2026	60	0	212	[{"endTime": "18:00", "dayOfWeek": 2, "startTime": "15:00"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.701933	2025-12-16 09:45:31.845713
375e4603-a583-4c77-807e-024555758b71	DECET 3-2	abc8fae0-349e-47b1-8b56-591ccf6fb5c7	a988a353-7a8d-4643-8884-8ce7ddea676b	Assigned	Regular	Second	2025-2026	30	0		[{"endTime": "17:30", "dayOfWeek": 6, "startTime": "16:30"}]	f	0.0	0.0		t	2025-12-16 09:01:21.809718	2025-12-16 11:20:57.368995
77d242ba-2664-4747-8dfc-4feefd9d7659	DECET 2-2	f81b6e2b-598c-4393-b5d0-bad69de5ee63	\N	Active	Lecture	Second	2025-2026	60	0	200	[{"endTime": "16:30", "dayOfWeek": 3, "startTime": "13:30"}]	f	3.0	0.0	Added for 2025-2026 Second Semester - 2nd Year DECET	t	2025-12-15 04:19:22.736108	2025-12-26 05:34:13.695624
09ec2709-c3c4-4f59-b7ec-828d6561e789	DECET 2-2	9042c970-d653-4cf2-be1a-634ce8fed5ab	b4db07cb-214f-4777-96d2-eaee498773dd	Planning	Regular	Second	2025-2026	30	0	205	[{"endTime": "18:00", "dayOfWeek": 5, "startTime": "15:00"}]	f	0.0	0.0		t	2025-12-26 05:35:37.319927	2025-12-26 05:35:37.319927
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, "firstName", "lastName", role, department, college, "isActive", "createdAt", "updatedAt") FROM stdin;
d2160588-4eac-4653-bec8-643c0e4951bd	admin@pup.edu.ph	$2a$10$dJ182wF/Al251sUdgYjUZuBSOJFJwnmGLURhvF0e5WGVqbjmiG2uq	Admin	User	Admin	IT	College of Engineering	t	2025-06-19 09:53:30.88379	2025-06-19 09:53:30.88379
9569ec5a-0fc4-4e6f-a460-f8b082427646	fcruiz@pup.edu.ph	$2a$10$VFNODUDGCzhJ/9V.yAsqE.R3tZ0Hv3.XaRqTJn0NOgEsW6Hn7or4S	Frescian C.	Ruiz	Chair	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	2025-06-19 09:53:30.890118	2025-06-19 09:53:30.890118
0e2a8540-0d1d-413b-99e6-1afc58681b34	dean.engineering@pup.edu.ph	$2a$10$a5c4vjY7EbCAuxVg/iLVpe1Or3/dG9jlI.YOqpZgpr/jNAAciIW6i	Engineering	Dean	Dean	\N	College of Engineering	t	2025-06-19 09:53:30.892835	2025-06-19 09:53:30.892835
a9830054-933e-4f71-bef8-acd31ed743d4	jbruiz@pup.edu.ph	$2a$10$gPAy5Ow07774gOQAibSlE.f/mLGREsGxaXDqqX4slu.vgdauxBqd2	Jomar B.	Ruiz	Faculty	Department Of Computer And Electronics Engineering Technology	College of Engineering	t	2025-06-19 09:53:30.895273	2025-06-19 09:53:30.895273
\.


--
-- Name: rooms PK_0368a2d7c215f2d0458a54933f2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY (id);


--
-- Name: courses PK_3f70a487cc718ad8eda4e6d58c9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY (id);


--
-- Name: faculty PK_635ca3484f9c747b6635a494ad9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.faculty
    ADD CONSTRAINT "PK_635ca3484f9c747b6635a494ad9" PRIMARY KEY (id);


--
-- Name: itees_records PK_85b6e4c3ca2ccf77d06ed00ddfb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itees_records
    ADD CONSTRAINT "PK_85b6e4c3ca2ccf77d06ed00ddfb" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: assignments PK_c54ca359535e0012b04dcbd80ee; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "PK_c54ca359535e0012b04dcbd80ee" PRIMARY KEY (id);


--
-- Name: sections PK_f9749dd3bffd880a497d007e450; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY (id);


--
-- Name: rooms UQ_368d83b661b9670e7be1bbb9cdd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT "UQ_368d83b661b9670e7be1bbb9cdd" UNIQUE (code);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: sections FK_0fc0dc8ce98e7dc47c273f85e3d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT "FK_0fc0dc8ce98e7dc47c273f85e3d" FOREIGN KEY ("courseId") REFERENCES public.courses(id);


--
-- Name: assignments FK_29b14d5bb99ac9fe8ba6c5aa728; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "FK_29b14d5bb99ac9fe8ba6c5aa728" FOREIGN KEY ("facultyId") REFERENCES public.faculty(id);


--
-- Name: itees_records FK_2c8ce129cca5c7a680e008494bd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.itees_records
    ADD CONSTRAINT "FK_2c8ce129cca5c7a680e008494bd" FOREIGN KEY ("facultyId") REFERENCES public.faculty(id);


--
-- Name: assignments FK_9e5684667ea189ade0fc79fa4f1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "FK_9e5684667ea189ade0fc79fa4f1" FOREIGN KEY ("courseId") REFERENCES public.courses(id);


--
-- Name: sections FK_d5f20ca11e0e24c02e6f6345101; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT "FK_d5f20ca11e0e24c02e6f6345101" FOREIGN KEY ("facultyId") REFERENCES public.faculty(id);


--
-- Name: assignments FK_dfb1935b711a420d68429ff7134; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT "FK_dfb1935b711a420d68429ff7134" FOREIGN KEY ("sectionId") REFERENCES public.sections(id);


--
-- PostgreSQL database dump complete
--

