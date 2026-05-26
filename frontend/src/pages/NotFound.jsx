import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 Not Found — Chaitanya FrameMakers</title></Helmet>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
            className="text-9xl mb-8"
          >🖼️</motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-7xl font-bold brand-text mb-4"
          >404</motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl font-semibold mb-3" style={{ color: '#1a0000' }}
          >This page got lost in the frame</motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-10" style={{ color: '#888888' }}
          >The page you're looking for doesn't exist or has been moved.</motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/" className="btn-brand px-8 py-4">← Go Home</Link>
            <Link to="/products" className="btn-outline px-8 py-4">Browse Products</Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
