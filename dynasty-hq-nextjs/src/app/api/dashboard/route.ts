import { NextResponse } from 'next/server';
import { getDashboardData } from '@/lib/dashboard';

// Always hits the Sheets API fresh — same as the original, which re-read the
// spreadsheet on every doGet(). Runs on the Node runtime (not Edge) because
// googleapis needs Node's crypto module for the service-account JWT signing.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || String(err) }, { status: 500 });
  }
}
