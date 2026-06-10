export type HomeSectionKey = "hero" | "whyUs" | "features" | "modules" | "courses" | "reviews" | "footerCta";

export interface HomeNavItem {
  id: string;
  label: string;
  href: string;
  enabled: boolean;
}

export interface HomeFeatureCard {
  id: string;
  title: string;
  summary: string;
  detail: string;
  icon: "sparkles" | "monitor" | "users" | "badge" | "headphones" | "target";
}

export interface HomeModuleItem {
  id: string;
  week: string;
  title: string;
  description: string;
  imageUrl: string;
  mode: "image" | "text";
}

export interface HomeReviewItem {
  id: string;
  name: string;
  role: string;
  body: string;
  rating: number;
}

export const homeSectionSettings: Record<HomeSectionKey, { label: string; enabled: boolean; editableFields: string[] }> = {
  hero: { label: "Hero section", enabled: true, editableFields: ["eyebrow", "title", "description", "primary CTA", "media"] },
  whyUs: { label: "Why us", enabled: true, editableFields: ["headline", "story", "stats", "video/link"] },
  features: { label: "Course features", enabled: true, editableFields: ["cards", "icons", "popup details"] },
  modules: { label: "Course modules", enabled: true, editableFields: ["image/text mode", "weeks", "description"] },
  courses: { label: "Course grid", enabled: true, editableFields: ["course source", "card copy", "CTA"] },
  reviews: { label: "Student reviews", enabled: true, editableFields: ["review cards", "rating", "student info"] },
  footerCta: { label: "Footer CTA", enabled: true, editableFields: ["headline", "copy", "button"] }
};

export const publicNavItems: HomeNavItem[] = [
  { id: "home", label: "Home", href: "/", enabled: true },
  { id: "courses", label: "All Course", href: "/courses", enabled: true },
  { id: "shop", label: "Shop", href: "/shop", enabled: true },
  { id: "reviews", label: "Student Review", href: "/#student-reviews", enabled: true },
  { id: "about", label: "About", href: "/about", enabled: true },
  { id: "contact", label: "Contact", href: "/contact", enabled: true }
];

export const homeHero = {
  eyebrow: "Skill-first digital learning",
  title: "Build practical skills with guided courses, batches, and support.",
  description: "Plickify helps learners move from watching lessons to completing real assignments, earning certificates, and getting support when they need it.",
  primaryCta: { label: "Get Started", href: "/login" },
  secondaryCta: { label: "Explore Courses", href: "/courses" },
  imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85",
  stats: [
    { label: "Structured modules", value: "15+" },
    { label: "Support workflow", value: "24/7" },
    { label: "Verified output", value: "QR" }
  ]
};

export const whyUsContent = {
  eyebrow: "Why Plickify",
  title: "Not just lessons. A complete path from learning to proof.",
  body: "The homepage is shaped like a focused course funnel: clear promise, trust, module roadmap, active courses, reviews, and a direct action. Admins can later control each section from the content settings panel.",
  highlights: [
    "Batch-based access and lesson locking",
    "Assignment review and support ticket flow",
    "Certificates and invoices with public verification"
  ]
};

export const homeFeatureCards: HomeFeatureCard[] = [
  { id: "resources", title: "Premium resource kit", summary: "Tools, templates, and files organized with each learning path.", detail: "Admins can attach resources to lessons, products, or batches. The download flow uses private storage and signed URLs so raw file paths stay hidden.", icon: "monitor" },
  { id: "live-class", title: "Guided class experience", summary: "Modules are sequenced for live class, recorded lesson, and assignment work.", detail: "Students see only lessons they have active enrollment or batch access for. Locked lessons stay protected by server-side checks.", icon: "users" },
  { id: "roadmap", title: "Module-based roadmap", summary: "A visual week-by-week plan makes the course feel easy to follow.", detail: "Each module can use an image-focused or text-focused layout, so admins can build the section like a visual syllabus or a compact study plan.", icon: "target" },
  { id: "support", title: "Support that continues", summary: "Learners can open tickets for learning or profile-change requests.", detail: "Support moderators and admins can reply, change ticket status, and generate notifications for students.", icon: "headphones" },
  { id: "certificate", title: "Verified certificates", summary: "Certificate and invoice verification pages build trust publicly.", detail: "Certificate codes and invoice codes are unique, QR-friendly, and expose only safe public fields on verification pages.", icon: "badge" },
  { id: "conversion", title: "Built for admission", summary: "The page leads users to courses instead of distracting them with shop products.", detail: "Shop remains in the navbar, but the homepage focuses only on course conversion, student trust, and the learning journey.", icon: "sparkles" }
];

export const homeModules: HomeModuleItem[] = [
  { id: "week-1", week: "Week 01", title: "Foundation and setup", description: "Platform orientation, learning goals, tools, and first practical task.", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80", mode: "image" },
  { id: "week-2", week: "Week 02", title: "Core skill practice", description: "Hands-on lessons with guided checkpoints and class notes.", imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80", mode: "image" },
  { id: "week-3", week: "Week 03-04", title: "Assignment and feedback", description: "Submit text, URL, GitHub link, or file work and get admin feedback.", imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80", mode: "text" },
  { id: "week-5", week: "Week 05+", title: "Portfolio and certificate", description: "Complete progress, required criteria, and claim verified certificate.", imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80", mode: "image" }
];

export const homeReviews: HomeReviewItem[] = [
  { id: "review-1", name: "Nabila Rahman", role: "Student", rating: 5, body: "The module plan made the course feel calm and organized. I always knew the next step." },
  { id: "review-2", name: "Rakib Hasan", role: "Batch learner", rating: 5, body: "Assignments and feedback helped me practice instead of only watching lessons." },
  { id: "review-3", name: "Sadia Islam", role: "Digital product buyer", rating: 5, body: "The dashboard and downloads are clear, and support replies are easy to follow." }
];
