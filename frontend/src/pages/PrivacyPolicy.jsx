import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet><title>Privacy Policy — Chaitanya FrameMakers</title></Helmet>
      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-dark-400 text-sm mb-12">Last updated: January 1, 2026</p>

          <div className="space-y-10 text-dark-300 leading-relaxed">
            {[
              { title: '1. Information We Collect',
                body: 'We collect information you provide directly to us such as name, email address, phone number, delivery address and payment information when you make a purchase. We also collect usage data including pages visited, products viewed, and browsing behavior to improve our services.' },
              { title: '2. How We Use Your Information',
                body: 'We use your information to process orders, send order confirmations and shipping updates, provide customer support, send promotional emails (with your consent), improve our website and personalize your experience, and comply with legal obligations.' },
              { title: '3. Information Sharing',
                body: 'We do not sell, trade or rent your personal information to third parties. We may share information with trusted partners who assist us in operating our website and conducting business, as long as they agree to keep this information confidential. We may also share information when required by law.' },
              { title: '4. Payment Security',
                body: 'All payment transactions are processed through Razorpay, a PCI-DSS compliant payment gateway. We do not store your credit/debit card information on our servers. Your financial information is encrypted and transmitted securely.' },
              { title: '5. Cookies',
                body: 'We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can control cookie settings through your browser. Disabling cookies may affect some functionality of our website.' },
              { title: '6. Data Retention',
                body: 'We retain your personal data for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required by law. Order records are retained for 7 years for accounting purposes.' },
              { title: '7. Your Rights',
                body: 'You have the right to access, update, or delete your personal information at any time. You can do this through your account settings or by contacting us. You also have the right to opt out of marketing communications.' },
              { title: '8. Contact Us',
                body: 'For privacy-related questions or requests, contact us at privacy@chaitanyaframes.com or write to us at our registered address in Pune, Maharashtra, India.' },
            ].map(s => (
              <div key={s.title}>
                <h2 className="font-display text-xl font-bold text-white mb-3">{s.title}</h2>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
