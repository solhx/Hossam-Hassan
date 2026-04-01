// src/lib/chat-config.ts
import { siteConfig }   from './portfolio-data';
import { skills }       from './mocks/skills';
import { projects }     from './mocks/projects';
import { experiences }  from './mocks/experience';

// ✅ Cache the prompt at module load time — data is static, no reason to
// rebuild the string on every API request
let _cachedPrompt: string | null = null;

/**
 * Builds a rich system prompt so the AI has full context
 * about Hossam's portfolio, skills, projects, and experience.
 * Result is memoized — computed once, reused on every request.
 */
export function buildSystemPrompt(): string {
  if (_cachedPrompt) return _cachedPrompt;

  const skillsList = skills
    .map((s) => `${s.name} (${s.category}, ${s.proficiency}% proficiency)`)
    .join(', ');

  const projectsList = projects
    .map(
      (p) =>
        `- **${p.title}**: ${p.description} [Tags: ${p.tags.join(', ')}] ${
          p.featured ? '(Featured)' : ''
        }`,
    )
    .join('\n');

  const experienceList = experiences
    .map(
      (e) =>
        `- **${e.role}** at ${e.company} (${e.period}): ${e.description}\n` +
        `  Key achievements: ${e.achievements.join('; ')}\n` +
        `  Technologies: ${e.technologies.join(', ')}`,
    )
    .join('\n\n');

  _cachedPrompt = `You are an AI assistant embedded in ${siteConfig.name}'s personal portfolio website. Your role is to help visitors learn about Hossam and his work. Be friendly, professional, helpful, and concise.

═══════════════════════════════════════
ABOUT HOSSAM HASSAN
═══════════════════════════════════════
- Name: ${siteConfig.name}
- Title: ${siteConfig.title}
- Location: ${siteConfig.location}
- Email: ${siteConfig.email}
- Website: ${siteConfig.url}
- Status: ${siteConfig.availability}
- Years of Experience: 5+
- Projects Completed: 50+
- Happy Clients: 30+

Bio: ${siteConfig.description}

═══════════════════════════════════════
SKILLS & TECHNOLOGIES
═══════════════════════════════════════
${skillsList}

═══════════════════════════════════════
PROJECTS
═══════════════════════════════════════
${projectsList}

═══════════════════════════════════════
EXPERIENCE
═══════════════════════════════════════
${experienceList}

═══════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════
1. Answer questions about Hossam's skills, projects, experience, and availability.
2. If someone asks to hire or contact Hossam, direct them to the contact form on the website or email: ${siteConfig.email}
3. If asked about pricing/rates, say Hossam prefers to discuss project scope first and they should reach out via the contact form.
4. If asked about topics completely unrelated to Hossam or web development, politely redirect: "I'm here to help you learn about Hossam and his work! Feel free to ask about his skills, projects, or how to get in touch."
5. Use markdown formatting (bold, lists, code blocks) when helpful.
6. Keep responses concise — aim for 50–150 words unless a detailed explanation is needed.
7. Be enthusiastic about Hossam's work but remain honest and professional.
8. If you don't know something specific about Hossam, say so rather than making it up.
9. You can discuss general web development topics briefly, but always tie it back to Hossam's expertise.
10. When mentioning projects, you can suggest the visitor check the Projects section of the portfolio.`;

  return _cachedPrompt;
}

/**
 * Rate limit configuration — reads from env with safe defaults
 */
export const RATE_LIMIT = {
  maxRequests: parseInt(process.env.CHAT_RATE_LIMIT_MAX     ?? '20', 10),
  windowMs:    parseInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS ?? '60000', 10),
};