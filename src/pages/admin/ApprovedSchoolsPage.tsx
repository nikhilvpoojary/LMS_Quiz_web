import { Clipboard, Search, Check, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { EmptyState, ErrorState, SkeletonGrid } from '../../components/common/StateViews'
import { useSchools } from '../../hooks/useSchools'
import type { School } from '../../types/school'

const formatUpdatedAt = (school: School) =>
  school.updatedAt?.toDate().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }) ?? 'Not available'

export function ApprovedSchoolsPage() {
  const { error, loading, schools } = useSchools('approved')
  const [search, setSearch] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'code' | 'email' | 'name'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)

  const filteredSchools = useMemo(() => {
    let result = [...schools]
    const normalizedSearch = search.trim().toLowerCase()

    if (normalizedSearch) {
      result = result.filter((school) => {
        const matchesName = school.schoolName?.toLowerCase().includes(normalizedSearch)
        const matchesEmail = school.email?.toLowerCase().includes(normalizedSearch)
        const matchesPrincipal = school.principalName?.toLowerCase().includes(normalizedSearch)
        const matchesCode = school.schoolCode?.toLowerCase().includes(normalizedSearch)

        if (searchType === 'code') return matchesCode
        if (searchType === 'email') return matchesEmail
        if (searchType === 'name') return matchesName

        return matchesName || matchesEmail || matchesPrincipal || matchesCode
      })
    }

    result.sort((a, b) => {
      const timeA = a.updatedAt?.toDate().getTime() ?? 0
      const timeB = b.updatedAt?.toDate().getTime() ?? 0
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
    })

    return result
  }, [schools, search, searchType, sortOrder])

  const copyCode = async (e: React.MouseEvent, schoolCode: string | undefined) => {
    e.stopPropagation()
    if (!schoolCode) {
      return
    }

    await navigator.clipboard.writeText(schoolCode)
    setCopiedCode(schoolCode)
    toast.success('School Code Copied')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <main className="admin-content">
      <div className="page-heading split-heading" style={{ marginBottom: '16px' }}>
        <div>
          <p className="eyebrow">Live Directory</p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 0 0' }}>Approved Schools</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select 
            className="tdb-select"
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value as any)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--sdb-border)', fontSize: '0.8rem' }}
          >
            <option value="all">Search All Fields</option>
            <option value="name">Search by School Name</option>
            <option value="code">Search by School Code</option>
            <option value="email">Search by Principal Email</option>
          </select>
          <select 
            className="tdb-select"
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value as any)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--sdb-border)', fontSize: '0.8rem' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <label className="search-box" style={{ margin: 0 }}>
            <Search aria-hidden="true" />
            <input
              placeholder="Filter directory..."
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
      </div>

      {loading ? <SkeletonGrid items={3} /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && filteredSchools.length === 0 ? (
        <EmptyState message="No approved schools found." />
      ) : null}

      <section className="table-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
        {filteredSchools.map((school, index) => (
          <article 
            className="table-row" 
            key={school.id}
            onClick={() => setSelectedSchool(school)}
            style={{
              background: index % 2 === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(248,250,252,0.8)',
              border: '1px solid var(--sdb-border)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background 0.12s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(248,250,252,0.8)')}
          >
            <div>
              <strong style={{ display: 'block', fontSize: '0.86rem', color: 'var(--sdb-text)' }}>{school.schoolName}</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--sdb-muted)' }}>{school.email || 'No email'}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--sdb-text)' }}>{school.principalName || 'No principal'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                className="inline-copy-button"
                disabled={!school.schoolCode}
                type="button"
                onClick={(e) => copyCode(e, school.schoolCode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(79,70,229,0.05)',
                  border: '1px solid rgba(79,70,229,0.1)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  color: 'var(--sdb-primary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {copiedCode === school.schoolCode ? (
                  <Check size={11} style={{ color: '#22c55e' }} />
                ) : (
                  <Clipboard size={11} />
                )}
                {school.schoolCode ?? 'No code'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="status-badge approved" style={{
                background: '#DCFCE7',
                color: '#16A34A',
                padding: '2px 8px',
                borderRadius: '50px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>
                Approved
              </span>
              <time style={{ fontSize: '0.72rem', color: 'var(--sdb-subtle)' }}>
                {school.updatedAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </time>
            </div>
          </article>
        ))}
      </section>

      {/* Dynamic Interactive School Details Modal Card */}
      {selectedSchool && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: '#fff',
            border: '1px solid var(--sdb-border)',
            borderRadius: '16px',
            width: '400px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedSchool(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--sdb-muted)'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                color: 'var(--sdb-primary)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}>
                {selectedSchool.logoUrl ? (
                  <img alt={`${selectedSchool.schoolName} logo`} src={selectedSchool.logoUrl} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                ) : (
                  selectedSchool.schoolName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--sdb-text)', margin: 0 }}>{selectedSchool.schoolName}</h3>
                <span className="status-badge approved" style={{
                  background: '#DCFCE7',
                  color: '#16A34A',
                  padding: '1px 6px',
                  borderRadius: '50px',
                  fontSize: '0.64rem',
                  fontWeight: 700
                }}>
                  Active
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', borderTop: '1px solid var(--sdb-border)', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sdb-muted)' }}>School Code</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--sdb-primary)' }}>{selectedSchool.schoolCode ?? 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sdb-muted)' }}>Principal Name</span>
                <span style={{ fontWeight: 600, color: 'var(--sdb-text)' }}>{selectedSchool.principalName || 'Not listed'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sdb-muted)' }}>Email Address</span>
                <span style={{ fontWeight: 600, color: 'var(--sdb-text)' }}>{selectedSchool.email || 'Not listed'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sdb-muted)' }}>Approval Time</span>
                <span style={{ fontWeight: 600, color: 'var(--sdb-text)' }}>{formatUpdatedAt(selectedSchool)}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedSchool(null)}
              style={{
                width: '100%',
                background: 'var(--sdb-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
