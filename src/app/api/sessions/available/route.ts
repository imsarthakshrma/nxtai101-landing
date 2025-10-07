import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Session } from '@/types/database';

export async function GET() {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('status', 'upcoming')
      .gt('session_date', new Date().toISOString())
      .lt('current_enrollments', supabase.from('sessions').select('max_capacity').eq('id', 'max_capacity'))
      .order('session_date', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    // Add computed fields
    const sessionsWithAvailability = (sessions as Session[]).map((session) => ({
      ...session,
      available_seats: session.max_capacity - session.current_enrollments,
      is_full: session.current_enrollments >= session.max_capacity,
    }));

    return NextResponse.json({
      success: true,
      sessions: sessionsWithAvailability,
    });
  } catch (error: any) {
    console.error('Error in available sessions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
