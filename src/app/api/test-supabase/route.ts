import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Check if Supabase client is initialized
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase client not initialized',
      }, { status: 500 });
    }

    // Test 2: Try to query sessions table
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error,
        message: error.message,
      }, { status: 500 });
    }

    // Test 3: Success!
    return NextResponse.json({
      success: true,
      message: 'Supabase connected successfully!',
      tableExists: true,
      rowCount: data?.length || 0,
      sampleData: data,
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: errorMessage,
    }, { status: 500 });
  }
}
