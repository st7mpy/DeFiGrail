import { NextResponse } from "next/server";
import { getNewsData } from "@/lib/news";

// Cached for 30 min; the ticker (client) hits this for live data.
export const revalidate = 1800;

export async function GET() {
  const data = await getNewsData();
  return NextResponse.json(data);
}
