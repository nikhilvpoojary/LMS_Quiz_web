import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/common/PageHeader'
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
      <PageHeader eyebrow="Realtime Queue" title="School Approval Requests" />

      {loading ? <SkeletonGrid items={3} /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && schools.length === 0 ? (
        <EmptyState message="No school registration requests yet." />
      ) : null}

      <section className="school-grid">
        {schools.map((school) => (
          <article className="school-card" key={school.id}>
            <div className="school-card-header">
              <div className="school-logo">
                {school.logoUrl ? (
                  <img alt={`${school.schoolName} logo`} src={school.logoUrl} />
                ) : (
                  school.schoolName.charAt(0).toUpperCase()
                )}
              </div>
              <span className="status-badge pending">Pending</span>
            </div>
            <h2>{school.schoolName}</h2>
            <dl>
              <div>
                <dt>Principal</dt>
                <dd>{school.principalName || 'Not provided'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{school.email || 'Not provided'}</dd>
              </div>
              <div>
                <dt>Registration Date</dt>
                <dd>{formatDate(school)}</dd>
              </div>
            </dl>
            <div className="card-actions">
              <button type="button" onClick={() => handleApprove(school)}>
                <Check aria-hidden="true" />
                Approve
              </button>
              <button type="button" onClick={() => handleReject(school)}>
                <X aria-hidden="true" />
                Reject
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
