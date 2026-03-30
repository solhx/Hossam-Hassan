export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
}

export const projects: Project[] = [
  
 {
  id: "urban-nile-ecommerce",
  title: "Urban Nile — Streetwear E-Commerce Platform",
  description:
    "Production-ready MERN e-commerce platform with JWT authentication, OTP email verification, admin dashboard, and secure order management.",
  longDescription:
    "Urban Nile is a full-stack e-commerce platform built using the MERN stack. The application includes a complete customer shopping experience with product browsing, cart persistence, and secure checkout, alongside a powerful admin dashboard for managing products, orders, and users. The backend is built with Node.js and Express using TypeScript, featuring JWT authentication, email OTP verification, rate limiting, and Cloudinary image storage. The frontend is built with React, Vite, and Tailwind CSS, focusing on performance, responsive design, and smooth UI interactions. The system is deployed using Netlify for the frontend and Render for the backend, with MongoDB Atlas as the database.",
  image: "/urban-nile.webp",
  tags: [
    "React",
    "TypeScript",
    "Node.js",
    "Express",
    "MongoDB",
    "Tailwind",
    "JWT",
    "Cloudinary"
  ],
  liveUrl: "https://urban-nile.netlify.app",
  githubUrl: "https://github.com/solhx/FUTURE_FS_03",
  featured: true,
},
 
  {
  id: "lms-platform",
  title: "Learning Management System (LMS)",
  description:
    "Full-stack LMS with real-time notifications, course streaming, Stripe payments, and role-based dashboards for students, instructors, and admins.",
  longDescription:
    "A scalable Learning Management System built with Next.js 14, TypeScript, and Node.js to support modern online education platforms. The system includes role-based dashboards for students, instructors, and administrators, featuring video course streaming, quizzes, progress tracking, and real-time notifications powered by WebSockets. The backend provides secure JWT authentication, payment processing through Stripe, media storage via Cloudinary, and optional Redis caching for performance. The platform is designed with modular architecture, clean API layers, and responsive UI using Tailwind CSS.",
  image: "/lms.webp",
  tags: [
    "Next.js",
    "TypeScript",
    "Node.js",
    "MongoDB",
    "Socket.IO",
    "Stripe",
    "Redis",
    "Tailwind"
  ],
  liveUrl: "https://elearning-lms.netlify.app/",
  githubUrl: "https://github.com/solhx/Learning-Management-System-LMS-",
  featured: true,
},
  {
  id: "3d-portfolio",
  title: "3D Interactive Portfolio",
  description:
    "A 3D portfolio website with immersive spherical navigation and dynamic animated worlds.",
  longDescription:
    "An interactive 3D portfolio website built with React, Three.js, and Framer Motion. Features include immersive spherical navigation, dynamic animated worlds, smooth transitions, and interactive 3D objects that showcase projects in a modern and engaging way.",
  image: "/3d-portfolio.webp",
  tags: ["React", "Three.js", "Framer Motion", "WebGL", "Tailwind CSS"],
  liveUrl: "https://hossam-hassan-portfolio.netlify.app/",
  githubUrl: "https://github.com/solhx/My-Portfolio",
  featured: true,
},{
  id: "shophub-ecommerce",
  title: "ShopHub E-Commerce",
  description:
    "Full-stack e-commerce app with Django backend, React frontend, shopping cart, and admin panel.",
  longDescription:
    "A complete e-commerce solution built with Django (REST API) for the backend and React 18 with Tailwind CSS and Framer Motion for the frontend. Features include product catalog, categories, shopping cart, user authentication, orders management, image uploads, and a responsive modern UI.",
  image: "/shophub.webp",
  tags: ["Django", "React", "Tailwind CSS", "Framer Motion", "PostgreSQL/MySQL"],
  liveUrl: "https://hossam-ecommerce-webs.netlify.app/",
  githubUrl: "https://github.com/solhx/ecommerce-project",
  featured: false,
}, {
  id: "flowstate-landing",
  title: "FlowState — SaaS Landing Page",
  description:
    "Modern responsive SaaS landing page with glassmorphism UI, gradient design, dark/light mode, and scroll-triggered animations.",
  longDescription:
    "FlowState is a fully responsive landing page designed for a fictional AI workflow automation SaaS product. The project focuses on modern UI trends such as glassmorphism, gradient-based design, and smooth micro-interactions. It is built using pure HTML, CSS, and JavaScript without any frameworks, implementing theme persistence with localStorage, scroll-based animations using the Intersection Observer API, and responsive layouts using CSS Grid and Flexbox. The goal of the project was to demonstrate strong front-end fundamentals, animation performance optimization, and clean, accessible UI structure.",
  image: "/flowstate.webp",
  tags: [
    "HTML5",
    "CSS3",
    "JavaScript",
    "Responsive Design",
    "Intersection Observer",
    "Glassmorphism"
  ],
  liveUrl: "https://tech-landing-products.netlify.app",
  githubUrl: "https://github.com/solhx/Landing-Page-For-Tech-Product",
  featured: false,
}
];