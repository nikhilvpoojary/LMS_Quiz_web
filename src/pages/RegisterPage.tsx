import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, GraduationCap, School, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export function RegisterPage() {
  return (
    <main className="login-page">
      <section className="login-panel register-panel">
        <Link aria-label="Back to landing page" className="back-link" to="/">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div className="page-heading register-heading">
          <p className="eyebrow">Create an account</p>
          <h1>Register</h1>
          <p className="panel-subtitle">Choose the workspace that matches your role.</p>
        </div>

        <div className="register-options">
          <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
            <Link className="register-option" to="/register/school">
              <span className="option-icon"><School aria-hidden="true" /></span>
              <span>Register School</span>
              <small>Set up institution access and approvals.</small>
              <ArrowRight aria-hidden="true" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
            <Link className="register-option" to="/register/teacher">
              <span className="option-icon"><UserRoundCheck aria-hidden="true" /></span>
              <span>Register Teacher</span>
              <small>Request access to your school workspace.</small>
              <ArrowRight aria-hidden="true" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
            <Link className="register-option" to="/register/student">
              <span className="option-icon"><GraduationCap aria-hidden="true" /></span>
              <span>Register Student</span>
              <small>Join a class with your school code.</small>
              <ArrowRight aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        <div className="trust-row">
          <ShieldCheck aria-hidden="true" />
          Approval-based access keeps every classroom private.
        </div>
      </section>
    </main>
  )
}
