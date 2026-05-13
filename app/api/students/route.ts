import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');

    if (error) {
      console.error('Supabase error loading students:', error);
      return NextResponse.json({ error: 'Failed to load students' }, { status: 500 });
    }

    const response = NextResponse.json(data);
    response.headers.set('x-db-source', 'supabase');
    return response;
  } catch (error) {
    console.error('Error loading students:', error);
    return NextResponse.json({ error: 'Failed to load students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const students = await request.json();

    const { error } = await supabase
      .from('students')
      .upsert(students, { onConflict: 'id' });

    if (error) {
      console.error('Supabase error saving students:', error);
      return NextResponse.json({ error: 'Failed to save students' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: students.length });
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
    const { error: error1 } = await supabase.from('students').delete().eq('id', id);
    const { error: error2 } = await supabase.from('absences').delete().eq('student_id', id);

    if (error1 || error2) {
      console.error('Supabase error deleting student:', error1 || error2);
      return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
