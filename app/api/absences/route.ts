import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { supabase } from '@/lib/supabase';

const isSupabaseConfigured = !!supabase;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  try {
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('absences').select('*').order('date', { ascending: false });
        if (studentId) {
          query = query.eq('student_id', studentId);
        }
        const { data, error } = await query;
        if (!error) {
          const response = NextResponse.json(data);
          response.headers.set('x-db-source', 'supabase');
          return response;
        }
        console.error('Supabase error:', error);
      } catch (sbError) {
        console.error('Supabase exception, falling back to SQLite:', sbError);
      }
    }

    const db = getDb();
    let queryStr = 'SELECT * FROM absences';
    let params = [];
    if (studentId) {
      queryStr += ' WHERE student_id = ?';
      params.push(studentId);
    }
    queryStr += ' ORDER BY date DESC';
    const absences = db.prepare(queryStr).all(...params);
    const response = NextResponse.json(absences);
    response.headers.set('x-db-source', 'sqlite');
    return response;
  } catch (error) {
    console.error('Error loading absences:', error);
    return NextResponse.json({ error: 'Failed to load absences' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { studentId, date } = await request.json();

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('absences')
          .insert([{ student_id: studentId, date }]);

        if (!error) return NextResponse.json({ success: true });
        console.error('Supabase error:', error);
      } catch (sbError) {
        console.error('Supabase exception, falling back to SQLite:', sbError);
      }
    }

    const db = getDb();
    db.prepare('INSERT INTO absences (student_id, date) VALUES (?, ?)').run(studentId, date);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording absence:', error);
    return NextResponse.json({ error: 'Failed to record absence' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('absences').delete().neq('id', 0);
        const { error: error2 } = await supabase.from('students').update({ absences: 0, consecutive: 0 }).neq('id', 0);
        if (!error && !error2) return NextResponse.json({ success: true });
        console.error('Supabase error, falling back to SQLite:', error || error2);
      } catch (sbError) {
        console.error('Supabase exception, falling back to SQLite:', sbError);
      }
    }

    const db = getDb();
    db.prepare('DELETE FROM absences').run();
    db.prepare('UPDATE students SET absences = 0, consecutive = 0, status = ?').run('Presente');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing absences:', error);
    return NextResponse.json({ error: 'Failed to clear absences' }, { status: 500 });
  }
}
