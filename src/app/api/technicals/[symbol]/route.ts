import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/constants";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  const res = await fetch(`${BACKEND_URL}/api/screener/${symbol}/technicals`, {
    next: { revalidate: 60 * 60 * 8 }, // 8 hours
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Backend error: ${res.status} ${res.statusText}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
