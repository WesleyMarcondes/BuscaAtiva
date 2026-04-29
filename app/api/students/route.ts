import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { supabase } from '@/lib/supabase';

const isSupabaseConfigured = !!supabase;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('name');

        if (!error) {
          const response = NextResponse.json(data);
          response.headers.set('x-db-source', 'supabase');
          return response;
        }
        console.error('Supabase error, falling back to SQLite:', error);
      } catch (sbError) {
        console.error('Supabase exception, falling back to SQLite:', sbError);
      }
    }

    const db = getDb();
    const students = db.prepare('SELECT * FROM students ORDER BY name ASC').all();
    const response = NextResponse.json(students);
    response.headers.set('x-db-source', 'sqlite');
    return response;
  } catch (error) {
    console.error('Error loading students:', error);
    return NextResponse.json({ error: 'Failed to load students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const students = await request.json();

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('students')
          .upsert(students, { onConflict: 'id' });

        if (!error) return NextResponse.json({ success: true, count: students.length });
        console.error('Supabase error:', error);
      } catch (sbError) {
        console.error('Supabase exception, falling back to SQLite:', sbError);
      }
    }

    const db = getDb();
    const insert = db.prepare(`
      INSERT OR REPLACE INTO students (id, name, class, responsible, phone, absences, consecutive, status, last_notified, atestado_end_date, observations)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((students: any[]) => {
      for (const student of students) {
        insert.run(
          student.id,
          student.name,
          student.class,
          student.responsible,
          student.phone,
          student.absences,
          student.consecutive,
          student.status,
          student.last_notified || null,
          student.atestado_end_date || null,
          student.observations || null
        );
      }
    });

    transaction(students);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving students:', error);
    return NextResponse.json({ error: 'Failed to save students' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
  }

  try {
    if (isSupabaseConfigured) {
      try {
        const { error: error1 } = await supabase.from('students').delete().eq('id', id);
        const { error: error2 } = await supabase.from('absences').delete().eq('student_id', id);

        if (!error1 && !error2) return NextResponse.json({ success: true });
        console.error('Supabase error, falling back to SQLite:', error1 || error2);
      } catch (sbError) {
        console.error('Supabase exception, falling back to SQLite:', sbError);
      }
    }

    const db = getDb();
    db.prepare('DELETE FROM students WHERE id = ?').run(id);
    db.prepare('DELETE FROM absences WHERE student_id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
