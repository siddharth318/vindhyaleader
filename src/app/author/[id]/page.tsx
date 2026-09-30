import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import { prisma } from "@/lib/prisma";
import { SITE, SITE_URL, absoluteUrl, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

const loadAuthor = cache((id: string) => prisma.user.findUnique({ where: { id } }));

function authorDescription(author: { name: string; bio: string | null }) {
  return (
    author.bio ||
    `${author.name} — विंध्यलीडर (Vindhya Leader), राबर्ट्सगंज, सोनभद्र के संवाददाता। सोनभद्र व पूर्वांचल की ${author.name} द्वारा लिखी ताज़ा खबरें पढ़ें।`
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const author = await loadAuthor(id);
  if (!author) return {};
  return pageMetadata({
    title: `${author.name} — लेखक / संवाददाता`,
    description: authorDescription(author),
    path: `/author/${author.id}`,
  });
}

export default async function AuthorPage({ params }: Props) {
  const { id } = await params;
  const author = await loadAuthor(id);
  if (!author) notFound();

  const articles = await prisma.article.findMany({
    where: { authorId: id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 24,
    select: {
      slug: true,
      hindiTitle: true,
      excerpt: true,
      publishedAt: true,
      location: true,
      featuredImage: { select: { url: true, altText: true } },
      category: { select: { hindiName: true, slug: true } },
    },
  });

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      "@id": absoluteUrl(`/author/${author.id}#person`),
      name: author.name,
      url: absoluteUrl(`/author/${author.id}`),
      description: authorDescription(author),
      image: author.avatarUrl ? absoluteUrl(author.avatarUrl) : undefined,
      jobTitle: "संवाददाता (Reporter)",
      worksFor: { "@type": "NewsMediaOrganization", "@id": `${SITE_URL}/#organization`, name: SITE.nameHi },
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <div className="mb-6 flex items-center gap-4 border-b border-neutral-200 pb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-700 text-2xl font-bold text-white">
          {author.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl font-bold">{author.name}</h1>
          {author.bio && <p className="text-sm text-neutral-500">{author.bio}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} size="sm" />
        ))}
      </div>
    </div>
  );
}
