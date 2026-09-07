import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { reviewSubmission } from "@/lib/submissions";

export async function POST(req: NextRequest) {
  const { id, action } = await req.json().catch(() => ({}));
  if (!id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ ok: false, message: "bad request" }, { status: 400 });
  }
  const res = await reviewSubmission(id, action);
  if (res.ok && action === "approve") {
    // expire:0 rather than "max" — approving is a publish action a few times a
    // month, and stale-while-revalidate would show the admin the old list right
    // after they hit approve. A blocking revalidate here is the right trade.
    revalidateTag("submissions", { expire: 0 });
    revalidatePath("/");
    revalidatePath("/community");
    if (res.slug) revalidatePath(`/featured/${res.slug}`);
  }
  return NextResponse.json({ ok: res.ok, slug: res.slug }, { status: res.status });
}
