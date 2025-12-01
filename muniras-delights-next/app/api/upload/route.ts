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

// Function to send order message to Telegram
async function sendOrderToTelegram(order: any) {
  try {
    let message = '🎂 *NEW ORDER RECEIVED* 🎂\n\n';

    if (order) {
      message += `*CUSTOMER DETAILS:*\n`;
      message += `👤 *Name:* ${escapeTelegramText(order.customer?.name || 'Not provided')}\n`;
      message += `📞 *Phone:* ${escapeTelegramText(order.customer?.phone || 'Not provided')}\n`;
      message += `📍 *Address:* ${escapeTelegramText(order.customer?.address || 'Not provided')}\n`;
      message += `📅 *Delivery Date:* ${escapeTelegramText(order.customer?.deliveryDate || 'Not provided')}\n\n`;

      message += `*ORDER ITEMS:*\n`;
      (order.items || []).forEach((item: any, index: number) => {
        message += `${index + 1}. ${escapeTelegramText(item.id || 'Item')} (Qty: ${item.quantity || 0})\n`;
      });

      message += `\n💰 *Total Amount:* $${order.total || 0}\n`;
      message += `💳 *Payment Method:* ${escapeTelegramText(order.paymentMethod || 'bank_transfer')}\n`;
      message += `⏰ *Order Time:* ${new Date().toLocaleString()}\n`;
      message += `🌐 *Browser:* ${order.userAgent?.includes('Telegram') ? 'Telegram' : 'Regular Browser'}\n`;
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
  console.log('📨 ======= UPLOAD REQUEST STARTED =======');
  
  try {
    // Get request details
    const userAgent = request.headers.get('user-agent') || '';
    const contentType = request.headers.get('content-type') || '';
    const isTelegram = userAgent.includes('Telegram');
    
    console.log('📱 User Agent:', userAgent);
    console.log('🤖 Is Telegram:', isTelegram);
    console.log('📄 Content Type:', contentType);

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('❌ Telegram bot credentials missing');
      // Still return success to user
      return NextResponse.json({ 
        success: true,
        message: 'Order received! We will contact you shortly.',
        note: 'Telegram not configured'
      });
    }

    let orderData = null;
    
    // LOG THE ENTIRE REQUEST FOR DEBUGGING
    const requestClone = request.clone();
    const rawText = await requestClone.text();
    console.log('📝 Raw request body (first 1000 chars):', rawText.substring(0, 1000));
    console.log('📏 Raw body length:', rawText.length);

    // Try to parse based on content type
    if (contentType.includes('application/json')) {
      console.log('🔄 Attempting to parse as JSON...');
      try {
        const jsonData = JSON.parse(rawText);
        orderData = jsonData.orderData;
        console.log('✅ Successfully parsed as JSON');
      } catch (jsonError) {
        console.error('❌ JSON parse error:', jsonError);
      }
    } else if (contentType.includes('multipart/form-data')) {
      console.log('🔄 Attempting to parse as FormData...');
      try {
        // Re-create request for FormData parsing
        const formDataRequest = new Request(request);
        const formData = await formDataRequest.formData();
        const orderDataStr = formData.get('orderData') as string;
        
        if (orderDataStr) {
          orderData = JSON.parse(orderDataStr);
          console.log('✅ Successfully parsed as FormData');
        } else {
          console.log('⚠️ No orderData found in FormData');
        }
      } catch (formError) {
        console.error('❌ FormData parse error:', formError);
      }
    }

    // Last resort: try to extract JSON from raw text
    if (!orderData && rawText.includes('orderData')) {
      console.log('🔄 Attempting to extract orderData from raw text...');
      try {
        // Look for orderData in the raw text
        const orderMatch = rawText.match(/"orderData"\s*:\s*(\{[\s\S]*?\})(?=\s*,|\s*\})/);
        if (orderMatch) {
          orderData = JSON.parse(orderMatch[1]);
          console.log('✅ Successfully extracted orderData from text');
        }
      } catch (extractError) {
        console.error('❌ Extraction error:', extractError);
      }
    }

    // Debug what we found
    console.log('📦 Order data extracted:', !!orderData);
    if (orderData) {
      console.log('📋 Order details:', {
        name: orderData.customer?.name || 'No name',
        phone: orderData.customer?.phone || 'No phone',
        total: orderData.total || 0,
        itemsCount: orderData.items?.length || 0
      });
    } else {
      console.log('⚠️ Could not extract order data from request');
    }

    // Send to Telegram if we have order data
    if (orderData) {
      // Add user agent to order data
      orderData.userAgent = userAgent;
      
      console.log('🚀 Attempting to send to Telegram bot...');
      const telegramResult = await sendOrderToTelegram(orderData);
      
      if (telegramResult.success) {
        console.log('✅ Successfully sent order to Telegram bot');
      } else {
        console.error('❌ Failed to send to Telegram:', telegramResult.error);
        
        // Try a simpler fallback message
        try {
          const simpleMessage = `📱 ORDER:\nName: ${orderData.customer?.name}\nPhone: ${orderData.customer?.phone}\nTotal: $${orderData.total}`;
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: simpleMessage
            }),
          });
          console.log('✅ Sent fallback message to Telegram');
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
        }
      }
    } else {
      console.log('⚠️ No order data to send to Telegram');
      
      // Send an alert to Telegram about failed order
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `⚠️ Order attempt from ${isTelegram ? 'Telegram' : 'Browser'} but data parsing failed.\nUser Agent: ${userAgent.substring(0, 50)}`
          }),
        });
      } catch (alertError) {
        console.error('❌ Could not send alert:', alertError);
      }
    }

    console.log('✅ ======= UPLOAD REQUEST COMPLETED =======');
    
    // ALWAYS return success to the user
    return NextResponse.json({
      success: true,
      message: 'Order submitted successfully! Munira will contact you soon.',
      orderReceived: !!orderData,
      telegramBrowser: isTelegram,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ ======= API ERROR =======');
    console.error('Error:', error);
    console.error('===========================');
    
    // ALWAYS return success to user even on error
    return NextResponse.json({
      success: true,
      message: 'Order received! Our team will contact you shortly.',
      note: 'Server processed your request'
    });
  }
}