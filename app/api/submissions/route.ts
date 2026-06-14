import { NextRequest, NextResponse } from "next/server";
import { submissionInput } from "@/lib/submission-schema";
import { hashIp } from "@/lib/ratelimit";
import { dbReady } from "@/lib/db";
import { recentCountForIp, insertSubmission } from "@/lib/submissions";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // honeypot — silently fake success so bots learn nothing
  if (body && typeof body.website === "string" && body.website !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = submissionInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  if (!dbReady) {
    return NextResponse.json({ ok: false, message: "Submissions are temporarily unavailable." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(ip);
  if ((await recentCountForIp(ipHash)) >= 3) {
    return NextResponse.json({ ok: false, message: "You've submitted recently — try again in an hour." }, { status: 429 });
  }

  const { website: _hp, ...data } = parsed.data;
  void _hp;
  await insertSubmission({ ...data, ipHash });
  return NextResponse.json({ ok: true }, { status: 201 });
}
