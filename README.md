<div align="center">

# 🚀 Hossam Hassan — Full-Stack Developer Portfolio

**Modern animated portfolio built with Next.js 16, React 19, TypeScript, and immersive 3D visuals.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-hossam--hassann.netlify.app-brightgreen?style=for-the-badge)](https://hossam-hassann.netlify.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎮 **3D Hero Section** | Three.js scene with GSAP, Framer Motion, parallax mouse tracking & velocity scroll |
| 🤖 **AI Chat Widget** | Real-time chat via AI SDK + OpenRouter with Markdown rendering & typing indicators |
| 🎨 **Rich Animations** | Smooth scrolling (Lenis), text reveals, background beams, and 3D card effects |
| 🌙 **Dark / Light Mode** | Next Themes toggle with system preference support |
| 📱 **Responsive Design** | Mobile-first layout with Tailwind CSS 4 & shadcn/ui components |
| 📬 **Contact Form** | EmailJS integration with Zod schema validation |
| ⚡ **Performance** | Turbopack dev server, optimized builds, Vercel Analytics & Speed Insights |
| 🔍 **SEO** | Auto-generated sitemap & robots.txt via next-sitemap |

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript 5.9 |
| **Styling** | Tailwind CSS 4, PostCSS, clsx, Tailwind Merge |
| **Animations** | Framer Motion 12, GSAP 3.14, Three.js 0.182, Lenis |
| **UI Components** | shadcn/ui — 3D cards, marquee, timeline, floating dock, and more |
| **AI / Chat** | `@ai-sdk/openai`, `@openrouter/ai-sdk-provider` |
| **Forms & Validation** | React Hook Form, Zod 4.3, EmailJS |
| **Tooling** | ESLint, next-sitemap, Vercel Analytics, Lucide Icons |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Tailwind base styles
│   ├── layout.tsx           # Root layout + providers
│   ├── page.tsx             # Home page
│   └── api/chat/route.ts    # AI chat API (AI SDK)
│
├── components/
│   ├── Providers.tsx        # Theme & chat providers
│   ├── chat/                # ChatMessage, Widget, Window, Markdown, Typing
│   ├── common/              # FloatingAppBar, Footer, SmoothScroll, ToggleTheme
│   ├── sections/home/       # AboutMe, Contact, Experience, Hero, Projects, Skills
│   └── ui/                  # 20+ shadcn-style components
│
├── hooks/                   # useChat, useMouseParallax, useReducedMotion
├── lib/
│   ├── chat-config.ts
│   ├── portfolio-data.ts    # Site config & re-exports
│   ├── rate-limiter.ts
│   └── mocks/               # experience, projects, skills, social-links
├── utils/                   # utils.ts
└── validation/              # contact-us-schema.ts (Zod)

public/                      # Images, resume PDF, robots.txt
```

---

## 🚀 Quick Start

**1. Clone the repository**
```bash
git clone https://github.com/solhx/Hossam-Hassan.git
cd Hossam-Hassan
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env.local` file in the root:
```env
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

**4. Start the dev server** *(Turbopack enabled for fast HMR)*
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**5. Build for production**
```bash
npm run build
npm start
```

---

## 💼 Portfolio Highlights

### 👤 About Me
MERN Stack Developer with 3+ years of experience building full-stack web applications. Background in React/Next.js front-end development. Based in **Cairo, Egypt** and open to new opportunities.

📄 **[Download Resume](/public/Hossam-Hassan-Resume.pdf)**

---

### 🏢 Experience

| Role | Company | Period | Stack |
|---|---|---|---|
| Full-Stack Intern | Future Interns | Feb – Mar 2026 | React, Node.js, MongoDB, Git |
| Front-End Intern | Elevvo | Feb – Mar 2026 | React, Next.js, TypeScript, Tailwind |
| Web Dev Intern | Codveda | Aug – Sep 2025 | React, REST APIs, CSS |
| Web Track Lead | GDSC | Jan – May 2023 | HTML, CSS, JS, React |
| Angular Diploma | Route Academy | Jul – Nov 2022 | Angular, TypeScript, RxJS |

---

### 🧠 Skills

**Frontend**
`React.js 92%` · `Next.js 88%` · `TypeScript 85%` · `JavaScript 93%` · `Tailwind CSS 90%` · `HTML5 95%` · `CSS3 93%` · `Angular 80%` · `Redux 82%` · `React Hooks 90%`

**Backend**
`Node.js 82%` · `REST APIs 85%` · `OOP 88%` · `Socket.io 75%` · `C++ 80%` · `Java 78%`

**Database & Tools**
`MongoDB 83%` · `Mongoose 80%` · `SQL 78%` · `Git 90%` · `GitHub 90%` · `Figma 75%` · `Cloudinary 78%`

---

### 🗂️ Featured Projects

| Project | Stack | Links |
|---|---|---|
| **Urban Nile** — E-Commerce platform with JWT/OTP auth & admin panel | MERN | [Live](https://urban-nile.netlify.app) · [GitHub](https://github.com/solhx/FUTURE_FS_03) |
| **LMS Platform** — Full learning management system with payments | Next.js, Stripe, Socket.IO | [Live](https://elearning-lms.netlify.app/) · [GitHub](https://github.com/solhx/Learning-Management-System-LMS-) |
| **3D Portfolio** — Immersive portfolio with Three.js animations | React, Three.js | [Live](https://hossam-hassan-portfolio.netlify.app/) · [GitHub](https://github.com/solhx/My-Portfolio) |
| **ShopHub** — Full-stack e-commerce web app | Django, React | [Live](https://hossam-ecommerce-webs.netlify.app/) · [GitHub](https://github.com/solhx/ecommerce-project) |
| **Flowstate** — SaaS landing page for a tech product | HTML, CSS, JS | [Live](https://tech-landing-products.netlify.app) · [GitHub](https://github.com/solhx/Landing-Page-For-Tech-Product) |

---

## ☁️ Deployment

The easiest way to deploy is via **[Vercel](https://vercel.com)** — it's optimized for Next.js and auto-deploys from GitHub.

1. Push your repo to GitHub
2. Import the project on Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy — `sitemap.xml` and `robots.txt` are auto-generated on build

---

## 🤝 Connect

<div align="center">

[![Email](https://img.shields.io/badge/Email-hossamhassan112003@gmail.com-red?style=flat-square&logo=gmail)](mailto:hossamhassan112003@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Hossam_Hassan-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/hossam-hassan-132055244/)
[![GitHub](https://img.shields.io/badge/GitHub-solhx-181717?style=flat-square&logo=github)](https://github.com/solhx)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Chat-25D366?style=flat-square&logo=whatsapp)](https://wa.me/201022828316)

</div>

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ using Next.js, shadcn/ui, Three.js, and the AI SDK.

⭐ **If you found this helpful, consider starring the repo!** ⭐

</div>