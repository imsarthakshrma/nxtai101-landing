import { NextRequest, NextResponse } from 'next/server';
import { razorpayInstance, formatAmountToPaise } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase';
import type { Session, CreateEnrollmentData } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, amount, user_info } = body;

    // Validate required fields
    if (!session_id || !amount || !user_info) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { name, email, phone, company, linkedin_url } = user_info;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Fetch session and check capacity
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const typedSession = session as Session;

    // Check if session is full
    if (typedSession.current_enrollments >= typedSession.max_capacity) {
      return NextResponse.json(
        { error: 'Session is full' },
        { status: 400 }
      );
    }

    // Check if user already enrolled in this session
    const { data: existingEnrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('session_id', session_id)
      .eq('email', email)
      .single();

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this session' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: formatAmountToPaise(amount),
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
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
