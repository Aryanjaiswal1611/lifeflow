const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"LifeFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
};

const sendEmergencyAlert = async (donors, request) => {
  const subject = `🚨 EMERGENCY: ${request.bloodGroup} Blood Needed at ${request.hospitalName}`;
  const html = `
    <div style="font-family:Arial;max-width:600px;margin:auto;border:2px solid #dc2626;padding:20px;border-radius:10px;">
      <h1 style="color:#dc2626;text-align:center;">🚨 EMERGENCY BLOOD REQUEST</h1>
      <hr/>
      <p><strong>Blood Group:</strong> ${request.bloodGroup}</p>
      <p><strong>Units Required:</strong> ${request.unitsRequired}</p>
      <p><strong>Hospital:</strong> ${request.hospitalName}</p>
      <p><strong>Address:</strong> ${request.hospitalAddress}</p>
      <p><strong>Contact:</strong> ${request.contactNumber}</p>
      <p style="color:#dc2626;font-weight:bold;">Please donate if you are able. Every drop counts!</p>
    </div>
  `;

  for (const donor of donors) {
    await sendEmail({ to: donor.user.email, subject, html });
  }
};

module.exports = { sendEmail, sendEmergencyAlert };
