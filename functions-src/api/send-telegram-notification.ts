import { Request, Response } from 'express';

interface TelegramNotificationRequest {
  botToken: string;
  chatId: string;
  message: string;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { botToken, chatId, message }: TelegramNotificationRequest = req.body;

    if (!botToken || !chatId || !message) {
      res.status(400).json({ error: 'Missing required fields: botToken, chatId, message' });
      return;
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
      res.status(500).json({
        error: 'Failed to send Telegram message',
        details: error,
      });
      return;
    }

    const result = await response.json();

    res.status(200).json({
      success: true,
      messageId: result.result?.message_id,
      message: 'Notification sent successfully',
    });
  } catch (error) {
    console.error('Telegram notification error:', error);
    res.status(500).json({
      error: 'Failed to send notification',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
