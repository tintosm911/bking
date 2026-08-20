// Next.js API route 模块声明 — 解决 Turbopack TS validator 的假报错
declare module "*/api/*/route" {
  import { NextRequest, NextResponse } from "next/server";
  export async function GET(req: NextRequest): Promise<NextResponse>;
  export async function POST(req: NextRequest): Promise<NextResponse>;
  export async function PUT(req: NextRequest): Promise<NextResponse>;
  export async function PATCH(req: NextRequest): Promise<NextResponse>;
  export async function DELETE(req: NextRequest): Promise<NextResponse>;
  export async function HEAD(req: NextRequest): Promise<NextResponse>;
}