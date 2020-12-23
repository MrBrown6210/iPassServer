import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME, // your email
    pass: process.env.EMAIL_PASSWORD, // your email password
  },
});

export { transporter };
