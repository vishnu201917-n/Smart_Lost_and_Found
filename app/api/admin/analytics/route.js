import { NextResponse } from "next/server";
import { getUser } from "../../../../lib/auth";
import { getActivityAnalytics } from "../../../../lib/mongo";

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Admin access only." }, { status: 403 });
  try {
    return NextResponse.json(await getActivityAnalytics());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
