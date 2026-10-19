import { NextRequest, NextResponse } from 'next/server';
import { sendToTelegram } from '../telegram/route';
import { persistOrder } from '../../../lib/order-storage';
import { isValidPhoneNumber } from '../../../lib/phone';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    console.log('📦 Order API received:', orderData);

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    if (!orderData.customer?.name || !orderData.customer?.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }
    if (!isValidPhoneNumber(String(orderData.customer.phone))) {
      return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 });
    }

    const saved = persistOrder(orderData);

    console.log('✅ Order saved to database:', saved);

    const telegramResult = await sendToTelegram(orderData);
    console.log('📨 Order API Telegram result:', telegramResult);

    if (!telegramResult.success) {
      return NextResponse.json({ error: 'Failed to send to Telegram: ' + telegramResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order submitted successfully!',
      orderId: saved.orderNumber,
      databaseOrderId: saved.orderId,
    });

  } catch (error) {
    console.error('❌ Order API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}