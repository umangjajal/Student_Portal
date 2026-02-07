import twilio from "twilio";

if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.warn("⚠️ Twilio credentials missing in .env");
}

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMSOTP = async (phone, otp) => {
  try {
    await client.messages.create({
      body: `Your Student Portal OTP is ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
  } catch (error) {
    console.error("❌ SMS OTP failed:", error.message);
    throw new Error("SMS OTP failed");
  }
};
