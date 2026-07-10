import { motion } from 'framer-motion'
import { LogIn, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="logo-mark"
          initial={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.55 }}
        >
          <motion.span
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.2 }}
          >
            SH
          </motion.span>
          <strong>StudyHub LMS</strong>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <p className="eyebrow">Realtime school learning management</p>
          <h1>One calm command center for modern education.</h1>
          <p>
            Manage schools, students, teachers, approvals, and analytics with a
            fast Firebase-powered experience.
          </p>
        </motion.div>

        <div className="portal-grid">
          <motion.div whileHover={{ y: -8 }} whileTap={{ scale: 0.97 }}>
            <Link className="portal-card" to="/login">
              <LogIn aria-hidden="true" />
              <span>Login</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -8 }} whileTap={{ scale: 0.97 }}>
            <Link className="portal-card" to="/register">
              <UserPlus aria-hidden="true" />
              <span>Register</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
