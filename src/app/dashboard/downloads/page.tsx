import { Download } from "lucide-react";
import { createDownloadUrlAction } from "@/actions/student";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/auth";
import { firstRelation } from "@/lib/lms";
import { getStudentDownloads } from "@/lib/student-dashboard";
import { formatDate, formatProductCategory } from "@/lib/public-data";

export default async function DashboardDownloadsPage() {
  const { user } = await requireOnboardedUser();
  const downloads = await getStudentDownloads(user.id);

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Downloads</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Authorized downloads</h1>
      <p className="mt-3 text-muted-foreground">Only purchased or authorized products appear here. 5-minute signed URLs are generated server-side.</p>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {downloads.length ? downloads.map((download) => {
          const product = firstRelation(download.products);
          const countLabel = download.max_downloads ? `${download.download_count ?? 0}/${download.max_downloads}` : `${download.download_count ?? 0}`;
          return (
            <Card key={download.id}>
              <CardHeader><Download className="h-6 w-6 text-accent" /><CardTitle>{product?.title ?? "Digital download"}</CardTitle><CardDescription>{formatProductCategory(product?.category)} - downloads: {countLabel} - last used {formatDate(download.last_downloaded_at)}</CardDescription></CardHeader>
              <div className="px-6 pb-6">
                <form action={createDownloadUrlAction}>
                  <input type="hidden" name="downloadId" value={download.id} />
                  <Button type="submit" variant="accent">Generate 5-minute link</Button>
                </form>
              </div>
            </Card>
          );
        }) : <Empty label="No authorized downloads yet." />}
      </section>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-[1rem] border border-dashed border-white/10 p-6 text-sm text-muted-foreground">{label}</div>;
}
