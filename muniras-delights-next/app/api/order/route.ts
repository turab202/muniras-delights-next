import { NextRequest, NextResponse } from 'next/server';
import { sendToTelegram } from '../telegram/route';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    console.log('📦 Order API received:', orderData);

    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    if (!orderData.customer?.name || !orderData.customer?.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    console.log('✅ Order validated, sending to Telegram...');

    // Send to Telegram
    const telegramResult = await sendToTelegram(orderData);

    console.log('📨 Order API Telegram result:', telegramResult);

    if (!telegramResult.success) {
      return NextResponse.json({ error: 'Failed to send to Telegram: ' + telegramResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order submitted successfully!',
      orderId: telegramResult.messageId
    });

  } catch (error) {
    console.error('❌ Order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}