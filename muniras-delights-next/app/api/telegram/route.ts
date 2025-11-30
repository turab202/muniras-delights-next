import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Function to escape special characters for Telegram
function escapeTelegramText(text: string): string {
  return text
    .replace(/\_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\~/g, '\\~')
    .replace(/\`/g, '\\`')
    .replace(/\>/g, '\\>')
    .replace(/\#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\-/g, '\\-')
    .replace(/\=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/\!/g, '\\!');
}

export async function sendToTelegram(order: any) {
  console.log('🔧 sendToTelegram called with:', { order });
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    const errorMsg = 'Telegram credentials missing. Check .env.local file.';
    console.error('❌', errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    let message = '🎂 NEW ORDER RECEIVED! 🎂\n\n';

    if (order) {
      message += `CUSTOMER DETAILS:\n`;
      message += `👤 Name: ${escapeTelegramText(order.customer.name)}\n`;
      message += `📞 Phone: ${escapeTelegramText(order.customer.phone)}\n`;
      message += `📍 Address: ${escapeTelegramText(order.customer.address)}\n`;
      message += `📅 Delivery Date: ${escapeTelegramText(order.customer.deliveryDate)}\n\n`;

      message += `ORDER ITEMS:\n`;
      order.items.forEach((item: any, index: number) => {
        message += `${index + 1}. ${escapeTelegramText(item.id)} (Qty: ${item.quantity})\n`;
      });

      message += `\n💰 Total Amount: $${order.total}\n`;
      message += `💳 Payment Method: ${escapeTelegramText(order.paymentMethod)}\n`;
      message += `⏰ Order Time: ${new Date().toLocaleString()}\n`;
    }

    console.log('📤 Sending to Telegram...');

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
        }),
      }
    );

    const result = await response.json();
    console.log('📨 Telegram API response:', result);

    if (!result.ok) {
      console.error('❌ Telegram API error:', result);
      return { success: false, error: result.description };
    }

    console.log('✅ Telegram message sent successfully!');
    return { success: true, messageId: result.result.message_id };

  } catch (error) {
    console.error('❌ Telegram network error:', error);
    return { success: false, error: 'Network error while sending to Telegram' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { order } = await request.json();
    console.log('📨 Telegram route called with:', { order });
    
    const result = await sendToTelegram(order);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order sent to Telegram successfully',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('❌ Telegram route error:', error);
    return NextResponse.json({ error: 'Failed to process Telegram request' }, { status: 500 });
  }
}