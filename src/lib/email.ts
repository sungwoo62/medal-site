import nodemailer from 'nodemailer'

type QuoteEmailData = {
  eventName: string;
  medalType: string;
  quantity: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  desiredDate: string | null;
  note: string | null;
};

function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendCustomerConfirmation(data: QuoteEmailData): Promise<void> {
  if (!data.contactEmail) return;

  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[email] SMTP_USER or SMTP_PASS not set — skipping customer confirmation');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: data.contactEmail,
      replyTo: 'hello@medaloffinisher.com',
      subject: '[메달오브피니셔] 견적 접수 확인',
      html: `
        <div style="font-family: 'Apple SD Gothic Neo', Malgun Gothic, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: #1a1a1a; padding: 24px 32px;">
            <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 700;">Medal of Finisher</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px; margin-top: 0;">${data.contactName} 님, 안녕하세요.</p>
            <p style="font-size: 15px; line-height: 1.7;">
              견적 신청이 정상적으로 접수되었습니다.<br>
              담당자가 확인 후 전화 또는 이메일로 연락드리겠습니다.
            </p>

            <div style="background: #f8f8f8; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
              <h2 style="font-size: 14px; font-weight: 700; margin: 0 0 16px; color: #555; text-transform: uppercase; letter-spacing: 0.5px;">접수 내용</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #888; width: 120px;">이벤트명</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.eventName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">메달 종류</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.medalType || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">수량</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.quantity.toLocaleString()}개</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">희망 납기일</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.desiredDate || '-'}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.7;">
              문의사항이 있으시면 아래 이메일 또는 전화로 연락주세요.
            </p>
          </div>
          <div style="background: #f0f0f0; padding: 20px 32px; font-size: 13px; color: #888;">
            <p style="margin: 0;">Medal of Finisher &nbsp;|&nbsp; hello@medaloffinisher.com</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[email] customer confirmation failed:', err);
  }
}

export async function sendAdminNotification(data: QuoteEmailData): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[email] SMTP_USER or SMTP_PASS not set — skipping admin notification');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'hello@medaloffinisher.com',
      replyTo: data.contactEmail || undefined,
      subject: `[새 견적] ${data.eventName} - ${data.contactName}`,
      html: `
        <div style="font-family: 'Apple SD Gothic Neo', Malgun Gothic, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: #1a1a1a; padding: 24px 32px;">
            <h1 style="color: #fff; margin: 0; font-size: 20px; font-weight: 700;">새 견적 신청</h1>
          </div>
          <div style="padding: 32px;">
            <div style="background: #f8f8f8; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
              <h2 style="font-size: 14px; font-weight: 700; margin: 0 0 16px; color: #555; text-transform: uppercase; letter-spacing: 0.5px;">견적 내용</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #888; width: 120px;">이벤트명</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.eventName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">메달 종류</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.medalType || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">수량</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.quantity.toLocaleString()}개</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">희망 납기일</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.desiredDate || '-'}</td>
                </tr>
              </table>
            </div>

            <div style="background: #f8f8f8; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
              <h2 style="font-size: 14px; font-weight: 700; margin: 0 0 16px; color: #555; text-transform: uppercase; letter-spacing: 0.5px;">담당자 정보</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #888; width: 120px;">성함</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.contactName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">연락처</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.contactPhone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888;">이메일</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.contactEmail || '-'}</td>
                </tr>
              </table>
            </div>

            ${data.note ? `
            <div style="background: #f8f8f8; border-radius: 8px; padding: 20px 24px;">
              <h2 style="font-size: 14px; font-weight: 700; margin: 0 0 12px; color: #555; text-transform: uppercase; letter-spacing: 0.5px;">요청사항</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${data.note}</p>
            </div>
            ` : ''}
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[email] admin notification failed:', err);
  }
}
