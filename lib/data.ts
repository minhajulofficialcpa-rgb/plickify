import { BookOpen, CircleDollarSign, GraduationCap, Headphones, LineChart, ShieldCheck, Trophy, Users } from "lucide-react";

export const features = [
  { title: "Course & batch engine", description: "Publish cohorts, drip lessons, resources, assignments, quizzes, and completion gates.", icon: BookOpen },
  { title: "Digital product shop", description: "Sell templates, e-books, recordings, bundles, and course upsells from the same catalog.", icon: CircleDollarSign },
  { title: "Student dashboard", description: "Give learners progress tracking, invoices, support tickets, certificates, and assignment feedback.", icon: GraduationCap },
  { title: "Admin command center", description: "Manage enrollments, orders, content, support queues, analytics, and audit logs in one place.", icon: LineChart },
  { title: "Bangladesh payments", description: "PipraPay checkout supports bKash, Nagad, Rocket, cards, webhooks, invoices, and refunds.", icon: ShieldCheck },
  { title: "Support & success", description: "Ticket routing, SLA priority, student notes, and certificate verification workflows are built in.", icon: Headphones }
];

export const courses = [
  {
    slug: "ai-productivity-masterclass",
    title: "AI Productivity Masterclass",
    price: 4500,
    lessons: 32,
    level: "Intermediate",
    progress: 68,
    description: "Build repeatable AI workflows, prompt systems, and automation playbooks for teams."
  },
  {
    slug: "freelance-launchpad",
    title: "Freelance Launchpad",
    price: 3200,
    lessons: 24,
    level: "Beginner",
    progress: 42,
    description: "Create a portfolio, package services, close clients, and manage delivery."
  },
  {
    slug: "digital-product-studio",
    title: "Digital Product Studio",
    price: 5200,
    lessons: 40,
    level: "Advanced",
    progress: 84,
    description: "Research, build, launch, and optimize profitable digital products."
  }
];

export const products = [
  { name: "Creator OS Notion Kit", type: "Template", price: 990 },
  { name: "Launch Email Swipe File", type: "Resource", price: 650 },
  { name: "Recorded Workshop Bundle", type: "Video", price: 1800 }
];

export const adminStats = [
  { label: "Monthly revenue", value: "৳8.42L", detail: "+18.4% from last month", icon: CircleDollarSign },
  { label: "Active students", value: "2,846", detail: "431 joined this month", icon: Users },
  { label: "Completion rate", value: "76%", detail: "12% above target", icon: Trophy },
  { label: "Open tickets", value: "38", detail: "9 high priority", icon: Headphones }
];

export const auditEvents = [
  { actor: "admin@plickify.com", action: "Published lesson", target: "Batch AI-24 Module 3", time: "2m ago" },
  { actor: "billing@plickify.com", action: "Payment reconciled", target: "INV-1042", time: "18m ago" },
  { actor: "support@plickify.com", action: "Ticket escalated", target: "SUP-771", time: "1h ago" }
];
