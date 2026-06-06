// Email Notification Service (Demo - using console)
// For production, integrate with EmailJS, SendGrid, or a backend email API

const sendEmail = (to, subject, body) => {
  // Demo: Log to console
  console.log(`📧 Email sent to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  // Show notification to user
  if (Notification.permission === 'granted') {
    new Notification('Email Sent', { body: `Order update sent to ${to}` });
  }
  
  return true;
};

// Order Confirmation Email
export const sendOrderConfirmation = (orderDetails, userEmail, userName) => {
  const subject = `🎉 Order Confirmed! - ${orderDetails.orderId}`;
  const body = `
Hello ${userName},

Your order has been confirmed successfully!

Order Details:
━━━━━━━━━━━━━━━━━━━━━
Order ID: ${orderDetails.orderId}
Order Date: ${orderDetails.date}
Total Amount: ${orderDetails.totalAmount}
Payment Method: ${orderDetails.paymentMethod}
━━━━━━━━━━━━━━━━━━━━━

Items Ordered:
${orderDetails.items?.map(item => `- ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`).join('\n')}

Shipping Address:
${orderDetails.shippingAddress}

Estimated Delivery: 3-5 business days

Track your order: https://ecommerce-shophub-oijx.vercel.app

Thank you for shopping with ShopHub India!

Best regards,
ShopHub India Team
  `;
  
  return sendEmail(userEmail, subject, body);
};

// Order Status Update Email
export const sendOrderStatusUpdate = (orderId, newStatus, userEmail, userName) => {
  const subject = `📦 Order Status Update - ${orderId}`;
  const body = `
Hello ${userName},

Your order ${orderId} status has been updated to: ${newStatus.toUpperCase()}

${newStatus === 'Shipped' ? 'Your order has been shipped and will reach you soon!' : ''}
${newStatus === 'Delivered' ? 'Your order has been delivered. Enjoy your purchase!' : ''}
${newStatus === 'Cancelled' ? 'Your order has been cancelled as requested.' : ''}

Track your order: https://ecommerce-shophub-oijx.vercel.app

Thank you for shopping with ShopHub India!

Best regards,
ShopHub India Team
  `;
  
  return sendEmail(userEmail, subject, body);
};

// Welcome Email for New Users
export const sendWelcomeEmail = (userEmail, userName) => {
  const subject = '🎉 Welcome to ShopHub India!';
  const body = `
Hello ${userName},

Welcome to ShopHub India!

We're excited to have you on board. Here's what you can do:
✓ Browse thousands of products
✓ Add items to wishlist
✓ Track your orders
✓ Get exclusive offers

Start shopping now: https://ecommerce-shophub-oijx.vercel.app

Use code WELCOME10 for 10% off on your first order!

Best regards,
ShopHub India Team
  `;
  
  return sendEmail(userEmail, subject, body);
};

// Cart Reminder Email
export const sendCartReminder = (cartItems, userEmail, userName) => {
  const subject = '🛒 Don\'t forget your items!';
  const body = `
Hello ${userName},

You have ${cartItems.length} item(s) waiting in your cart:

${cartItems.map(item => `- ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`).join('\n')}

Complete your purchase now: https://ecommerce-shophub-oijx.vercel.app/cart

Hurry! Items may go out of stock.

Best regards,
ShopHub India Team
  `;
  
  return sendEmail(userEmail, subject, body);
};