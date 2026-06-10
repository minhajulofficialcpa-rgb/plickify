import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Star, Users } from "lucide-react";
import { HomeFeatureDialogs } from "@/components/public/home-feature-dialogs";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { homeFeatureCards, homeHero, homeModules, homeReviews, homeSectionSettings, whyUsContent } from "@/lib/home-content";
import { formatBdt, getFeaturedCourse, getPublishedCourses } from "@/lib/public-data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ path: "/" });
export const revalidate = 300;

export default async function HomePage() {
  const [featuredCourse, courses] = await Promise.all([getFeaturedCourse(), getPublishedCourses(6)]);
  const enabled = homeSectionSettings;

  return (
    <>
      <PublicHeader />
      <main className="bg-background text-foreground">
        {enabled.hero.enabled ? (
          <section className="relative overflow-hidden border-b border-border bg-[var(--surface-subtle)]">
            <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-accent">{homeHero.eyebrow}</p>
                <h1 className="mt-5 text-4xl font-black leading-tight text-foreground sm:text-6xl lg:text-7xl">{homeHero.title}</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{homeHero.description}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild variant="accent"><Link href={homeHero.primaryCta.href}>{homeHero.primaryCta.label} <ArrowRight className="h-4 w-4" /></Link></Button>
                  <Button asChild variant="secondary"><Link href={homeHero.secondaryCta.href}>{homeHero.secondaryCta.label}</Link></Button>
                </div>
                <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                  {homeHero.stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                      <p className="text-2xl font-black text-foreground">{stat.value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Image src={homeHero.imageUrl} alt="Students learning with Plickify" width={1400} height={1050} className="aspect-[4/3] w-full rounded-lg object-cover shadow-2xl shadow-slate-950/15" priority />
                <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/30 bg-white/88 p-4 text-slate-950 shadow-xl backdrop-blur-md dark:bg-slate-950/86 dark:text-white">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Featured course</p>
                  <h2 className="mt-2 text-xl font-black">{featuredCourse.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{featuredCourse.description}</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {enabled.whyUs.enabled ? (
          <section className="border-b border-border py-16 sm:py-20" id="why-plickify">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.24em] text-accent">{whyUsContent.eyebrow}</p>
                <h2 className="mt-4 text-3xl font-black leading-tight text-foreground sm:text-5xl">{whyUsContent.title}</h2>
              </div>
              <div>
                <p className="text-lg leading-8 text-muted-foreground">{whyUsContent.body}</p>
                <div className="mt-8 grid gap-3">
                  {whyUsContent.highlights.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-accent" />
                      <p className="font-semibold text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {enabled.features.enabled ? (
          <section className="bg-[var(--surface-subtle)] py-16 sm:py-20" id="course-features">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-accent">Course features</p>
                <h2 className="mt-4 text-3xl font-black text-foreground sm:text-5xl">Feature cards that open into details.</h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">Admins can shape these as benefit cards, curriculum promises, resource highlights, or conversion points.</p>
              </div>
              <div className="mt-10"><HomeFeatureDialogs features={homeFeatureCards} /></div>
            </div>
          </section>
        ) : null}

        {enabled.modules.enabled ? (
          <section className="border-y border-border py-16 sm:py-20" id="course-modules">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-accent">Course module</p>
                  <h2 className="mt-4 text-3xl font-black text-foreground sm:text-5xl">Visual study plan with image or text mode.</h2>
                </div>
                <Button asChild variant="secondary"><Link href="/courses">View all course</Link></Button>
              </div>
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {homeModules.map((module) => (
                  <article key={module.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                    {module.mode === "image" ? <Image src={module.imageUrl} alt={module.title} width={900} height={620} className="aspect-[4/3] w-full object-cover" /> : null}
                    <div className="p-5">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">{module.week}</p>
                      <h3 className="mt-3 text-xl font-black text-foreground">{module.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{module.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {enabled.courses.enabled ? (
          <section className="py-16 sm:py-20" id="all-courses">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-accent">Our courses</p>
                <h2 className="mt-4 text-3xl font-black text-foreground sm:text-5xl">Start with a clear learning path.</h2>
              </div>
              <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3 text-sm font-bold text-muted-foreground">
                        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-accent" /> Course</span>
                        <span className="text-accent">{formatBdt(course.price_bdt)}</span>
                      </div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                      <div className="flex items-center justify-between pt-4 text-sm font-semibold">
                        <span className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Self paced</span>
                        <Link href={`/courses/${course.slug}`} className="text-accent">Details</Link>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {enabled.reviews.enabled ? (
          <section className="bg-[var(--surface-subtle)] py-16 sm:py-20" id="student-reviews">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-accent">Student review</p>
                  <h2 className="mt-4 text-3xl font-black text-foreground sm:text-5xl">Proof from learner experience.</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-foreground"><Users className="h-4 w-4 text-accent" /> Community backed</div>
              </div>
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {homeReviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex gap-1 text-accent">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div>
                      <CardDescription>{review.body}</CardDescription>
                      <div className="pt-3">
                        <CardTitle>{review.name}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{review.role}</p>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {enabled.footerCta.enabled ? (
          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-6 rounded-lg border border-border bg-card p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center md:p-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.24em] text-accent">Admission support</p>
                <h2 className="mt-3 text-3xl font-black text-foreground">Need help choosing your course?</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Send a message and the team can guide you toward the right course, batch, or learning path.</p>
              </div>
              <Button asChild variant="accent"><Link href="/contact">Contact us <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
          </section>
        ) : null}
      </main>
      <PublicFooter />
    </>
  );
}
