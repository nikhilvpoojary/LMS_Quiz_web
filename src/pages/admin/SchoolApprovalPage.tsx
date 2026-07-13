import { Check, X, User, Mail, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { EmptyState, ErrorState, SkeletonGrid } from '../../components/common/StateViews'
import { useSchools } from '../../hooks/useSchools'
import { approveSchool, rejectSchool } from '../../services/registration'
import type { School } from '../../types/school'

const formatDate = (school: School) =>
  school.registrationDate?.toDate().toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  }) ?? 'Not available'

export function SchoolApprovalPage() {
  const { error, loading, schools } = useSchools('pending')

  const handleApprove = async (school: School) => {
    const schoolCode = await approveSchool(school.id, school.schoolName)
    toast.success(`School approved. Code: ${schoolCode}`)
  }

  const handleReject = async (school: School) => {
    await rejectSchool(school.id)
    toast.success('School rejected')
  }

  return (
    <main className="admin-content">
      <div className="page-heading">
        <p className="eyebrow">Realtime Queue</p>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 0 0' }}>School Approval Requests</h1>
      </div>

      {loading ? <SkeletonGrid items={3} /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && schools.length === 0 ? (
        <EmptyState message="No school registration requests yet." />
      ) : null}

      <section className="school-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
        {schools.map((school) => (
          <article 
            className="school-card glossy" 
            key={school.id}
            style={{
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '260px',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
          >
            <div>
              <div className="school-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="school-logo" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                  color: 'var(--sdb-primary)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  border: '1px solid rgba(79, 70, 229, 0.1)'
                }}>
                  {school.logoUrl ? (
                    <img alt={`${school.schoolName} logo`} src={school.logoUrl} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                  ) : (
                    school.schoolName.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="status-badge pending" style={{
                  background: '#FEF3C7',
                  color: '#D97706',
                  padding: '3px 8px',
                  borderRadius: '50px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Pending
                </span>
              </div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--sdb-text)', margin: '0 0 16px 0' }}>
                {school.schoolName}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--sdb-muted)' }}>
                  <User size={13} style={{ color: 'var(--sdb-primary)' }} />
                  <span>Principal:</span>
                  <span style={{ color: 'var(--sdb-text)', fontWeight: 600 }}>{school.principalName || 'Not provided'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--sdb-muted)' }}>
                  <Mail size={13} style={{ color: 'var(--sdb-primary)' }} />
                  <span>Email:</span>
                  <span style={{ color: 'var(--sdb-text)', fontWeight: 600 }}>{school.email || 'Not provided'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--sdb-muted)' }}>
                  <Calendar size={13} style={{ color: 'var(--sdb-primary)' }} />
                  <span>Submitted:</span>
                  <span style={{ color: 'var(--sdb-text)', fontWeight: 600 }}>{formatDate(school)}</span>
                </div>
              </div>
            </div>

            <div className="card-actions" style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--sdb-border)', paddingTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => handleApprove(school)}
                style={{
                  flex: 1,
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(34,197,94,0.15)',
                  transition: 'background 0.12s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#16a34a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#22c55e')}
              >
                <Check size={13} />
                Approve
              </button>
              <button 
                type="button" 
                onClick={() => handleReject(school)}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(239,68,68,0.15)',
                  transition: 'background 0.12s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
              >
                <X size={13} />
                Reject
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
