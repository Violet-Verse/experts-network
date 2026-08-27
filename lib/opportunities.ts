export interface NormalizedOpportunity {
  source: "hn" | "remoteok" | "wwr";
  external_id: string;
  type: "job";
  title: string;
  company: string | null;
  description: string | null;
  url: string | null;
  tags: string[];
  location: string | null;
  remote: boolean | null;
  posted_at: string | null;
}

const AI_KEYWORD_RE =
  /\b(ai|ml|llm|nlp|genai|gpt-?\d*|machine learning|artificial intelligence|generative ai|deep learning|data scien\w*)\b/i;

export function mentionsAi(...texts: (string | null | undefined)[]): boolean {
  return texts.some((t) => t && AI_KEYWORD_RE.test(t));
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/g, "/")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const HN_UA = "verso-network-opportunity-sync/1.0";

export async function fetchHnOpportunities(): Promise<NormalizedOpportunity[]> {
  const storySearch = await fetch(
    "https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&hitsPerPage=10",
    { headers: { "User-Agent": HN_UA } }
  );
  if (!storySearch.ok) throw new Error(`HN story search failed: ${storySearch.status}`);
  const storyData = (await storySearch.json()) as { hits: { objectID: string; title: string }[] };

  const thread = storyData.hits.find((h) => /who is hiring/i.test(h.title));
  if (!thread) return [];

  const commentSearch = await fetch(
    `https://hn.algolia.com/api/v1/search_by_date?tags=comment,story_${thread.objectID}&hitsPerPage=500`,
    { headers: { "User-Agent": HN_UA } }
  );
  if (!commentSearch.ok) throw new Error(`HN comment search failed: ${commentSearch.status}`);
  const commentData = (await commentSearch.json()) as {
    hits: {
      objectID: string;
      comment_text: string | null;
      created_at: string;
      parent_id: number;
    }[];
  };

  const results: NormalizedOpportunity[] = [];
  for (const hit of commentData.hits) {
    if (String(hit.parent_id) !== thread.objectID) continue; // only top-level posts
    if (!hit.comment_text) continue;
    const text = stripHtml(hit.comment_text);
    if (!mentionsAi(text)) continue;

    results.push({
      source: "hn",
      external_id: hit.objectID,
      type: "job",
      title: text.slice(0, 100),
      company: null,
      description: text.slice(0, 1000),
      url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
      tags: ["ai"],
      location: null,
      remote: null,
      posted_at: hit.created_at,
    });
  }
  return results;
}

interface RemoteOkJob {
  id?: string;
  position?: string;
  company?: string;
  tags?: string[];
  location?: string;
  description?: string;
  url?: string;
  apply_url?: string;
  date?: string;
}

export async function fetchRemoteOkOpportunities(): Promise<NormalizedOpportunity[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: { "User-Agent": HN_UA },
  });
  if (!res.ok) throw new Error(`RemoteOK fetch failed: ${res.status}`);
  const data = (await res.json()) as RemoteOkJob[];

  return data
    .filter((job) => job.id && job.position)
    .filter((job) => mentionsAi(job.position, (job.tags ?? []).join(" "), job.description))
    .map((job) => ({
      source: "remoteok" as const,
      external_id: String(job.id),
      type: "job" as const,
      title: job.position!,
      company: job.company ?? null,
      description: job.description ? stripHtml(job.description).slice(0, 1000) : null,
      url: job.url ?? job.apply_url ?? null,
      tags: job.tags ?? [],
      location: job.location ?? null,
      remote: true,
      posted_at: job.date ?? null,
    }));
}

interface WwrItem {
  title?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  category?: string | string[];
  guid?: string | { "#text"?: string };
}

export async function fetchWwrOpportunities(parseXml: (xml: string) => unknown): Promise<NormalizedOpportunity[]> {
  const res = await fetch("https://weworkremotely.com/categories/remote-programming-jobs.rss", {
    headers: { "User-Agent": HN_UA },
  });
  if (!res.ok) throw new Error(`We Work Remotely fetch failed: ${res.status}`);
  const xml = await res.text();
  const parsed = parseXml(xml) as { rss?: { channel?: { item?: WwrItem | WwrItem[] } } };
  const rawItems = parsed?.rss?.channel?.item;
  const items: WwrItem[] = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

  const results: NormalizedOpportunity[] = [];
  for (const item of items) {
    if (!item.title || !item.link) continue;
    const description = item.description ? stripHtml(item.description) : "";
    if (!mentionsAi(item.title, description)) continue;

    const [maybeCompany, ...rest] = item.title.split(":");
    const hasCompany = rest.length > 0;

    const guid = typeof item.guid === "string" ? item.guid : item.guid?.["#text"];
    const externalId = guid || item.link;
    const tags = Array.isArray(item.category) ? item.category : item.category ? [item.category] : [];

    results.push({
      source: "wwr",
      external_id: externalId,
      type: "job",
      title: hasCompany ? rest.join(":").trim() : item.title,
      company: hasCompany ? maybeCompany.trim() : null,
      description: description.slice(0, 1000) || null,
      url: item.link,
      tags,
      location: null,
      remote: true,
      posted_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    });
  }
  return results;
}
