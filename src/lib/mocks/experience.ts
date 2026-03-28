export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
  technologies: string[];
  logo?: string;
}

export const experiences: Experience[] = [
  {
    id: "senior-dev",
    company: "TechCorp International",
    role: "Senior Full-Stack Developer",
    period: "2023 – Present",
    description:
      "Leading frontend architecture for enterprise SaaS products serving 50K+ daily active users. Mentoring junior developers and establishing coding standards.",
    achievements: [
      "Reduced page load times by 60% through code-splitting and lazy loading strategies",
      "Led migration from CRA to Next.js 14, improving SEO scores by 40%",
      "Implemented real-time collaborative features using WebSockets",
      "Established CI/CD pipelines reducing deployment time by 75%",
    ],
    technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
  },
  {
    id: "fullstack-dev",
    company: "Digital Solutions Agency",
    role: "Full-Stack Developer",
    period: "2021 – 2023",
    description:
      "Built and maintained multiple client projects ranging from e-commerce platforms to SaaS dashboards. Collaborated with design team for pixel-perfect implementations.",
    achievements: [
      "Delivered 15+ client projects on time with 98% satisfaction rate",
      "Built reusable component library reducing development time by 40%",
      "Integrated payment gateways (Stripe, PayPal) across multiple platforms",
      "Optimized database queries reducing average response time by 50%",
    ],
    technologies: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS"],
  },
  {
    id: "frontend-dev",
    company: "StartUp Hub",
    role: "Frontend Developer",
    period: "2020 – 2021",
    description:
      "Developed responsive web applications with focus on performance and accessibility. Introduced modern animation libraries to enhance user experience.",
    achievements: [
      "Achieved 95+ Lighthouse scores across all projects",
      "Implemented A11y standards meeting WCAG 2.1 AA compliance",
      "Introduced GSAP and Framer Motion for interactive animations",
      "Reduced bundle size by 35% through tree-shaking and optimization",
    ],
    technologies: ["React", "JavaScript", "SCSS", "GSAP", "Webpack"],
  },
  {
    id: "intern",
    company: "WebDev Academy",
    role: "Web Development Intern",
    period: "2019 – 2020",
    description:
      "Learned modern web development practices, built internal tools, and contributed to open-source projects.",
    achievements: [
      "Built internal dashboard used by 200+ students",
      "Contributed to 5 open-source projects with 50+ merged PRs",
      "Won internal hackathon with a real-time quiz application",
    ],
    technologies: ["HTML", "CSS", "JavaScript", "React", "Firebase"],
  },
];