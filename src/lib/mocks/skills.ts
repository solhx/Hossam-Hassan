export interface Skill {
  name: string;
  icon: string;
  category: "frontend" | "backend" | "database" | "tools";
  proficiency: number; // 0–100
}

export const skills: Skill[] = [
  // ── Frontend ──────────────────────────────────
  { name: "React.js",       icon: "⚛️",  category: "frontend", proficiency: 92 },
  { name: "Next.js",        icon: "▲",   category: "frontend", proficiency: 88 },
  { name: "TypeScript",     icon: "🔷",  category: "frontend", proficiency: 85 },
  { name: "JavaScript",     icon: "🟨",  category: "frontend", proficiency: 93 },
  { name: "Angular",        icon: "🔺",  category: "frontend", proficiency: 80 },
  { name: "Tailwind CSS",   icon: "🎨",  category: "frontend", proficiency: 90 },
  { name: "Bootstrap",      icon: "🅱️",  category: "frontend", proficiency: 88 },
  { name: "jQuery",         icon: "💲",  category: "frontend", proficiency: 82 },
  { name: "CSS",            icon: "🌐",  category: "frontend", proficiency: 93 },
  { name: "HTML5",          icon: "🧱",  category: "frontend", proficiency: 95 },
  { name: "React Hooks",    icon: "🪝",  category: "frontend", proficiency: 90 },
  { name: "Redux",          icon: "🔄",  category: "frontend", proficiency: 82 }, // ← NEW
  { name: "WordPress",      icon: "📝",  category: "frontend", proficiency: 78 },

  // ── Backend ───────────────────────────────────
  { name: "Node.js",        icon: "🟩",  category: "backend",  proficiency: 82 },
  { name: "Socket.io",      icon: "🔌",  category: "backend",  proficiency: 75 },
  { name: "REST APIs",      icon: "🔗",  category: "backend",  proficiency: 85 },
  { name: "OOP",            icon: "📦",  category: "backend",  proficiency: 88 },
  { name: "C++",            icon: "⚙️",  category: "backend",  proficiency: 80 },
  { name: "Java",           icon: "☕",  category: "backend",  proficiency: 78 },

  // ── Database ──────────────────────────────────
  { name: "MongoDB",        icon: "🍃",  category: "database", proficiency: 83 },
  { name: "Mongoose",       icon: "🗄️",  category: "database", proficiency: 80 },
  { name: "SQL",            icon: "🐘",  category: "database", proficiency: 78 },

  // ── Tools ─────────────────────────────────────
  { name: "Git",            icon: "🔀",  category: "tools",    proficiency: 90 },
  { name: "GitHub",         icon: "🐙",  category: "tools",    proficiency: 90 },
  { name: "Cloudinary",     icon: "☁️",  category: "tools",    proficiency: 78 }, // ← NEW
  { name: "Figma",          icon: "🎯",  category: "tools",    proficiency: 75 },
];

export const skillCategories = [
  { id: "frontend", label: "Frontend",  color: "#7c3aed" },
  { id: "backend",  label: "Backend",   color: "#06b6d4" },
  { id: "database", label: "Database",  color: "#f59e0b" },
  { id: "tools",    label: "Tools",     color: "#10b981" },
] as const;