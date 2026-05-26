const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const baseStyle = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: #0a0000; color: #fff; padding: 40px 0;
`;
const cardStyle = `
  max-width: 520px; margin: 0 auto;
  background: linear-gradient(145deg,#1e0505,#160404);
  border: 1px solid rgba(139,0,0,0.4); border-radius: 16px;
  overflow: hidden;
`;

const sendOTP = async (email, otp, purpose = 'login') => {
  const purposeLabel = purpose === 'register' ? 'Verify Your Account' : 'Login OTP';
  await transporter.sendMail({
    from:    process.env.MAIL_FROM || 'Chaitanya FrameMakers <noreply@chaitanyaframes.com>',
    to:      email,
    subject: `${purposeLabel} — Chaitanya FrameMakers`,
    html: `
<div style="${baseStyle}">
  <div style="${cardStyle}">
    <div style="background:linear-gradient(135deg,#CC0000,#8B0000);padding:32px;text-align:center;">
      <h1 style="margin:0;font-size:26px;color:#fff;letter-spacing:2px;">Chaitanya FrameMakers</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,.8);font-size:13px;">Premium Photo Frames & Gift Articles</p>
    </div>
    <div style="padding:40px 32px;text-align:center;">
      <h2 style="color:#CC0000;margin:0 0 8px;font-size:22px;">${purposeLabel}</h2>
      <p style="color:#ccc;font-size:14px;margin:0 0 32px;">Your one-time password is:</p>
      <div style="display:inline-block;background:linear-gradient(135deg,#CC0000,#8B0000);color:#fff;font-size:36px;font-weight:700;
                  letter-spacing:10px;padding:16px 32px;border-radius:12px;margin-bottom:24px;
                  box-shadow:0 0 30px rgba(204,0,0,0.4);">
        ${otp}
      </div>
      <p style="color:#888;font-size:13px;margin:0;">This OTP is valid for <strong style="color:#CC0000;">10 minutes</strong>.</p>
      <p style="color:#888;font-size:13px;margin:8px 0 0;">Never share this code with anyone.</p>
    </div>
    <div style="background:#0a0000;padding:20px;text-align:center;border-top:1px solid rgba(139,0,0,0.2);">
      <p style="color:#555;font-size:12px;margin:0;">© 2026 Chaitanya FrameMakers. All rights reserved.</p>
    </div>
  </div>
</div>`,
  });
};

const sendOrderConfirmation = async (email, order) => {
  await transporter.sendMail({
    from:    process.env.MAIL_FROM,
    to:      email,
    subject: `Order Confirmed #${order.order_number} — Chaitanya FrameMakers`,
    html: `
<div style="${baseStyle}">
  <div style="${cardStyle}">
    <div style="background:linear-gradient(135deg,#CC0000,#8B0000);padding:32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#fff;">🎉 Order Confirmed!</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#ccc;font-size:15px;">Thank you for your order. We're preparing your beautiful frames!</p>
      <div style="background:#1e0505;border:1px solid rgba(139,0,0,0.3);border-radius:10px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#CC0000;font-weight:600;">Order Details</p>
        <p style="margin:4px 0;color:#ccc;font-size:14px;">Order No: <strong style="color:#fff;">#${order.order_number}</strong></p>
        <p style="margin:4px 0;color:#ccc;font-size:14px;">Total: <strong style="color:#CC0000;">₹${order.total}</strong></p>
        <p style="margin:4px 0;color:#ccc;font-size:14px;">Status: <strong style="color:#4ade80;">Confirmed</strong></p>
      </div>
      <p style="color:#888;font-size:13px;">We'll notify you when your order ships. Estimated delivery: 5-7 business days.</p>
    </div>
    <div style="background:#0a0000;padding:20px;text-align:center;border-top:1px solid rgba(139,0,0,0.2);">
      <p style="color:#555;font-size:12px;margin:0;">© 2026 Chaitanya FrameMakers</p>
    </div>
  </div>
</div>`,
  });
};

module.exports = { sendOTP, sendOrderConfirmation };
