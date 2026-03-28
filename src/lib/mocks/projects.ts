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
    id: "ecommerce-platform",
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce with real-time inventory, Stripe payments, and admin dashboard.",
    longDescription:
      "A complete e-commerce solution built with Next.js 14, featuring server-side rendering, real-time inventory management with WebSockets, Stripe payment integration, admin analytics dashboard, and comprehensive product management.",
    image: "/images/projects/ecommerce.webp",
    tags: ["Next.js", "TypeScript", "MongoDB", "Stripe", "Tailwind CSS"],
    liveUrl: "https://shop-demo.hossamhassan.dev",
    githubUrl: "https://github.com/hossamhassan/ecommerce",
    featured: true,
  },
  {
    id: "task-management",
    title: "TaskFlow Pro",
    description: "Real-time collaborative task manager with drag-and-drop Kanban boards.",
    longDescription:
      "A project management tool inspired by Trello and Linear, featuring real-time collaboration via Socket.io, drag-and-drop Kanban boards, calendar views, team workspaces, and automated workflows.",
    image: "/images/projects/taskflow.webp",
    tags: ["React", "Node.js", "Socket.io", "PostgreSQL", "Redux"],
    liveUrl: "https://taskflow.hossamhassan.dev",
    githubUrl: "https://github.com/hossamhassan/taskflow",
    featured: true,
  },
  {
    id: "ai-content-generator",
    title: "AI Content Studio",
    description: "AI-powered content generation platform with GPT-4 and template system.",
    longDescription:
      "An AI content generation platform using OpenAI's GPT-4, featuring customizable templates, SEO optimization, content scheduling, team collaboration, and analytics dashboards for tracking performance.",
    image: "/images/projects/ai-studio.webp",
    tags: ["Next.js", "OpenAI API", "Prisma", "tRPC", "Tailwind CSS"],
    liveUrl: "https://ai-studio.hossamhassan.dev",
    githubUrl: "https://github.com/hossamhassan/ai-studio",
    featured: true,
  },
  {
    id: "fitness-tracker",
    title: "FitTrack Dashboard",
    description: "Health & fitness tracking dashboard with data visualization and goal setting.",
    longDescription:
      "A comprehensive fitness tracking application with interactive charts, workout logging, nutrition tracking, goal setting with progress visualization, and integration with wearable devices.",
    image: "/images/projects/fittrack.webp",
    tags: ["React", "D3.js", "Express", "MongoDB", "Chart.js"],
    liveUrl: "https://fittrack.hossamhassan.dev",
    githubUrl: "https://github.com/hossamhassan/fittrack",
    featured: false,
  },
  {
    id: "social-media-app",
    title: "ConnectHub",
    description: "Social media platform with real-time messaging, stories, and content feeds.",
    longDescription:
      "A modern social platform featuring real-time messaging via WebSockets, ephemeral stories, algorithmic content feed, user profiles, post interactions, and push notifications.",
    image: "/images/projects/connecthub.webp",
    tags: ["React Native", "Node.js", "Redis", "AWS S3", "Socket.io"],
    liveUrl: "https://connecthub.hossamhassan.dev",
    githubUrl: "https://github.com/hossamhassan/connecthub",
    featured: false,
  },
  {
    id: "portfolio-builder",
    title: "Folio Builder",
    description: "Drag-and-drop portfolio builder with customizable themes and hosting.",
    longDescription:
      "A portfolio builder platform that lets users create stunning portfolio sites with drag-and-drop, pre-designed sections, custom themes, domain linking, analytics, and one-click deployment.",
    image: "/images/projects/folio.webp",
    tags: ["Next.js", "Prisma", "Tailwind CSS", "Vercel", "Cloudflare"],
    liveUrl: "https://folio.hossamhassan.dev",
    githubUrl: "https://github.com/hossamhassan/folio-builder",
    featured: false,
  },
];