import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export const revalidate = 0;

export async function GET() {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'app-ads')
    .single();

  const content = data?.value || '# app-ads.txt belum dikonfigurasi';
  
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
