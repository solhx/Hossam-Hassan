export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}
export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: "https://github.com/solhx", icon: "github" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/hossam-hassan-132055244/", icon: "linkedin" },
  { name: "Email", url: "mailto:hossamhassan112003@gmail.com", icon: "mail" },
  { 
    name: "WhatsApp", 
    url: "https://wa.me/201022828316", 
    icon: "whatsapp" 
  },
];
export const stats = [
  { label: "Years Experience", value: 3 },
  { label: "Projects Completed", value: 10 },
  { label: "Happy Clients", value: 5 },
  { label: "Awards / Certifications", value: 4 },
];