import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Activity, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  School, 
  GraduationCap, 
  CheckCircle2,
  Compass,
  ArrowUpRight,
  Sun,
  Moon
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './LandingPage.css'

export function LandingPage() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lp-theme') || 'light'
  })

  useEffect(() => {
    localStorage.setItem('lp-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const }
    }
  }

  return (
    <main className={`landing-page-container ${theme}`}>
      {/* Background Animated Blobs */}
      <div className="bg-blobs" aria-hidden="true">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Navigation Header */}
      <header className="landing-navbar">
        <div className="navbar-content">
          <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="nav-logo-icon">SH</div>
            <span>StudyHub LMS</span>
          </div>

          <nav className="nav-links">
            <a className="nav-link" href="#features">Features</a>
            <a className="nav-link" href="#portals">Portals</a>
            <a className="nav-link" href="#metrics">Analytics</a>
          </nav>

          <div className="nav-actions">
            <button className="btn-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link className="btn-nav-login" to="/login">Sign In</Link>
            <Link className="btn-nav-register" to="/register">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-section hero-grid">
        <motion.div
          className="hero-text-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="badge-realtime">
            <span className="badge-pulse" aria-hidden="true"></span>
            Real-time Learning Management
          </div>
          <h1 className="hero-title">
            One calm command center for <span className="gradient-text">modern education</span>.
          </h1>
          <p className="hero-description">
            Connect administrators, teachers, and students instantly. Manage credentials, assignments,
            grades, and analytical reports through a blazing fast, Firebase-powered experience.
          </p>
          <div className="hero-ctas">
            <a className="btn-cta-primary" href="#portals">
              Explore Portals
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <Link className="btn-cta-secondary" to="/login">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Mockup Panel */}
        <motion.div
          className="mockup-container"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        >
          <motion.div 
            className="glass-dashboard"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Floating Widget 1 */}
            <div className="floating-widget widget-approval">
              <div className="widget-icon-box bg-purple">
                <GraduationCap size={18} />
              </div>
              <div className="widget-info">
                <span>Courses Enrolled</span>
                <strong>8 Active</strong>
              </div>
            </div>

            {/* Floating Widget 2 */}
            <div className="floating-widget widget-students">
              <div className="widget-icon-box bg-blue">
                <CheckCircle2 size={18} />
              </div>
              <div className="widget-info">
                <span>Tasks Finished</span>
                <strong>24 / 28</strong>
              </div>
            </div>

            <div className="mockup-header">
              <div className="mockup-profile">
                <div className="mockup-avatar" aria-hidden="true"></div>
                <div className="mockup-user">
                  <span>Welcome back,</span>
                  <h4>Wesley Matthews</h4>
                </div>
              </div>
              <div className="mockup-badge">Student</div>
            </div>

            <div className="mockup-grid">
              <div className="mockup-card">
                <span>Cumulative GPA</span>
                <h3>3.86 GPA</h3>
              </div>
              <div className="mockup-card">
                <span>Overall Attendance</span>
                <h3>96.8%</h3>
              </div>
            </div>

            <div className="mockup-chart">
              <div className="chart-header">
                <span>Daily Study Hours</span>
                <span>Mon - Fri</span>
              </div>
              <div className="chart-bars">
                <div className="chart-bar-container">
                  <div className="chart-bar" style={{ height: '35px' }}></div>
                  <span>M</span>
                </div>
                <div className="chart-bar-container">
                  <div className="chart-bar purple" style={{ height: '48px' }}></div>
                  <span>T</span>
                </div>
                <div className="chart-bar-container">
                  <div className="chart-bar yellow" style={{ height: '60px' }}></div>
                  <span>W</span>
                </div>
                <div className="chart-bar-container">
                  <div className="chart-bar purple" style={{ height: '40px' }}></div>
                  <span>T</span>
                </div>
                <div className="chart-bar-container">
                  <div className="chart-bar" style={{ height: '55px' }}></div>
                  <span>F</span>
                </div>
              </div>
            </div>

            <div className="mockup-list">
              <div className="mockup-list-title">Today's Class Schedule</div>
              <div className="mockup-list-item">
                <div>
                  <span className="mockup-status-dot"></span>
                  <span>The Complete Web Dev Bootcamp</span>
                </div>
                <small>09:00 AM</small>
              </div>
              <div className="mockup-list-item">
                <div>
                  <span className="mockup-status-dot"></span>
                  <span>Data Science Masterclass</span>
                </div>
                <small>02:00 PM</small>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="landing-section" id="features">
        <div className="section-header">
          <h2>Engineered for Excellence</h2>
          <p>
            An school ecosystem engineered with modern, cloud-first technologies to remove friction
            from administrative tasks and teaching processes.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <Activity size={24} aria-hidden="true" />
            </div>
            <h3>Real-time Synchronization</h3>
            <p>
              Built-in Firebase integration ensures grades, announcements, and registrations
              propagate instantly to all active devices.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Users size={24} aria-hidden="true" />
            </div>
            <h3>Role-Based Control</h3>
            <p>
              Dedicated login portals tailored specifically for site administrators, school principals,
              classroom teachers, and students.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <TrendingUp size={24} aria-hidden="true" />
            </div>
            <h3>Analytics Command</h3>
            <p>
              Comprehensive analytics track school onboarding progress, teacher assignments, and
              student grading averages.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <h3>Approval Verification</h3>
            <p>
              Strict registration pipeline ensures school profiles, educators, and pupils
              are thoroughly vetted before gaining portal access.
            </p>
          </div>
        </div>
      </section>

      {/* Role Portals Selection */}
      <section className="landing-section" id="portals">
        <div className="section-header">
          <h2>Select Your Experience</h2>
          <p>
            StudyHub supports unique workflows tailored to different stakeholders in the academic process.
            Choose your portal below to sign up.
          </p>
        </div>

        <motion.div
          className="portals-grid-landing"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* School Portal */}
          <motion.div className="portal-card-landing" variants={itemVariants}>
            <div className="portal-top-content">
              <div className="portal-card-icon" style={{ background: 'linear-gradient(135deg, var(--lp-primary) 0%, #003ebd 100%)' }}>
                <School size={24} aria-hidden="true" />
              </div>
              <h3>School Portal</h3>
              <p>Onboard your academic institution, register branches, track teaching rosters, and overview approvals.</p>
              <div className="portal-features-list">
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Institutional Analytics</span>
                </div>
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Teacher Approval Pipeline</span>
                </div>
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Administrative Control</span>
                </div>
              </div>
            </div>
            <Link className="btn-portal-action" to="/register/school">
              Register School
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Student Portal (Highlighted) */}
          <motion.div className="portal-card-landing highlight" variants={itemVariants}>
            <div className="portal-top-content">
              <div className="portal-card-icon" style={{ background: 'linear-gradient(135deg, var(--lp-yellow) 0%, #d9a014 100%)' }}>
                <GraduationCap size={24} aria-hidden="true" />
              </div>
              <h3>Student Portal</h3>
              <p>Access virtual coursework material, submit assignments, track grading metrics, and receive instant feedback.</p>
              <div className="portal-features-list">
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Personal Academic Roadmap</span>
                </div>
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Instant Assignment Uploads</span>
                </div>
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Real-time Grading Reports</span>
                </div>
              </div>
            </div>
            <Link className="btn-portal-action" to="/register/student">
              Register Student
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Teacher Portal */}
          <motion.div className="portal-card-landing" variants={itemVariants}>
            <div className="portal-top-content">
              <div className="portal-card-icon" style={{ background: 'linear-gradient(135deg, var(--lp-purple) 0%, #9033c4 100%)' }}>
                <Compass size={24} aria-hidden="true" />
              </div>
              <h3>Teacher Portal</h3>
              <p>Manage your schedules, design virtual classrooms, grade assignments, and monitor student metrics in real time.</p>
              <div className="portal-features-list">
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Live Gradebook Builder</span>
                </div>
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Real-time Student Tracking</span>
                </div>
                <div className="portal-feature-item">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>Assignment Submission Engine</span>
                </div>
              </div>
            </div>
            <Link className="btn-portal-action" to="/register/teacher">
              Register Teacher
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Metrics Section */}
      <section className="landing-section" id="metrics">
        <div className="metrics-panel">
          <div className="metric-item">
            <span className="metric-number">450+</span>
            <span className="metric-label">Verified Schools</span>
            <span className="metric-desc">Connected internationally</span>
          </div>
          <div className="metric-item">
            <span className="metric-number">18,400+</span>
            <span className="metric-label">Active Enrollees</span>
            <span className="metric-desc">Receiving live instruction</span>
          </div>
          <div className="metric-item">
            <span className="metric-number">3,500+</span>
            <span className="metric-label">Vetted Teachers</span>
            <span className="metric-desc">Designing online courses</span>
          </div>
          <div className="metric-item">
            <span className="metric-number">99.9%</span>
            <span className="metric-label">System Uptime</span>
            <span className="metric-desc">Powered by secure servers</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">SH</div>
              <span>StudyHub LMS</span>
            </div>
            <p>
              A professional real-time school and learning management center bringing structure, speed, and safety to classroom experiences.
            </p>
          </div>

          <div className="footer-column">
            <h4>Solutions</h4>
            <ul className="footer-links">
              <li><Link to="/register/school">Schools & Admin</Link></li>
              <li><Link to="/register/teacher">Academic Teachers</Link></li>
              <li><Link to="/register/student">Student Progression</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Security</h4>
            <ul className="footer-links">
              <li><a href="#features">Firebase Rules</a></li>
              <li><a href="#features">Vetting Flow</a></li>
              <li><a href="#features">Data Protection</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Connect</h4>
            <ul className="footer-links">
              <li><Link to="/login">Principal Login</Link></li>
              <li><Link to="/register">Open Enrollment</Link></li>
              <li><a href="mailto:support@studyhublms.com">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} StudyHub LMS. All rights reserved.</span>
          <div className="footer-socials">
            <span>Security Certified</span>
            <span>&bull;</span>
            <span>Real-time Active</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
