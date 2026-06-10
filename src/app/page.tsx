import Link from "next/link";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { PublicFooter } from "@/components/public/footer";
import { PublicHeader } from "@/components/public/header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBdt, getFeaturedCourse, getPublishedCourses } from "@/lib/public-data";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ path: "/" });
export const revalidate = 300;

export default async function HomePage() {
  const [featuredCourse, courses] = await Promise.all([getFeaturedCourse(), getPublishedCourses(6)]);
  const feedback = featuredCourse.reviews?.length ? featuredCourse.reviews : [
    { id: "fallback-feedback-1", rating: 5, title: "Built for action", body: "Plickify keeps the learning path clear and the next step obvious." },
    { id: "fallback-feedback-2", rating: 5, title: "Practical pace", body: "The course structure feels focused, calm, and easy to revisit." }
  ];

  return (
    <>
      <PublicHeader />
      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">Featured course</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black sm:text-7xl">{featuredCourse.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{featuredCourse.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent"><a href={`/courses/${featuredCourse.slug}`}>View course <ArrowRight className="h-4 w-4" /></a></Button>
              <Button asChild variant="secondary"><Link href="/shop">Browse shop</Link></Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.05]">
            <img src={featuredCourse.thumbnail_url ?? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"} alt="Online course workspace" className="aspect-[4/3] w-full object-cover" />
            <div className="grid gap-2 p-5">
              <span className="text-sm font-semibold text-accent">{formatBdt(featuredCourse.price_bdt)}</span>
              <p className="text-sm leading-6 text-muted-foreground">Cohort learning, curriculum previews, and digital resources in one focused learning space.</p>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.03] py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-accent">Active courses</p>
                <h2 className="mt-3 text-3xl font-black text-white">Pick a focused path</h2>
              </div>
              <Button asChild variant="secondary"><Link href="/shop">See digital products</Link></Button>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                    <div className="flex items-center justify-between pt-4 text-sm font-semibold">
                      <span className="text-accent">{formatBdt(course.price_bdt)}</span>
                      <a href={`/courses/${course.slug}`} className="text-white">Details</a>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <Sparkles className="h-8 w-8 text-accent" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-black text-white">Learn, sell, and support from one base.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">Plickify is built for practical education businesses: courses, batches, digital products, certificates, invoices, and support workflows that can grow without turning messy.</p>
          </div>
          <div className="grid gap-4">
            {feedback.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center gap-2 text-accent"><MessageSquare className="h-4 w-4" /> {item.rating}/5</div>
                  <CardTitle>{item.title ?? "Student feedback"}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-black text-white">Need help choosing a course?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Send a short message and the team can guide you toward the right course, batch, or digital resource.</p>
            </div>
            <Button asChild variant="accent"><Link href="/contact">Contact us</Link></Button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
