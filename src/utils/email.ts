import nodemailer from "nodemailer";

interface emailProps {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: emailProps) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT)!,

    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Adrian B <bikersdevelopment@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
