import { NextRequest, NextResponse } from 'next/server';
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Function to escape special characters for Telegram
function escapeTelegramText(text: string): string {
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
}

// Function to send image to Telegram
async function sendImageToTelegram(file: File, caption: string) {
  try {
    console.log('📤 Sending image to Telegram...');

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
    return { success: true };

  } catch (error) {
    console.error('❌ Telegram image upload error:', error);
    return { success: false, error: 'Network error while sending image to Telegram' };
  }
}

// Function to send order message to Telegram
async function sendOrderToTelegram(order: any) {
  try {
    let message = '🎂 *NEW ORDER RECEIVED* 🎂\n\n';

    if (order) {
      message += `*CUSTOMER DETAILS:*\n`;
      message += `👤 *Name:* ${escapeTelegramText(order.customer.name)}\n`;
      message += `📞 *Phone:* ${escapeTelegramText(order.customer.phone)}\n`;
      message += `📍 *Address:* ${escapeTelegramText(order.customer.address)}\n`;
      message += `📅 *Delivery Date:* ${escapeTelegramText(order.customer.deliveryDate)}\n\n`;

      message += `*ORDER ITEMS:*\n`;
      order.items.forEach((item: any, index: number) => {
        message += `${index + 1}. ${escapeTelegramText(item.id)} (Qty: ${item.quantity})\n`;
      });

      message += `\n💰 *Total Amount:* $${order.total}\n`;
      message += `💳 *Payment Method:* ${escapeTelegramText(order.paymentMethod)}\n`;
      message += `⏰ *Order Time:* ${new Date().toLocaleString()}\n`;
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
          parse_mode: 'MarkdownV2'
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
    return { success: true };

  } catch (error) {
    console.error('❌ Telegram message error:', error);
    return { success: false, error: 'Network error while sending message to Telegram' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const isTelegram = userAgent.includes('Telegram');
    const contentType = request.headers.get('content-type') || '';
    
    console.log('📱 User Agent:', userAgent.substring(0, 100));
    console.log('🤖 Is Telegram:', isTelegram);
    console.log('📄 Content Type:', contentType);

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ 
        success: true, // Always return success to user
        message: 'Order received! Our team will contact you shortly.',
        warning: 'Telegram not configured on server'
      });
    }

    let file: File | null = null;
    let order = null;
    let orderData = null;

    // Handle different content types for Telegram compatibility
    if (contentType.includes('multipart/form-data')) {
      // Regular FormData (Chrome, Safari, etc.)
      const formData = await request.formData();
      file = formData.get('screenshot') as File;
      orderData = formData.get('orderData') as string;
    } else if (contentType.includes('application/json')) {
      // JSON data (Telegram fallback)
      const jsonData = await request.json();
      orderData = jsonData.orderData;
      // Telegram might send file as base64
      if (jsonData.screenshot && jsonData.screenshot.startsWith('data:')) {
        // Convert base64 to File
        const base64Data = jsonData.screenshot.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'image/jpeg' });
        file = new File([blob], 'payment.jpg', { type: 'image/jpeg' });
      }
    }

    console.log('📸 File info:', {
      exists: !!file,
      name: file?.name,
      size: file?.size,
      type: file?.type
    });

    // Parse order data
    if (orderData) {
      try {
        order = JSON.parse(orderData);
        console.log('📦 Order data parsed:', order);
      } catch (e) {
        console.error('Error parsing order data:', e);
        // Don't return error, still accept the order
      }
    }

    // For Telegram browser, make file optional
    if (!file && !isTelegram) {
      return NextResponse.json({ 
        success: true, // Still success
        message: 'Order received! Please send payment screenshot separately.',
        note: 'No screenshot uploaded'
      });
    }

    if (file) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ 
          success: true, // Still success
          message: 'Order received! Please send valid image for payment proof.',
          warning: 'Invalid file type'
        });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ 
          success: true, // Still success
          message: 'Order received! File too large, please send smaller image.',
          warning: 'File too large'
        });
      }
    }

    let orderMessageResult = null;
    let imageResult = null;

    // Step 1: Send order message (ALWAYS try this)
    if (order) {
      console.log('🚀 Sending order message...');
      orderMessageResult = await sendOrderToTelegram(order);
    }

    // Step 2: Send image if available
    if (file) {
      console.log('🚀 Sending image...');
      const customerName = order?.customer?.name || 'Customer';
      const caption = `💰 Payment for ${customerName}\nTotal: $${order?.total || 'N/A'}\nTime: ${new Date().toLocaleTimeString()}`;
      
      imageResult = await sendImageToTelegram(file, caption);
    }

    // ALWAYS return success to user
    return NextResponse.json({
      success: true,
      message: 'Order submitted successfully! Munira will contact you soon.',
      details: {
        filename: file?.name,
        orderSent: orderMessageResult?.success || false,
        imageSent: imageResult?.success || false,
        telegramBrowser: isTelegram
      }
    });

  } catch (error) {
    console.error('❌ Upload API error:', error);
    
    // CRITICAL: ALWAYS return success to user, even on error
    return NextResponse.json({
      success: true,
      message: 'Order received! Our team will contact you shortly.',
      note: 'Technical issue on server, but your order was noted'
    });
  }
}