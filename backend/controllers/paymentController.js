const Razorpay = require('razorpay');
const crypto   = require('crypto');
const db       = require('../models/db');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
const createRazorpayOrder = async (req, res) => {
  try {
    const { order_id } = req.body;
    const [[order]] = await db.query('SELECT * FROM orders WHERE id=?', [order_id]);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(order.total * 100),
      currency: 'INR',
      receipt:  order.order_number,
      notes:    { order_id: order.id, order_number: order.order_number },
    });

    await db.query('UPDATE orders SET razorpay_order_id=? WHERE id=?', [rzpOrder.id, order.id]);

    res.json({
      success: true,
      razorpay_order_id: rzpOrder.id,
      amount:   rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id:   process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Payment initiation failed' });
  }
};

// POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Payment verification failed' });

    await db.query(
      `UPDATE orders SET payment_status='paid', status='confirmed',
       razorpay_pay_id=? WHERE id=?`,
      [razorpay_payment_id, order_id]
    );

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Payment verification error' });
  }
};

module.exports = { createRazorpayOrder, verifyPayment };
