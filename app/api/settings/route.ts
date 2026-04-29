import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { supabase } from '@/lib/supabase';

const isSupabaseConfigured = !!supabase;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  try {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('configs')
          .select('value')
          .eq('key', key)
          .single();

        if (!error && data) return NextResponse.json(data);
      } catch (sbError) {
        console.error('Supabase exception, falling back to SQLite:', sbError);
      }
    }

    const db = getDb();
    const config = db.prepare('SELECT value FROM configs WHERE key = ?').get(key);
    return NextResponse.json(config || { value: null });
  } catch (error) {
    console.error('Error loading config:', error);
    return NextResponse.json({ value: null });
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('configs')
          .upsert({ key, value }, { onConflict: 'key' });

        if (!error) return NextResponse.json({ success: true });
        console.error('Supabase error:', error);
      } catch (sbError) {
        console.error('Supabase exception, falling back to SQLite:', sbError);
      }
    }

    const db = getDb();
    db.prepare('INSERT OR REPLACE INTO configs (key, value) VALUES (?, ?)').run(key, value);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
