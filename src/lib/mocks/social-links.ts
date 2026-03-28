export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: "https://github.com/hossamhassan", icon: "github" },
  { name: "LinkedIn", url: "https://linkedin.com/in/hossamhassan", icon: "linkedin" },
  { name: "Twitter", url: "https://twitter.com/hossamhassan", icon: "twitter" },
  { name: "Email", url: "mailto:hello@hossamhassan.dev", icon: "mail" },
];

export const stats = [
  { label: "Years Experience", value: 5 },
  { label: "Projects Completed", value: 50 },
  { label: "Happy Clients", value: 30 },
  { label: "GitHub Stars", value: 1200 },
];