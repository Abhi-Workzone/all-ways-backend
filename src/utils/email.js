import nodemailer from 'nodemailer';
import config from '../config/index.js';
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass
  }
});
export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"AllWays" <${config.smtp.user}>`,
    to: email,
    subject: 'Verify Your Email - AllWays',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6C63FF; font-size: 28px; margin: 0;">AllWays</h1>
          <p style="color: #666; margin-top: 5px;">Your Home Services Partner</p>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; text-align: center;">
          <h2 style="color: white; margin-top: 0;">Email Verification</h2>
          <p style="color: rgba(255,255,255,0.9); font-size: 16px;">Your OTP code is:</p>
          <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <span style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: rgba(255,255,255,0.8); font-size: 14px;">This code expires in 10 minutes</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Email send error:', error);
    // In development, log the OTP to console
    if (config.nodeEnv === 'development') {
      console.log(`🔑 DEV OTP for ${email}: ${otp}`);
    }
  }
};
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};