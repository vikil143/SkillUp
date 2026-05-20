// seed/skills/payments.js — Razorpay, CCAvenue
import { mk } from '../helpers.js';

export default function buildPaymentSkills() {
  return [
    mk('Razorpay', 'payments'),
    mk('CCAvenue', 'payments'),
  ];
}
