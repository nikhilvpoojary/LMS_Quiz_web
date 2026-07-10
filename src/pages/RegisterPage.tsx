import { motion } from 'framer-motion'
import { ArrowLeft, GraduationCap, School, UserRoundCheck } from 'lucide-react'
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
        </div>

        <div className="register-options">
          <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
            <Link className="register-option" to="/register/school">
              <School aria-hidden="true" />
              <span>Register School</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
            <Link className="register-option" to="/register/teacher">
              <UserRoundCheck aria-hidden="true" />
              <span>Register Teacher</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
            <Link className="register-option" to="/register/student">
              <GraduationCap aria-hidden="true" />
              <span>Register Student</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
