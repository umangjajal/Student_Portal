import nodemailer from "nodemailer";

// Configure transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/* =========================
   SEND OTP EMAIL
========================= */
export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const subject = "Password Reset OTP - Student Portal";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Hello ${userName},</p>
          
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
            You have requested to reset your password. Please use the OTP below to complete the process.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
              ${otp}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin: 20px 0;">
            <strong>Important:</strong> This OTP will expire in 10 minutes. Do not share this code with anyone.
          </p>
          
          <p style="color: #666; font-size: 14px; margin: 20px 0;">
            If you did not request a password reset, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            Student Portal - Password Reset System<br>
            © 2024 All rights reserved.
          </p>
        </div>
      </div>
    `;

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent
    });

    return result;
  } catch (error) {
    console.error("Send OTP Email Error:", error);
    throw new Error("Failed to send OTP email");
  }
};

/* =========================
   SEND NOTIFICATION EMAIL
========================= */
export const sendNotificationEmail = async (email, title, message, userName) => {
  try {
    const subject = `New Notification: ${title}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">${title}</h2>
          
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Hello ${userName},</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #007bff; border-radius: 4px; margin: 20px 0;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">${message}</p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin: 20px 0;">
            Please log in to the Student Portal for more details.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            Student Portal<br>
            © 2024 All rights reserved.
          </p>
        </div>
      </div>
    `;

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent
    });

    return result;
  } catch (error) {
    console.error("Send Notification Email Error:", error);
    throw new Error("Failed to send notification email");
  }
};

/* =========================
   SEND WELCOME EMAIL
========================= */
export const sendWelcomeEmail = async (email, loginId, password, userName, role) => {
  try {
    const subject = `Welcome to Student Portal - ${role} Account`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to Student Portal!</h2>
          
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">Hello ${userName},</p>
          
          <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
            Your ${role} account has been created successfully. Here are your login credentials:
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Login ID:</strong> ${loginId}</p>
            <p style="margin: 10px 0;"><strong>Password:</strong> ${password}</p>
            <p style="margin: 10px 0;"><strong>Role:</strong> ${role}</p>
          </div>
          
          <p style="color: #e74c3c; font-size: 14px; margin: 20px 0;">
            <strong>⚠️ Important:</strong> Please change your password immediately after logging in.
          </p>
          
          <p style="color: #666; font-size: 14px; margin: 20px 0;">
            You can now log in to the portal using your credentials above.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            Student Portal<br>
            © 2024 All rights reserved.
          </p>
        </div>
      </div>
    `;

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent
    });

    return result;
  } catch (error) {
    console.error("Send Welcome Email Error:", error);
    throw new Error("Failed to send welcome email");
  }
};
