export interface Skill {
  name: string;
  icon: string;
  category: "frontend" | "backend" | "devops" | "tools";
  proficiency: number; // 0–100
}

export const skills: Skill[] = [
  // Frontend
  { name: "React", icon: "⚛️", category: "frontend", proficiency: 95 },
  { name: "Next.js", icon: "▲", category: "frontend", proficiency: 92 },
  { name: "TypeScript", icon: "🔷", category: "frontend", proficiency: 93 },
  { name: "Tailwind CSS", icon: "🎨", category: "frontend", proficiency: 95 },
  { name: "Framer Motion", icon: "🎬", category: "frontend", proficiency: 88 },
  { name: "GSAP", icon: "🟢", category: "frontend", proficiency: 85 },
  { name: "Three.js", icon: "🧊", category: "frontend", proficiency: 75 },
  { name: "HTML5/CSS3", icon: "🌐", category: "frontend", proficiency: 98 },

  // Backend
  { name: "Node.js", icon: "🟩", category: "backend", proficiency: 90 },
  { name: "Express.js", icon: "⚡", category: "backend", proficiency: 88 },
  { name: "MongoDB", icon: "🍃", category: "backend", proficiency: 87 },
  { name: "PostgreSQL", icon: "🐘", category: "backend", proficiency: 80 },
  { name: "REST APIs", icon: "🔗", category: "backend", proficiency: 92 },
  { name: "GraphQL", icon: "◈", category: "backend", proficiency: 78 },

  // DevOps
  { name: "Docker", icon: "🐳", category: "devops", proficiency: 75 },
  { name: "AWS", icon: "☁️", category: "devops", proficiency: 70 },
  { name: "Vercel", icon: "▲", category: "devops", proficiency: 90 },
  { name: "CI/CD", icon: "🔄", category: "devops", proficiency: 80 },

  // Tools
  { name: "Git", icon: "🔀", category: "tools", proficiency: 93 },
  { name: "Figma", icon: "🎯", category: "tools", proficiency: 82 },
  { name: "VS Code", icon: "💻", category: "tools", proficiency: 95 },
  { name: "Linux", icon: "🐧", category: "tools", proficiency: 78 },
];

export const skillCategories = [
  { id: "frontend", label: "Frontend", color: "#7c3aed" },
  { id: "backend", label: "Backend", color: "#06b6d4" },
  { id: "devops", label: "DevOps", color: "#f59e0b" },
  { id: "tools", label: "Tools", color: "#10b981" },
] as const;