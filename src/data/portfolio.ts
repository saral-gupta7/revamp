export const profile = {
  name: "Saral Gupta",
  initials: "SG",
  title: "Software engineer & curious builder",
  intro:
    "I build dependable systems and thoughtful digital products, from distributed infrastructure to focused learning tools.",
  location: "India",
  email: "saral.guptaw@gmail.com",
  minimalPortfolio: "https://min.srlgpta.xyz",
};

// Replace the placeholder URLs when the live project links are ready.
export const projects = [
  {
    index: "01",
    title: "gyoretsu",
    description: "A distributed task queue with leases, retries and workers.",
    stack: ["Go", "PostgreSQL", "Docker"],
    href: "https://github.com/saral-gupta7/gyoretsu",
  },
  {
    index: "02",
    title: "coordinate",
    description:
      "An agentic learning experience built for focused exploration.",
    stack: ["Next.js", "FastAPI", "Python"],
    href: "https://coordinate.srlgpta.xyz",
  },
  {
    index: "03",
    title: "recode",
    description: "Account-free image and video processing in the browser.",
    stack: ["Go", "Next.js", "FFmpeg"],
    href: "https://recode.srlgpta.xyz",
  },
] as const;

export const socials = [
  {
    label: "GitHub",
    handle: "@github",
    href: "https://github.com/saral-gupta7",
  },
  {
    label: "LinkedIn",
    handle: "/in/linkedin",
    href: "https://www.linkedin.com/in/saralgupta7",
  },
  { label: "Twitter / X", handle: "@twitter", href: "https://x.com/srlgpt_a" },
  {
    label: "Instagram",
    handle: "@languages",
    href: "https://www.instagram.com/__marginsofmeaning",
  },
  {
    label: "Substack",
    handle: "newsletter",
    href: "https://substack.com/@srlgpta",
  },
  { label: "Email", handle: "say hello", href: `mailto:${profile.email}` },
] as const;

export const techStack = [
  "TypeScript",
  "Go",
  "PostgreSQL",
  "Python",
  "Java",
  "Rust",
] as const;
