const nodemailer = require('nodemailer');

const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
 console.log('📨 New contact message:', { name, email, message });
  // Validate input
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Set up the Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Compose the email
    const mailOptions = {
      from: email,
      to: process.env.GMAIL_USER,
      subject: `New Contact Message from ${name}`,
      text: `Message: ${message}\n\nFrom: ${name}\nEmail: ${email}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    res.status(500).json({ message: 'Failed to send email. Please try again later.' });
  }
};

module.exports = {
  sendContactMessage,
};
