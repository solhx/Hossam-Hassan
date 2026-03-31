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
   {id: "future-interns",
    company: "Future Interns",
    role: "Full Stack Web Development Intern",
    period: "Feb 2026 – Mar 2026",
    description:
      "Completed a structured, task-based internship focused on full-stack web development, applying both frontend and backend concepts in real-world assignments.",
    achievements: [
      "Worked on practical full-stack development tasks aligned with industry workflows",
      "Demonstrated strong responsibility, professionalism, and commitment to deadlines",
      "Improved problem-solving and debugging skills through hands-on assignments",
      "Applied feedback constructively and showed consistent technical growth",
    ],
    technologies: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "Git"],
  }
  ,{
    id: "elevvo-intern",
    company: "Elevvo",
    role: "Front-End Developer Intern",
    period: "Feb 2026 – Mar 2026",
    description:
      "Worked on building responsive and accessible user interfaces using modern front-end technologies within an agile team environment.",
    achievements: [
      "Developed reusable UI components to improve consistency and scalability",
      "Optimized performance and reduced unnecessary re-renders across pages",
      "Collaborated with team members using Git and agile workflow",
      "Fixed UI bugs and improved overall UX consistency",
    ],
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Git"],
  },
  {
    id: "codveda-intern",
    company: "Codveda Technologies",
    role: "Web Development Intern",
    period: "Aug 2025 – Sep 2025",
    description:
      "Built and deployed a full e-commerce web application using React and integrated REST APIs while collaborating with cross-functional teams.",
    achievements: [
      "Developed a complete e-commerce frontend with product listing, cart, and checkout",
      "Integrated REST APIs and implemented client-side validation",
      "Participated in code reviews and improved application performance",
      "Collaborated with designers and backend developers to deliver features",
    ],
    technologies: ["React", "JavaScript", "REST APIs", "CSS", "Git"],
  },
  {
    id: "gdsc-track-lead",
    company: "Google Developer Student Clubs (GDSC)",
    role: "Web Development Track Lead",
    period: "Jan 2023 – May 2023",
    description:
      "Led the web development learning track and mentored more than 50 students through structured sessions, workshops, and real-world projects.",
    achievements: [
      "Designed and structured a complete web development curriculum",
      "Delivered workshops covering HTML, CSS, JavaScript, and modern frameworks",
      "Supervised student projects and provided technical mentorship",
      "Coordinated with the organizing team to deliver technical events",
    ],
    technologies: ["HTML", "CSS", "JavaScript", "React", "Git"],
  },
  {
    id: "route-diploma",
    company: "Route Academy",
    role: "Web Development Diploma (Angular Track)",
    period: "Jul 2022 – Nov 2022",
    description:
      "Completed an intensive front-end diploma focused on building dynamic single-page applications using Angular and modern web development practices.",
    achievements: [
      "Built multiple single-page applications using Angular",
      "Worked with components, services, routing, and reactive forms",
      "Integrated APIs and handled client-server communication",
      "Applied best practices for scalable and maintainable front-end architecture",
    ],
    technologies: ["Angular", "TypeScript", "RxJS", "HTML", "CSS"],
  },
];