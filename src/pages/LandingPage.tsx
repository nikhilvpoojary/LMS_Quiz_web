import { motion } from 'framer-motion'
import { ArrowRight, BookOpenCheck, Building2, GraduationCap, LogIn, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import heroImage from '../assets/hero.png'

export function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="hero-copy">
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
            initial={{ opacity: 0, y: 24 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <p className="eyebrow">Realtime school learning management</p>
            <h1>One calm command center for modern education.</h1>
            <p>
              Manage schools, students, teachers, approvals, and analytics with a
              fast Firebase-powered experience.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <Link to="/login">
                  Sign in
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register">Create account</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="hero-product"
          initial={{ opacity: 0, y: 28 }}
          transition={{ delay: 0.18, duration: 0.65 }}
        >
          <img alt="" src={heroImage} />
          <div className="portal-grid">
            <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
              <Link className="portal-card" to="/login">
                <LogIn aria-hidden="true" />
                <span>Login</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
              <Link className="portal-card" to="/register">
                <UserPlus aria-hidden="true" />
                <span>Register</span>
              </Link>
            </motion.div>
          </div>
          <div className="hero-metrics" aria-label="StudyHub platform areas">
            <span><Building2 aria-hidden="true" /> Schools</span>
            <span><GraduationCap aria-hidden="true" /> Students</span>
            <span><BookOpenCheck aria-hidden="true" /> Learning</span>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
