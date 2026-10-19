import { NextRequest, NextResponse } from 'next/server';
import { savePaymentScreenshot, persistOrder } from '../../../lib/order-storage';
import { isValidPhoneNumber } from '../../../lib/phone';
export const runtime = "nodejs";
export const dynamic = "force-dynamic";


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

// Function to send image to Telegram (Fixed version)
async function sendImageToTelegram(file: File, caption: string) {
  try {
    console.log('📤 Sending image to Telegram...');

    // Create form data for file upload
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID!);
    formData.append('photo', file);
    formData.append('caption', caption);

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    console.log('📨 Telegram Photo API response:', result);

    if (!result.ok) {
      console.error('❌ Telegram Photo API error:', result);
      return { success: false, error: result.description };
    }

    console.log('✅ Telegram image sent successfully!');
    return { success: true, messageId: result.result.message_id };

  } catch (error) {
    console.error('❌ Telegram image upload error:', error);
    return { success: false, error: 'Network error while sending image to Telegram' };
  }
}

// Function to send order message to Telegram
async function sendOrderToTelegram(order: any) {
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

    console.log('📤 Sending order message to Telegram...');

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
    console.log('📨 Telegram Message API response:', result);

    if (!result.ok) {
      console.error('❌ Telegram Message API error:', result);
      return { success: false, error: result.description };
    }

    console.log('✅ Telegram order message sent successfully!');
    return { success: true, messageId: result.result.message_id };

  } catch (error) {
    console.error('❌ Telegram message error:', error);
    return { success: false, error: 'Network error while sending message to Telegram' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('screenshot') as File;
    const orderData = formData.get('orderData') as string;

    console.log('📸 File upload received:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // Increased to 10MB for better compatibility
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Parse order data
    let order = null;
    if (orderData) {
      try {
        order = JSON.parse(orderData);
        console.log('📦 Order data parsed:', order);
      } catch (e) {
        console.error('Error parsing order data:', e);
        return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
      }
    }

    if (!order?.customer?.name || !order?.customer?.phone || !Array.isArray(order.items) || order.items.length === 0) {
      return NextResponse.json({ error: 'Order details, customer name, and phone number are required' }, { status: 400 });
    }
    if (!isValidPhoneNumber(String(order.customer.phone))) {
      return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 });
    }

    let orderMessageResult = null;
    let imageResult = null;

    const screenshotUrl = await savePaymentScreenshot(file);
    const saved = persistOrder(order, screenshotUrl);

    // Step 1: Send order message
    if (order) {
      console.log('🚀 Sending order message...');
      orderMessageResult = await sendOrderToTelegram(order);
      
      if (!orderMessageResult.success) {
        console.error('❌ Failed to send order message');
      }
    }

    // Step 2: Send image with caption
    console.log('🚀 Sending image...');
    const customerName = order?.customer?.name || 'Customer';
    const caption = `💰 Payment Screenshot for order from ${customerName}\nTotal: $${order?.total || 'N/A'}`;
    
    imageResult = await sendImageToTelegram(file, caption);

    if (!imageResult.success) {
      return NextResponse.json({ 
        error: 'Failed to send image to Telegram: ' + imageResult.error 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Order and payment screenshot submitted successfully!',
      filename: file.name,
      orderSent: orderMessageResult?.success || false,
      imageSent: imageResult.success,
      orderId: saved.orderNumber,
      databaseOrderId: saved.orderId,
      screenshotUrl,
    });

  } catch (error) {
    console.error('❌ Upload API error:', error);
    return NextResponse.json({ error: 'Upload failed: ' + (error as Error).message }, { status: 500 });
  }
}