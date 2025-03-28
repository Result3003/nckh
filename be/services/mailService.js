const nodemailer = require("nodemailer");

const sendMail = async (htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sangmn001@gmail.com",
      pass: "cpvt zfrf uvuy ghxt",
    },
  });

  const mailOptions = {
    from: "QUẢN LÍ CÂY TRỒNG",
    to: "sangmn001@gmail.com",
    subject: "MAIL TỰ ĐỘNG TỪ BOT QUẢN LÍ",
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email.", error };
  }
};

module.exports = { sendMail };
