import { searchDocs } from "@/lib/search-index";

// Statically generated at build and served from the CDN — the palette fetches
// it once, on first open, so ~130KB of body text never rides the RSC payload
// of every page in the root layout.
export const dynamic = "force-static";

export function GET() {
  return Response.json(searchDocs());
}
