const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOrderConfirmation = async (user, order) => {
  try {
    const transporter = createTransporter();

    const inputs = JSON.parse(order.inputs);
    const pricing = JSON.parse(order.pricingSnapshot);

    const text = [
      `Order Confirmation`,
      ``,
      `Hello ${user.email},`,
      ``,
      `Your order has been placed successfully.`,
      ``,
      `Order ID: ${order.id}`,
      `Status: ${order.status}`,
      `Total Price: $${pricing.totalPrice.toFixed(2)}`,
      `Lead Time: ${pricing.leadTime} days`,
      ``,
      `Order Details:`,
      `  Material: ${inputs.material}`,
      `  Thickness: ${inputs.thickness}mm`,
      `  Quantity: ${inputs.quantity}`,
      `  Bends: ${inputs.bends}`,
      `  Finish: ${inputs.finish}`,
      ``,
      `Thank you for your order.`,
    ].join('\n');

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Order Confirmation – ${order.id}`,
      text,
    });
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
  }
};

module.exports = { sendOrderConfirmation };
