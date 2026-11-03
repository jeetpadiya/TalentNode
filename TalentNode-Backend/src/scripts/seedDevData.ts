import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import UserModel from "../models/UserModel.js";
import OrganizationModel from "../models/OrganizationModel.js";
import OrganizationTeamMemberModel from "../models/OrganizationTeamMemberModel.js";
import JobsModel from "../models/JobsModel.js";
import CandidateModel from "../models/CandidateModel.js";
import JobCandidateAssignmentModel from "../models/JobCandidateAssignmentModel.js";
import CandidateApplicationModel from "../models/CandidateApplicationModel.js";
import JobCategoryModel from "../models/JobCategoryModel.js";
import MessageTemplateModel from "../models/MessageTemplateModel.js";
import ReviewTemplateModel from "../models/ReviewTemplateModel.js";
import { DEFAULT_HIRING_STAGES } from "../constants/defaultHiringStages.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DEV_EMAIL = "dev@gmail.com";
const DEV_PASSWORD = "12345678";

async function main() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured in .env");
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to MongoDB successfully!");

  // 1. Ensure dev@gmail.com user exists with password 12345678
  let devUser = await UserModel.findOne({ email: DEV_EMAIL }).select("+password");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEV_PASSWORD, salt);

  if (!devUser) {
    console.log(`Creating user ${DEV_EMAIL}...`);
    devUser = await UserModel.create({
      username: "Dev Admin",
      email: DEV_EMAIL,
      password: hashedPassword,
      role: "admin",
    });
  } else {
    console.log(`User ${DEV_EMAIL} exists. Updating password and role...`);
    devUser.password = hashedPassword;
    devUser.role = "admin";
    await devUser.save();
  }

  // 2. Ensure Organization exists
  let org = null;
  if (devUser.organizationId) {
    org = await OrganizationModel.findById(devUser.organizationId);
  }

  if (!org) {
    org = await OrganizationModel.findOne({ createdBy: devUser._id });
  }

  if (!org) {
    console.log("Creating organization for dev user...");
    org = await OrganizationModel.create({
      name: "TalentNode Technologies",
      slug: "talentnode-tech",
      description: "Cloud-native talent acquisition and engineering platform",
      website: "https://talentnode.dev",
      allowedDomains: ["talentnode.dev", "gmail.com"],
      createdBy: devUser._id,
    });
  } else {
    // Optionally update org name if it was empty/default
    if (org.name === "jeet" || !org.name) {
      org.name = "TalentNode Technologies";
      org.description = "Cloud-native talent acquisition and engineering platform";
      await org.save();
    }
  }

  // Ensure devUser has organizationId linked
  if (!devUser.organizationId || String(devUser.organizationId) !== String(org._id)) {
    devUser.organizationId = org._id as any;
    await devUser.save();
  }

  // Ensure OrganizationTeamMember record for dev user
  await OrganizationTeamMemberModel.findOneAndUpdate(
    { organizationId: org._id, userId: devUser._id },
    { organizationId: org._id, userId: devUser._id, role: "admin" },
    { upsert: true, new: true }
  );

  // 3. Create a couple of team members (Recruiter & Interviewer) for rich collaboration
  const teamUsersData = [
    { username: "Sarah Jenkins", email: "sarah.recruiter@talentnode.dev", role: "recruiter" as const },
    { username: "Alex Chen", email: "alex.techlead@talentnode.dev", role: "interviewer" as const },
  ];

  const teamMemberUserIds: mongoose.Types.ObjectId[] = [];
  for (const t of teamUsersData) {
    let tUser = await UserModel.findOne({ email: t.email });
    if (!tUser) {
      tUser = await UserModel.create({
        username: t.username,
        email: t.email,
        password: hashedPassword,
        role: t.role,
        organizationId: org._id,
      });
    } else {
      tUser.organizationId = org._id as any;
      await tUser.save();
    }
    teamMemberUserIds.push(tUser._id);

    await OrganizationTeamMemberModel.findOneAndUpdate(
      { organizationId: org._id, userId: tUser._id },
      { organizationId: org._id, userId: tUser._id, role: t.role },
      { upsert: true, new: true }
    );
  }

  // 4. Seed Job Categories
  console.log("Seeding job categories...");
  const categoriesData = [
    { name: "Engineering", order: 1 },
    { name: "Product Management", order: 2 },
    { name: "Design", order: 3 },
    { name: "Quality Assurance", order: 4 },
    { name: "Marketing", order: 5 },
  ];

  for (const cat of categoriesData) {
    await JobCategoryModel.findOneAndUpdate(
      { organizationId: org._id, name: cat.name },
      { organizationId: org._id, name: cat.name, order: cat.order },
      { upsert: true }
    );
  }

  // 5. Seed Message Templates
  console.log("Seeding message templates...");
  const messageTemplatesData = [
    {
      title: "Technical Interview Invitation",
      subject: "Invitation to Technical Interview with TalentNode",
      body: "Hi {{candidate_name}},\n\nThank you for taking the time to speak with our team. We were very impressed with your background and would love to invite you to a technical interview for the {{job_title}} role.\n\nPlease pick a time slot that works best for you: {{booking_link}}.\n\nBest regards,\nTalentNode Hiring Team",
    },
    {
      title: "Formal Job Offer",
      subject: "Offer of Employment - TalentNode",
      body: "Dear {{candidate_name}},\n\nWe are thrilled to offer you the position of {{job_title}} at TalentNode! We believe your skills and passion will be a tremendous addition to our team.\n\nPlease review the attached offer letter outlining compensation, benefits, and start date.\n\nWarm regards,\nTalentNode People Team",
    },
    {
      title: "Application Acknowledgment",
      subject: "We received your application for {{job_title}}",
      body: "Hi {{candidate_name}},\n\nThank you for applying to TalentNode for the {{job_title}} position. Our hiring team is reviewing your profile and will get back to you shortly.\n\nBest,\nTalentNode Recruiting",
    },
  ];

  for (const tmpl of messageTemplatesData) {
    await MessageTemplateModel.findOneAndUpdate(
      { organizationId: org._id, title: tmpl.title },
      { organizationId: org._id, title: tmpl.title, subject: tmpl.subject, body: tmpl.body },
      { upsert: true }
    );
  }

  // 6. Seed Review Templates
  console.log("Seeding review templates...");
  const reviewTemplatesData = [
    {
      name: "Engineering Coding & System Design",
      template: "1. Problem Solving & Algorithms (1-5):\n2. System Architecture & Scalability (1-5):\n3. Code Quality, Testing & Modularity (1-5):\n4. Cultural Alignment & Communication (1-5):\n\nKey Strengths:\nAreas for Improvement:\nHire Recommendation (Strong Hire / Hire / No Hire / Strong No Hire):",
    },
    {
      name: "Product & Behavioral Evaluation",
      template: "1. Product Sense & User Empathy (1-5):\n2. Analytical Thinking & Data Decisions (1-5):\n3. Cross-functional Leadership (1-5):\n4. Ambiguity Management & Execution (1-5):\n\nKey Strengths:\nAreas of Concern:\nOverall Recommendation:",
    },
  ];

  for (const rTmpl of reviewTemplatesData) {
    await ReviewTemplateModel.findOneAndUpdate(
      { organizationId: org._id, name: rTmpl.name },
      { organizationId: org._id, name: rTmpl.name, template: rTmpl.template },
      { upsert: true }
    );
  }

  // 7. Seed Diverse Jobs
  console.log("Seeding jobs...");
  const jobsData = [
    {
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "Bengaluru, India (Remote Available)",
      workMode: "remote" as const,
      employmentType: "full_time" as const,
      experienceLevel: "senior" as const,
      description: "Join our core product team architecting scalable microservices, low-latency APIs, and reactive interfaces using TypeScript, React, and Node.js.",
      responsibilities: [
        "Design and build performant backend microservices and modern React frontend features",
        "Lead architectural reviews and mentor junior engineering peers",
        "Collaborate closely with product management and design teams",
      ],
      requirements: [
        "5+ years software development experience with React, TypeScript, and Node.js",
        "Deep understanding of distributed systems, MongoDB, and Redis",
        "Demonstrated ability to deliver robust production-grade software",
      ],
      niceToHave: ["Experience with GraphQL and Docker/Kubernetes", "Open-source contributions"],
      skills: ["React", "TypeScript", "Node.js", "MongoDB", "Express", "TailwindCSS"],
      tags: ["Full-Stack", "High Priority", "Engineering"],
      salaryMin: 2200000,
      salaryMax: 3500000,
      currency: "INR",
      openings: 2,
      status: "open" as const,
      isPublished: true,
      publishedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Frontend React Developer",
      department: "Engineering",
      location: "Bengaluru / Pune, India",
      workMode: "hybrid" as const,
      employmentType: "full_time" as const,
      experienceLevel: "mid" as const,
      description: "Build clean, accessible, and delightful interactive user experiences for TalentNode's next-gen recruitment workflow suite.",
      responsibilities: [
        "Develop interactive UI components using React 18+, TypeScript, and TailwindCSS",
        "Optimize Web Vitals, page load performance, and client-side caching",
        "Participate in design systems development and code reviews",
      ],
      requirements: [
        "3+ years experience building complex Single Page Applications in React",
        "Strong CSS3, Tailwind, and component-driven architecture skills",
        "Solid state management fundamentals with Zustand or Redux Toolkit",
      ],
      niceToHave: ["Next.js App Router experience", "Framer Motion animations"],
      skills: ["React", "TypeScript", "TailwindCSS", "Zustand", "Vite", "HTML5"],
      tags: ["Frontend", "Immediate", "Engineering"],
      salaryMin: 1400000,
      salaryMax: 2200000,
      currency: "INR",
      openings: 3,
      status: "open" as const,
      isPublished: true,
      publishedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Backend Node.js & API Engineer",
      department: "Engineering",
      location: "Hyderabad, India (Remote)",
      workMode: "remote" as const,
      employmentType: "full_time" as const,
      experienceLevel: "senior" as const,
      description: "Design and scale the core REST and WebSocket services driving candidate pipelines, async worker queues, and event analytics.",
      responsibilities: [
        "Build reliable, secure REST APIs with Node.js, Express, and Mongoose",
        "Architect caching, rate limiting, and background processing pipelines",
        "Ensure data security, multi-tenancy isolation, and compliance",
      ],
      requirements: [
        "4+ years backend engineering experience in Node.js / TypeScript",
        "Hands-on expertise with MongoDB aggregation pipelines, indexing, and performance tuning",
        "Solid grasp of authentication (JWT, OAuth2, RBAC)",
      ],
      niceToHave: ["Kafka or RabbitMQ experience", "AWS / GCP infrastructure knowhow"],
      skills: ["Node.js", "Express", "TypeScript", "MongoDB", "Mongoose", "REST APIs"],
      tags: ["Backend", "Core Platform", "Engineering"],
      salaryMin: 2000000,
      salaryMax: 3200000,
      currency: "INR",
      openings: 2,
      status: "open" as const,
      isPublished: true,
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Lead Cloud & DevOps Architect",
      department: "Engineering",
      location: "Remote, India",
      workMode: "remote" as const,
      employmentType: "full_time" as const,
      experienceLevel: "lead" as const,
      description: "Lead our cloud infrastructure modernization, CI/CD automation, Kubernetes clusters, and observability stacks.",
      responsibilities: [
        "Maintain production AWS infrastructure using Terraform and Ansible",
        "Implement zero-downtime deployment pipelines and canary deployments",
        "Drive observability with Prometheus, Grafana, and OpenTelemetry",
      ],
      requirements: [
        "7+ years DevOps / SRE experience supporting 24/7 web applications",
        "Strong experience with Kubernetes, Docker, Helm, and GitHub Actions",
        "Proficiency in shell scripting and infrastructure as code (Terraform)",
      ],
      niceToHave: ["AWS Certified Solutions Architect", "FinOps optimization experience"],
      skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux"],
      tags: ["DevOps", "Infrastructure", "Lead"],
      salaryMin: 2800000,
      salaryMax: 4200000,
      currency: "INR",
      openings: 1,
      status: "open" as const,
      isPublished: true,
      publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    },
    {
      title: "UI/UX Product Designer",
      department: "Design",
      location: "Bengaluru, India",
      workMode: "hybrid" as const,
      employmentType: "full_time" as const,
      experienceLevel: "mid" as const,
      description: "Craft intuitive, human-centered interfaces for our complex recruitment workflow, kanban boards, and analytics dashboards.",
      responsibilities: [
        "Design end-to-end user journeys, wireframes, prototypes, and high-fidelity mockups in Figma",
        "Conduct usability testing and iterate based on customer feedback",
        "Collaborate with developers to ensure pixel-perfect design implementation",
      ],
      requirements: [
        "3+ years experience in B2B SaaS product design",
        "Mastery of Figma, component libraries, and interactive prototyping",
        "Strong portfolio showcasing user research, problem framing, and polished visuals",
      ],
      niceToHave: ["Basic HTML/CSS understanding", "Experience designing data visualization dashboards"],
      skills: ["Figma", "User Research", "Prototyping", "Design Systems", "UI/UX"],
      tags: ["Design", "Product", "Creative"],
      salaryMin: 1500000,
      salaryMax: 2400000,
      currency: "INR",
      openings: 1,
      status: "open" as const,
      isPublished: true,
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Technical Product Manager",
      department: "Product Management",
      location: "Bengaluru, India",
      workMode: "onsite" as const,
      employmentType: "full_time" as const,
      experienceLevel: "senior" as const,
      description: "Define product vision, roadmaps, and execution specs for TalentNode's enterprise ATS features and AI integrations.",
      responsibilities: [
        "Own product strategy and backlog prioritization for recruitment pipeline tools",
        "Work closely with engineering leads and customer success to define PRDs",
        "Track core feature adoption, conversion metrics, and NPS",
      ],
      requirements: [
        "4+ years technical product management experience in SaaS/B2B products",
        "Demonstrated ability to synthesize technical requirements into user stories",
        "Strong analytical rigor and experience with product analytics platforms",
      ],
      niceToHave: ["Computer Science or Engineering degree", "Prior ATS / HRTech experience"],
      skills: ["Product Strategy", "Roadmapping", "Agile", "User Stories", "Analytics"],
      tags: ["Product", "Strategy", "Leadership"],
      salaryMin: 2200000,
      salaryMax: 3400000,
      currency: "INR",
      openings: 1,
      status: "open" as const,
      isPublished: true,
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
    },
    {
      title: "QA Automation Engineer",
      department: "Quality Assurance",
      location: "Remote, India",
      workMode: "remote" as const,
      employmentType: "contract" as const,
      experienceLevel: "junior" as const,
      description: "Build robust end-to-end automated test suites using Playwright, Cypress, and Jest to safeguard product quality across all releases.",
      responsibilities: [
        "Develop automated UI and API test regression suites",
        "Integrate automated test runs into GitHub Actions CI workflows",
        "File concise defect reports and verify bug fixes",
      ],
      requirements: [
        "2+ years experience in automated testing with JavaScript / TypeScript",
        "Working knowledge of Playwright, Jest, and Postman API testing",
        "Familiarity with Git and CI/CD pipelines",
      ],
      niceToHave: ["Performance and load testing experience with k6"],
      skills: ["Playwright", "Jest", "TypeScript", "Cypress", "API Testing"],
      tags: ["QA", "Automation", "Contract"],
      salaryMin: 800000,
      salaryMax: 1400000,
      currency: "INR",
      openings: 2,
      status: "open" as const,
      isPublished: true,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Growth Marketing Specialist",
      department: "Marketing",
      location: "Mumbai, India",
      workMode: "hybrid" as const,
      employmentType: "full_time" as const,
      experienceLevel: "mid" as const,
      description: "Scale organic and paid inbound acquisition channels to bring high-growth tech companies onto the TalentNode platform.",
      responsibilities: [
        "Manage SEO, content marketing, and inbound campaign funnels",
        "Experiment with LinkedIn ad campaigns and developer community outreach",
      ],
      requirements: [
        "3+ years growth marketing experience in B2B SaaS",
        "Proficiency with Google Analytics, HubSpot, and SEMrush",
      ],
      niceToHave: ["Copywriting and webinar hosting experience"],
      skills: ["SEO", "Growth Marketing", "B2B SaaS", "Content Strategy"],
      tags: ["Marketing", "Draft"],
      salaryMin: 1200000,
      salaryMax: 1800000,
      currency: "INR",
      openings: 1,
      status: "draft" as const,
      isPublished: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ];

  const createdJobs: any[] = [];
  for (const jobData of jobsData) {
    let existingJob = await JobsModel.findOne({
      organizationId: org._id,
      title: jobData.title,
    });

    // Generate embedded stages with unique ObjectIds
    const hiringStagesWithIds = DEFAULT_HIRING_STAGES.map((s) => ({
      _id: new mongoose.Types.ObjectId(),
      name: s.name,
      order: s.order,
    }));

    if (!existingJob) {
      existingJob = await JobsModel.create({
        ...jobData,
        organizationId: org._id,
        createdBy: devUser._id,
        hiringStages: hiringStagesWithIds,
      });
      console.log(`Created job: ${existingJob.title} (${existingJob._id})`);
    } else {
      console.log(`Job already exists: ${existingJob.title} (${existingJob._id})`);
      if (!existingJob.hiringStages || existingJob.hiringStages.length === 0) {
        existingJob.hiringStages = hiringStagesWithIds as any;
        await existingJob.save();
      }
    }
    createdJobs.push(existingJob);
  }

  // 8. Seed 35 Realistic Candidates
  console.log("Seeding 35+ realistic candidates...");

  const rawCandidates = [
    {
      name: "Aarav Sharma",
      email: "aarav.sharma@gmail.com",
      phone: "+91 98201 11201",
      experience: 6,
      currentCompany: "Razorpay",
      currentRole: "Senior Software Engineer",
      skills: ["React", "TypeScript", "Node.js", "Docker", "MongoDB"],
      source: "LinkedIn",
      tags: ["Top Candidate", "High Priority", "Immediate Joiner"],
      notes: "Exceptional system design skills. Built payment checkout SDKs with 99.99% uptime.",
      jobIndex: 0, // Senior Full-Stack Engineer
      stageName: "Interview",
      assignmentStatus: "active",
      daysAgo: 14,
    },
    {
      name: "Priya Patel",
      email: "priya.patel@gmail.com",
      phone: "+91 98450 22302",
      experience: 5,
      currentCompany: "Swiggy",
      currentRole: "Full Stack Developer",
      skills: ["React", "Node.js", "Redis", "TypeScript", "PostgreSQL"],
      source: "Referral",
      tags: ["Strong Culture Fit", "Backend Heavy"],
      notes: "Referred by Alex. Solid experience in high-concurrency order tracking systems.",
      jobIndex: 0,
      stageName: "Offer",
      assignmentStatus: "active",
      daysAgo: 21,
    },
    {
      name: "Rohan Mehta",
      email: "rohan.mehta@yahoo.com",
      phone: "+91 97110 33403",
      experience: 7,
      currentCompany: "Infosys",
      currentRole: "Lead Developer",
      skills: ["Java", "Spring Boot", "React", "AWS", "Microservices"],
      source: "Naukri",
      tags: ["Enterprise Experience", "Notice 60 Days"],
      notes: "Strong enterprise architectural foundations. Notice period negotiable to 30 days.",
      jobIndex: 0,
      stageName: "Screening",
      assignmentStatus: "active",
      daysAgo: 8,
    },
    {
      name: "Ananya Iyer",
      email: "ananya.iyer@outlook.com",
      phone: "+91 98840 44504",
      experience: 4,
      currentCompany: "Flipkart",
      currentRole: "Software Engineer II",
      skills: ["TypeScript", "React", "Node.js", "GraphQL", "TailwindCSS"],
      source: "Website",
      tags: ["Top Performer", "Ex-Unicorn"],
      notes: "Clear and structured communicator. Passed coding assessment with top marks.",
      jobIndex: 0,
      stageName: "Hired",
      assignmentStatus: "hired",
      daysAgo: 26,
    },
    {
      name: "Vikram Malhotra",
      email: "vikram.malhotra@gmail.com",
      phone: "+91 98190 55605",
      experience: 8,
      currentCompany: "Wipro",
      currentRole: "Senior Tech Lead",
      skills: ["Node.js", "React", "MongoDB", "Distributed Systems"],
      source: "LinkedIn",
      tags: ["Senior Lead"],
      notes: "Expected compensation outside current budget bands for this bracket.",
      jobIndex: 0,
      stageName: "Rejected",
      assignmentStatus: "rejected",
      rejectionReason: "Salary expectations outside budget band",
      daysAgo: 16,
    },
    {
      name: "Sneha Rao",
      email: "sneha.rao@gmail.com",
      phone: "+91 99001 66706",
      experience: 5,
      currentCompany: "Zomato",
      currentRole: "SDE-2",
      skills: ["React", "Next.js", "TypeScript", "TailwindCSS", "Redux"],
      source: "LinkedIn",
      tags: ["Frontend Wizard", "Fast Learner"],
      notes: "Built restaurant dashboard revamp. Enthusiastic about design systems.",
      jobIndex: 1, // Frontend React Developer
      stageName: "Interview",
      assignmentStatus: "active",
      daysAgo: 11,
    },
    {
      name: "Aditya Kulkarni",
      email: "aditya.kulkarni@gmail.com",
      phone: "+91 97654 77807",
      experience: 3,
      currentCompany: "Persistent Systems",
      currentRole: "Software Engineer",
      skills: ["React", "JavaScript", "HTML5", "CSS3", "Zustand"],
      source: "Naukri",
      tags: ["Mid Level", "Pune Based"],
      notes: "Solid frontend fundamentals, answers questions methodically.",
      jobIndex: 1,
      stageName: "Screening",
      assignmentStatus: "active",
      daysAgo: 6,
    },
    {
      name: "Kavya Nair",
      email: "kavya.nair@hotmail.com",
      phone: "+91 98470 88908",
      experience: 4,
      currentCompany: "Freshworks",
      currentRole: "Frontend Engineer",
      skills: ["React", "TypeScript", "Jest", "TailwindCSS", "Webpack"],
      source: "Website",
      tags: ["Strong Testing", "Clean Code"],
      notes: "Has built end-to-end automated UI tests alongside components.",
      jobIndex: 1,
      stageName: "Offer",
      assignmentStatus: "active",
      daysAgo: 19,
    },
    {
      name: "Siddharth Verma",
      email: "siddharth.verma@gmail.com",
      phone: "+91 98111 99009",
      experience: 3,
      currentCompany: "TCS",
      currentRole: "Systems Engineer",
      skills: ["React", "JavaScript", "Bootstrap", "Git"],
      source: "Naukri",
      tags: ["Notice 90 Days"],
      notes: "Good candidate, currently exploring if notice period can be bought out.",
      jobIndex: 1,
      stageName: "Applied",
      assignmentStatus: "active",
      daysAgo: 3,
    },
    {
      name: "Tanvi Joshi",
      email: "tanvi.joshi@gmail.com",
      phone: "+91 98222 10110",
      experience: 4,
      currentCompany: "BrowserStack",
      currentRole: "UI Engineer",
      skills: ["React", "TypeScript", "CSS Modules", "Performance Optimization"],
      source: "Referral",
      tags: ["Immediate Joiner", "Top Pick"],
      notes: "Already cleared technical round with Sarah and Alex.",
      jobIndex: 1,
      stageName: "Interview",
      assignmentStatus: "active",
      daysAgo: 13,
    },
    {
      name: "Arjun Reddy",
      email: "arjun.reddy@gmail.com",
      phone: "+91 98490 12121",
      experience: 2,
      currentCompany: "Startup",
      currentRole: "Junior React Dev",
      skills: ["React", "JavaScript", "HTML", "CSS"],
      source: "Other",
      tags: ["Junior"],
      notes: "Lacks required depth in TypeScript and state management patterns for this role.",
      jobIndex: 1,
      stageName: "Rejected",
      assignmentStatus: "rejected",
      rejectionReason: "Needs more production experience with TypeScript and state architectures",
      daysAgo: 18,
    },
    {
      name: "Meera Krishnan",
      email: "meera.krishnan@gmail.com",
      phone: "+91 98845 13131",
      experience: 4,
      currentCompany: "Chargebee",
      currentRole: "Frontend Developer",
      skills: ["React", "TypeScript", "Storybook", "TailwindCSS"],
      source: "LinkedIn",
      tags: ["Design System", "Product Mindset"],
      notes: "Maintained component library across 4 squad teams at Chargebee.",
      jobIndex: 1,
      stageName: "Hired",
      assignmentStatus: "hired",
      daysAgo: 24,
    },
    {
      name: "Kabir Sen",
      email: "kabir.sen@gmail.com",
      phone: "+91 98300 14141",
      experience: 6,
      currentCompany: "PhonePe",
      currentRole: "Senior Backend Engineer",
      skills: ["Node.js", "Express", "MongoDB", "Redis", "Kafka", "TypeScript"],
      source: "LinkedIn",
      tags: ["High Throughput", "Ex-Fintech"],
      notes: "Experienced handling 50k requests/second with distributed Redis locks.",
      jobIndex: 2, // Backend Node.js & API Engineer
      stageName: "Interview",
      assignmentStatus: "active",
      daysAgo: 10,
    },
    {
      name: "Divya Kapoor",
      email: "divya.kapoor@gmail.com",
      phone: "+91 98188 15151",
      experience: 5,
      currentCompany: "Paytm",
      currentRole: "Backend Engineer",
      skills: ["Node.js", "MongoDB", "Express", "Microservices", "Docker"],
      source: "Referral",
      tags: ["Immediate Joiner", "Database Expert"],
      notes: "Deep expertise in MongoDB aggregation pipelines and compound indexing strategies.",
      jobIndex: 2,
      stageName: "Offer",
      assignmentStatus: "active",
      daysAgo: 15,
    },
    {
      name: "Varun Chopra",
      email: "varun.chopra@gmail.com",
      phone: "+91 98105 16161",
      experience: 4,
      currentCompany: "Cognizant",
      currentRole: "Associate",
      skills: ["Node.js", "SQL", "Express", "REST APIs"],
      source: "Naukri",
      tags: ["Backend"],
      notes: "Resume screened and passed. Scheduled for initial discussion.",
      jobIndex: 2,
      stageName: "Screening",
      assignmentStatus: "active",
      daysAgo: 5,
    },
    {
      name: "Ishita Bose",
      email: "ishita.bose@gmail.com",
      phone: "+91 98311 17171",
      experience: 6,
      currentCompany: "Ola Cabs",
      currentRole: "SDE-2 Backend",
      skills: ["Node.js", "TypeScript", "RabbitMQ", "Mongoose", "AWS"],
      source: "LinkedIn",
      tags: ["System Design Star"],
      notes: "Aced the concurrency and queue design exercise.",
      jobIndex: 2,
      stageName: "Hired",
      assignmentStatus: "hired",
      daysAgo: 27,
    },
    {
      name: "Nikhil Pillai",
      email: "nikhil.pillai@gmail.com",
      phone: "+91 98460 18181",
      experience: 3,
      currentCompany: "Capgemini",
      currentRole: "Software Engineer",
      skills: ["Node.js", "Express", "MySQL", "JavaScript"],
      source: "Website",
      tags: ["Junior Backend"],
      notes: "Application received via career page. Profile under review.",
      jobIndex: 2,
      stageName: "Applied",
      assignmentStatus: "active",
      daysAgo: 2,
    },
    {
      name: "Riya Sengupta",
      email: "riya.sengupta@gmail.com",
      phone: "+91 98305 19191",
      experience: 5,
      currentCompany: "HCL Tech",
      currentRole: "Lead Engineer",
      skills: ["Node.js", "Express", "NoSQL", "Docker"],
      source: "Naukri",
      tags: ["Notice 30 Days"],
      notes: "Candidate declined second round due to location preference.",
      jobIndex: 2,
      stageName: "Rejected",
      assignmentStatus: "rejected",
      rejectionReason: "Candidate withdrew due to personal location constraints",
      daysAgo: 12,
    },
    {
      name: "Amitabh Das",
      email: "amitabh.das@gmail.com",
      phone: "+91 98322 20202",
      experience: 9,
      currentCompany: "Oracle",
      currentRole: "Principal Cloud Engineer",
      skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Docker", "Prometheus"],
      source: "LinkedIn",
      tags: ["DevOps Lead", "AWS Certified"],
      notes: "Deep architectural background in multi-region Kubernetes deployments.",
      jobIndex: 3, // Lead Cloud & DevOps Architect
      stageName: "Interview",
      assignmentStatus: "active",
      daysAgo: 12,
    },
    {
      name: "Simran Kaur",
      email: "simran.kaur@gmail.com",
      phone: "+91 98144 21212",
      experience: 7,
      currentCompany: "InMobi",
      currentRole: "Senior DevOps Specialist",
      skills: ["Kubernetes", "Helm", "Terraform", "GitHub Actions", "GCP"],
      source: "Referral",
      tags: ["Top Tier", "SRE"],
      notes: "Great cultural alignment. Led automated canary deployments at InMobi.",
      jobIndex: 3,
      stageName: "Screening",
      assignmentStatus: "active",
      daysAgo: 7,
    },
    {
      name: "Harsh Vardhan",
      email: "harsh.vardhan@gmail.com",
      phone: "+91 98119 22323",
      experience: 8,
      currentCompany: "Cisco",
      currentRole: "DevOps Architect",
      skills: ["AWS", "Terraform", "Ansible", "Linux", "Python"],
      source: "Naukri",
      tags: ["Infrastructure Lead"],
      notes: "Reviewed application. Ready for hiring manager review.",
      jobIndex: 3,
      stageName: "Applied",
      assignmentStatus: "active",
      daysAgo: 4,
    },
    {
      name: "Swati Mishra",
      email: "swati.mishra@gmail.com",
      phone: "+91 98210 23434",
      experience: 6,
      currentCompany: "Delhivery",
      currentRole: "Infrastructure Engineer",
      skills: ["Kubernetes", "Docker", "AWS", "Bash", "Datadog"],
      source: "Website",
      tags: ["FinOps", "Monitoring"],
      notes: "Saved 35% on annual AWS spend through spot instances and automated sizing.",
      jobIndex: 3,
      stageName: "Screening",
      assignmentStatus: "active",
      daysAgo: 9,
    },
    {
      name: "Karthik Raja",
      email: "karthik.raja@gmail.com",
      phone: "+91 98411 24545",
      experience: 5,
      currentCompany: "Cred",
      currentRole: "Product Designer",
      skills: ["Figma", "Design Systems", "Prototyping", "User Research", "UI/UX"],
      source: "LinkedIn",
      tags: ["Visual Polish", "Fintech Design"],
      notes: "Stunning portfolio with deep micro-interaction attention to detail.",
      jobIndex: 4, // UI/UX Product Designer
      stageName: "Interview",
      assignmentStatus: "active",
      daysAgo: 9,
    },
    {
      name: "Shreya Ghoshal",
      email: "shreya.ghoshal.design@gmail.com",
      phone: "+91 98205 25656",
      experience: 4,
      currentCompany: "Postman",
      currentRole: "UX Designer",
      skills: ["Figma", "User Journey Mapping", "Information Architecture", "Design Systems"],
      source: "Website",
      tags: ["B2B SaaS", "User Centered"],
      notes: "Led the API documentation visual refresh at Postman.",
      jobIndex: 4,
      stageName: "Screening",
      assignmentStatus: "active",
      daysAgo: 5,
    },
    {
      name: "Tarun Khanna",
      email: "tarun.khanna@gmail.com",
      phone: "+91 98100 26767",
      experience: 6,
      currentCompany: "Dunzo",
      currentRole: "Lead Designer",
      skills: ["Figma", "Design Strategy", "Microcopy", "Wireframing"],
      source: "Referral",
      tags: ["High Empathy", "Fast Prototyper"],
      notes: "Completed design take-home assignment with high fidelity interactive Figma links.",
      jobIndex: 4,
      stageName: "Interview",
      assignmentStatus: "active",
      daysAgo: 14,
    },
    {
      name: "Bhavna Chawla",
      email: "bhavna.chawla@gmail.com",
      phone: "+91 98115 27878",
      experience: 3,
      currentCompany: "Agency",
      currentRole: "UI Designer",
      skills: ["Figma", "Graphic Design", "Illustrator"],
      source: "Other",
      tags: ["Agency Background"],
      notes: "Strong visual flair, needs more exposure to complex B2B workflow ergonomics.",
      jobIndex: 4,
      stageName: "Applied",
      assignmentStatus: "active",
      daysAgo: 1,
    },
    {
      name: "Deepak Chopra",
      email: "deepak.chopra@gmail.com",
      phone: "+91 98180 28989",
      experience: 6,
      currentCompany: "Cars24",
      currentRole: "Senior Product Manager",
      skills: ["Product Strategy", "PRDs", "A/B Testing", "Agile", "SQL", "Mixpanel"],
      source: "LinkedIn",
      tags: ["Data Driven", "High Ownership"],
      notes: "Great track record launching checkout funnel optimizations increasing GMV by 18%.",
      jobIndex: 5, // Technical Product Manager
      stageName: "Interview",
      assignmentStatus: "active",
      daysAgo: 13,
    },
    {
      name: "Alok Nath",
      email: "alok.nath@gmail.com",
      phone: "+91 98220 29090",
      experience: 5,
      currentCompany: "Jio",
      currentRole: "Product Manager",
      skills: ["Roadmapping", "Scrum", "User Feedback", "Technical PRDs"],
      source: "Naukri",
      tags: ["Platform PM"],
      notes: "Experience coordinating with large engineering teams of 20+ devs.",
      jobIndex: 5,
      stageName: "Screening",
      assignmentStatus: "active",
      daysAgo: 6,
    },
    {
      name: "Zoya Akhtar",
      email: "zoya.akhtar.pm@gmail.com",
      phone: "+91 98200 30101",
      experience: 4,
      currentCompany: "Urban Company",
      currentRole: "Product Manager",
      skills: ["Product Analytics", "Customer Discovery", "Wireframing", "Growth"],
      source: "Referral",
      tags: ["High Velocity", "Ex-Startup Founder"],
      notes: "Brings entrepreneurial mindset and rapid experimentation capabilities.",
      jobIndex: 5,
      stageName: "Applied",
      assignmentStatus: "active",
      daysAgo: 2,
    },
    {
      name: "Gaurav Gera",
      email: "gaurav.gera@gmail.com",
      phone: "+91 98199 31212",
      experience: 3,
      currentCompany: "Mindtree",
      currentRole: "QA Automation Engineer",
      skills: ["Playwright", "Jest", "TypeScript", "Postman", "CI/CD"],
      source: "Naukri",
      tags: ["Automation Heavy", "Immediate Joiner"],
      notes: "Built automated regression suites covering over 400 test cases.",
      jobIndex: 6, // QA Automation Engineer
      stageName: "Interview",
      assignmentStatus: "active",
      daysAgo: 8,
    },
    {
      name: "Manish Pandey",
      email: "manish.pandey@gmail.com",
      phone: "+91 98333 32323",
      experience: 2,
      currentCompany: "L&T Infotech",
      currentRole: "Quality Analyst",
      skills: ["Selenium", "JavaScript", "Manual Testing", "Jira"],
      source: "Website",
      tags: ["Junior QA"],
      notes: "Good grasp of edge-case discovery and exploratory testing.",
      jobIndex: 6,
      stageName: "Applied",
      assignmentStatus: "active",
      daysAgo: 3,
    },
    {
      name: "Pooja Hegde",
      email: "pooja.hegde@gmail.com",
      phone: "+91 98455 33434",
      experience: 4,
      currentCompany: "Zoho",
      currentRole: "Software Engineer",
      skills: ["React", "TypeScript", "Node.js", "Zustand", "PostgreSQL"],
      source: "LinkedIn",
      tags: ["Full Stack", "Clean Architect"],
      notes: "Great problem-solving skills shown in take-home exercise.",
      jobIndex: 0,
      stageName: "Applied",
      assignmentStatus: "active",
      daysAgo: 1,
    },
    {
      name: "Rahul Deshmukh",
      email: "rahul.deshmukh@gmail.com",
      phone: "+91 98230 34545",
      experience: 5,
      currentCompany: "Persistent",
      currentRole: "Senior Frontend Dev",
      skills: ["React", "JavaScript", "HTML5", "CSS3", "Webpack"],
      source: "Naukri",
      tags: ["Frontend"],
      notes: "Underwent screening interview with recruiter.",
      jobIndex: 1,
      stageName: "Screening",
      assignmentStatus: "active",
      daysAgo: 7,
    },
    {
      name: "Deepa Nair",
      email: "deepa.nair@gmail.com",
      phone: "+91 98466 35656",
      experience: 4,
      currentCompany: "Infosys",
      currentRole: "Cloud Engineer",
      skills: ["AWS", "Docker", "Terraform", "Linux"],
      source: "Website",
      tags: ["Cloud", "DevOps"],
      notes: "Resume matches Cloud Engineer requirements.",
      jobIndex: 3,
      stageName: "Applied",
      assignmentStatus: "active",
      daysAgo: 2,
    },
    {
      name: "Anil Kapoor",
      email: "anil.kapoor.qa@gmail.com",
      phone: "+91 98110 36767",
      experience: 3,
      currentCompany: "Wipro",
      currentRole: "QA Analyst",
      skills: ["Playwright", "Cypress", "JavaScript", "Git"],
      source: "Referral",
      tags: ["QA Automation"],
      notes: "Referred by dev team member. Demonstrated live Playwright test scripts.",
      jobIndex: 6,
      stageName: "Screening",
      assignmentStatus: "active",
      daysAgo: 4,
    },
  ];

  let candidatesCreatedCount = 0;
  let assignmentsCreatedCount = 0;
  let applicationsCreatedCount = 0;

  for (const cData of rawCandidates) {
    const job = createdJobs[cData.jobIndex];
    if (!job) continue;

    // Find stage on the job
    const stage = job.hiringStages.find((s: any) => s.name.toLowerCase() === cData.stageName.toLowerCase()) || job.hiringStages[0];

    // Upsert Candidate
    let candidate = await CandidateModel.findOne({
      organizationId: org._id,
      email: cData.email.toLowerCase(),
    });

    const candidateCreatedAt = new Date(Date.now() - cData.daysAgo * 24 * 60 * 60 * 1000);

    if (!candidate) {
      candidate = await CandidateModel.create({
        name: cData.name,
        email: cData.email.toLowerCase(),
        phone: cData.phone,
        organizationId: org._id,
        skills: cData.skills,
        experience: cData.experience,
        currentCompany: cData.currentCompany,
        currentRole: cData.currentRole,
        links: [
          { platform: "LinkedIn", url: `https://linkedin.com/in/${cData.email.split("@")[0]}` },
          { platform: "GitHub", url: `https://github.com/${cData.email.split("@")[0]}` },
        ],
        tags: cData.tags,
        source: cData.source,
        resume: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        notes: cData.notes,
        createdAt: candidateCreatedAt,
        updatedAt: candidateCreatedAt,
      });
      candidatesCreatedCount++;
    }

    // Upsert JobCandidateAssignment
    let assignment = await JobCandidateAssignmentModel.findOne({
      jobId: job._id,
      candidateId: candidate._id,
    });

    const assignmentUpdatedAt = new Date(
      candidateCreatedAt.getTime() + (cData.stageName === "Hired" ? 10 : 3) * 24 * 60 * 60 * 1000
    );

    if (!assignment) {
      assignment = await JobCandidateAssignmentModel.create({
        organizationId: org._id,
        jobId: job._id,
        candidateId: candidate._id,
        hiringStageId: stage._id,
        status: cData.assignmentStatus,
        rejectionReason: (cData as any).rejectionReason,
        createdAt: candidateCreatedAt,
        updatedAt: assignmentUpdatedAt,
      });
      assignmentsCreatedCount++;
    } else {
      assignment.hiringStageId = stage._id;
      assignment.status = cData.assignmentStatus as any;
      if ((cData as any).rejectionReason) {
        assignment.rejectionReason = (cData as any).rejectionReason;
      }
      await assignment.save();
    }

    // Upsert CandidateApplication
    let application = await CandidateApplicationModel.findOne({
      applicationId: assignment._id,
    });

    const sampleComments = [
      {
        text: `Initial profile review complete. High match with ${job.title} job specifications.`,
        createdBy: devUser._id,
        createdAt: new Date(candidateCreatedAt.getTime() + 1 * 60 * 60 * 1000),
      },
    ];

    if (["Screening", "Interview", "Offer", "Hired"].includes(cData.stageName)) {
      sampleComments.push({
        text: `Phone screening completed with candidate. Verified experience at ${cData.currentCompany}. Highly articulate and technically competent.`,
        createdBy: devUser._id,
        createdAt: new Date(candidateCreatedAt.getTime() + 24 * 60 * 60 * 1000),
      });
    }

    if (["Interview", "Offer", "Hired"].includes(cData.stageName)) {
      sampleComments.push({
        text: `Round 2 technical architecture interview completed. Candidate solved coding & system design challenges with clean modular abstractions.`,
        createdBy: teamMemberUserIds[1] || devUser._id,
        createdAt: new Date(candidateCreatedAt.getTime() + 48 * 60 * 60 * 1000),
      });
    }

    const sampleNotes = [
      {
        text: `Candidate requested hybrid flexibility. Current notice period is ${cData.experience > 5 ? "60 days" : "30 days"}. Salary expectations aligned with budget.`,
        createdBy: devUser._id,
        createdAt: new Date(candidateCreatedAt.getTime() + 2 * 60 * 60 * 1000),
      },
    ];

    const sampleEmails = [];
    if (["Interview", "Offer", "Hired"].includes(cData.stageName)) {
      sampleEmails.push({
        subject: `Interview Invitation - ${job.title}`,
        body: `Hi ${cData.name},\n\nWe are excited to invite you to the interview round for ${job.title}.\n\nBest,\nTalentNode Team`,
        sentBy: devUser._id,
        createdAt: new Date(candidateCreatedAt.getTime() + 12 * 60 * 60 * 1000),
      });
    }

    if (["Offer", "Hired"].includes(cData.stageName)) {
      sampleEmails.push({
        subject: `Offer Letter - ${job.title}`,
        body: `Hi ${cData.name},\n\nWe are delighted to extend a formal job offer to join our engineering organization at TalentNode!\n\nWarm regards,\nTalentNode People Team`,
        sentBy: devUser._id,
        createdAt: new Date(candidateCreatedAt.getTime() + 96 * 60 * 60 * 1000),
      });
    }

    const reviewRequests = [];
    if (["Interview"].includes(cData.stageName)) {
      reviewRequests.push({
        assigneeUserId: teamMemberUserIds[1] || devUser._id,
        requestedBy: devUser._id,
        message: "Please evaluate technical depth, system scalability design, and code structure.",
        status: "pending",
        createdAt: new Date(candidateCreatedAt.getTime() + 30 * 60 * 60 * 1000),
      });
    }

    if (!application) {
      application = await CandidateApplicationModel.create({
        applicationId: assignment._id,
        jobId: job._id,
        candidateId: candidate._id,
        organizationId: org._id,
        comments: sampleComments,
        PrivateNote: sampleNotes,
        emails: sampleEmails,
        reviewRequests: reviewRequests,
        createdAt: candidateCreatedAt,
        updatedAt: assignmentUpdatedAt,
      });
      applicationsCreatedCount++;
    }
  }

  console.log("\n=================================");
  console.log("🎉 SEEDING COMPLETE!");
  console.log(`Organization: ${org.name} (slug: ${org.slug}, id: ${org._id})`);
  console.log(`User: ${devUser.email} (role: ${devUser.role}, id: ${devUser._id})`);
  console.log(`Password: ${DEV_PASSWORD}`);
  console.log(`Jobs created/verified: ${createdJobs.length}`);
  console.log(`Candidates created: ${candidatesCreatedCount}`);
  console.log(`Assignments created: ${assignmentsCreatedCount}`);
  console.log(`Applications created: ${applicationsCreatedCount}`);
  console.log("=================================\n");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  });

