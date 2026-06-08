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
      console.error('Supabase error loading students:', JSON.stringify(error));
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

    // Remove 'initials' — campo calculado no frontend, não existe na tabela do Supabase
    const studentsToSave = students.map(({ initials, ...s }: { initials?: string; [key: string]: unknown }) => s);

    const { error } = await supabase
      .from('students')
      .upsert(studentsToSave, { onConflict: 'id' });

    if (error) {
      console.error('Supabase POST error:', JSON.stringify(error));
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

  try {
    if (id === 'all') {
      console.log('API: Clearing all database records (absences and students)...');
      // Delete absences first to avoid foreign key violation
      const { error: errorAbs } = await supabase.from('absences').delete().neq('id', 0);
      if (errorAbs) {
        console.error('Supabase error clearing absences table:', JSON.stringify(errorAbs));
        return NextResponse.json({ error: 'Failed to clear absences table: ' + errorAbs.message }, { status: 500 });
      }

      const { error: errorStu } = await supabase.from('students').delete().neq('id', 0);
      if (errorStu) {
        console.error('Supabase error clearing students table:', JSON.stringify(errorStu));
        return NextResponse.json({ error: 'Failed to clear students table: ' + errorStu.message }, { status: 500 });
      }

      console.log('API: Database cleared successfully.');
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Delete specific student - delete absences first to avoid foreign key issues
    const { error: errorAbs } = await supabase.from('absences').delete().eq('student_id', id);
    if (errorAbs) {
      console.error(`Supabase error deleting student ${id} absences:`, JSON.stringify(errorAbs));
      return NextResponse.json({ error: 'Failed to delete student absences: ' + errorAbs.message }, { status: 500 });
    }

    const { error: errorStu } = await supabase.from('students').delete().eq('id', id);
    if (errorStu) {
      console.error(`Supabase error deleting student ${id} from table:`, JSON.stringify(errorStu));
      return NextResponse.json({ error: 'Failed to delete student from table: ' + errorStu.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json({ error: 'Internal server error deleting student' }, { status: 500 });
  }
}
