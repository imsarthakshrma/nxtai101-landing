import { NextRequest, NextResponse } from 'next/server';
import { razorpayInstance, formatAmountToPaise } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase';
import type { Session, CreateEnrollmentData } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, user_info } = body;

    console.log('Create order request:', { session_id, user_info });

    // Validate required fields
    if (!session_id || !user_info) {
      console.error('Missing required fields:', { session_id, user_info });
      return NextResponse.json(
        { error: 'Missing required fields: session_id and user_info are required' },
        { status: 400 }
      );
    }

    const { name, email, phone, company, linkedin_url } = user_info;

    if (!name || !email || !phone) {
      console.error('Missing user info:', { name, email, phone });
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Fetch session and validate price
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      console.error('Session not found:', sessionError);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const typedSession = session as Session;

    // Validate session has a price
    if (!typedSession.price || typedSession.price <= 0) {
      console.error('Session has no valid price:', typedSession.price);
      return NextResponse.json(
        { error: 'Session price not configured' },
        { status: 400 }
      );
    }

    // Check if session is full
    if (typedSession.current_enrollments >= typedSession.max_capacity) {
      return NextResponse.json(
        { error: 'Session is full' },
        { status: 400 }
      );
    }

    // Check if user already has a SUCCESSFUL enrollment in this session
    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id, payment_status')
      .eq('session_id', session_id)
      .eq('email', email)
      .eq('payment_status', 'success')
      .maybeSingle();

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'You are already enrolled in this session' },
        { status: 400 }
      );
    }

    // Create Razorpay order using trusted session price
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: formatAmountToPaise(typedSession.price),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        session_id,
        session_title: typedSession.title,
        user_name: name,
        user_email: email,
      },
    });

    // Create enrollment record (status: pending)
    // The unique index on (session_id, email) WHERE payment_status = 'success' 
    // allows multiple pending/failed enrollments but prevents duplicate successful ones
    const enrollmentData: CreateEnrollmentData = {
      session_id,
      name,
      email,
      phone,
      company: company || null,
      linkedin_url: linkedin_url || null,
      razorpay_order_id: razorpayOrder.id,
      amount_paid: Number(razorpayOrder.amount),
      currency: razorpayOrder.currency,
    };

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert(enrollmentData)
      .select()
      .single();

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError);
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      enrollment_id: enrollment.id,
    });
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
