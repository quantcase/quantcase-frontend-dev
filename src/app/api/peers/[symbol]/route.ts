import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/constants";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const body = await req.json();

  const res = await fetch(`${BACKEND_URL}/api/screener/${symbol}/peers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
