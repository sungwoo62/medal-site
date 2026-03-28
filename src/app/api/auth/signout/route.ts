import { NextRequest, NextResponse } from 'next/server'
import { createAuthServerClient } from '@/lib/supabase/auth-server'

export async function POST(req: NextRequest) {
  const supabase = await createAuthServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', req.url), { status: 302 })
}
