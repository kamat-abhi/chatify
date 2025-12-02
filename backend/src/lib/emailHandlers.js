import nodemailer from "nodemailer";
import { createWelcomeEmailTemplate } from "./emailTemplate.js";
import { ENV } from "./env.js";

const sendEmail = async (email, name, clientURL) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: `"Chatify family" <${ENV.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Chatify",
      html: createWelcomeEmailTemplate(name, clientURL),
    };

    // 3️⃣ Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully: ", info.response);
  } catch (error) {
    console.error("❌ Error sending email: ", error);
  }
};

export default sendEmail;
