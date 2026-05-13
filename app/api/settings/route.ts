import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  try {
    const { data, error } = await supabase
      .from('configs')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      // PostgREST returns error code PGRST116 when no rows found — treat as null value
      if (error.code === 'PGRST116') {
        return NextResponse.json({ value: null });
      }
      console.error('Supabase error loading config:', error);
      return NextResponse.json({ value: null });
    }

    return NextResponse.json(data || { value: null });
  } catch (error) {
    console.error('Error loading config:', error);
    return NextResponse.json({ value: null });
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();

    const { error } = await supabase
      .from('configs')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      console.error('Supabase error saving config:', error);
      return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
