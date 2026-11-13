import type { MetadataRoute } from "next";
import { db } from "../lib/db/index.ts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fingrow.dev";
  const lastMod = new Date();

  // Core public discovery routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: lastMod, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/curriculum`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/learn`, lastModified: lastMod, changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/simulations`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/simulations-showcase`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/simulations/first-salary`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/simulations/budget`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/simulations/investing`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/simulations/sip`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/simulations/startup`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/simulations/calculators`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/games`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/games-showcase`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/games/quick`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/games/battle`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.75 },
    { url: `${baseUrl}/games/leaderboard`, lastModified: lastMod, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/for-educators`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/community`, lastModified: lastMod, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/community-preview`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/disclaimer`, lastModified: lastMod, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: lastMod, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: lastMod, changeFrequency: "yearly", priority: 0.4 },
  ];

  // Dynamic Course and Lesson Routes from verified curriculum data
  const courses = db.courses.getAll();
  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${baseUrl}/learn/${c.slug}`,
    lastModified: lastMod,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const lessonRoutes: MetadataRoute.Sitemap = courses.flatMap((c) => {
    const lessons = db.lessons.getByCourseSlug(c.slug);
    return lessons.map((l) => ({
      url: `${baseUrl}/learn/${c.slug}/${l.slug}`,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  });

  return [...staticRoutes, ...courseRoutes, ...lessonRoutes];
}
