import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  try {
    let query = supabase.from('absences').select('*').order('date', { ascending: false });
    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error loading absences:', error);
      return NextResponse.json({ error: 'Failed to load absences' }, { status: 500 });
    }

    const response = NextResponse.json(data);
    response.headers.set('x-db-source', 'supabase');
    return response;
  } catch (error) {
    console.error('Error loading absences:', error);
    return NextResponse.json({ error: 'Failed to load absences' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { studentId, date } = await request.json();

    const { error } = await supabase
      .from('absences')
      .insert([{ student_id: studentId, date }]);

    if (error) {
      console.error('Supabase error recording absence:', error);
      return NextResponse.json({ error: 'Failed to record absence' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording absence:', error);
    return NextResponse.json({ error: 'Failed to record absence' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Delete all absences records
    const { error: absencesError } = await supabase
      .from('absences')
      .delete()
      .neq('id', 0);

    if (absencesError) {
      console.error('Supabase error clearing absences:', absencesError);
      return NextResponse.json({ error: 'Failed to clear absences' }, { status: 500 });
    }

    // Reset all student counters and status (bug fix: status was missing in original Supabase path)
    const { error: studentsError } = await supabase
      .from('students')
      .update({ absences: 0, consecutive: 0, status: 'Presente' })
      .neq('id', 0);

    if (studentsError) {
      console.error('Supabase error resetting students:', studentsError);
      return NextResponse.json({ error: 'Failed to reset student counters' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing absences:', error);
    return NextResponse.json({ error: 'Failed to clear absences' }, { status: 500 });
  }
}
