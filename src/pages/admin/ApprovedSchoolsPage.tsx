import { Clipboard, Search } from 'lucide-react'
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

  const filteredSchools = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    if (!normalizedSearch) {
      return schools
    }

    return schools.filter((school) =>
      `${school.schoolName} ${school.email} ${school.principalName}`
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [schools, search])

  const copyCode = async (schoolCode: string | undefined) => {
    if (!schoolCode) {
      return
    }

    await navigator.clipboard.writeText(schoolCode)
    toast.success('School Code Copied')
  }

  return (
    <main className="admin-content">
      <div className="page-heading split-heading">
        <div>
          <p className="eyebrow">Live Directory</p>
          <h1>Approved Schools</h1>
        </div>
        <label className="search-box">
          <Search aria-hidden="true" />
          <input
            placeholder="Search schools"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {loading ? <SkeletonGrid items={3} /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && filteredSchools.length === 0 ? (
        <EmptyState message="No approved schools found." />
      ) : null}

      <section className="table-card">
        {filteredSchools.map((school) => (
          <article className="table-row" key={school.id}>
            <div>
              <strong>{school.schoolName}</strong>
              <span>{school.email || 'No email'}</span>
            </div>
            <div>
              <span>{school.principalName || 'No principal listed'}</span>
              <button
                className="inline-copy-button"
                disabled={!school.schoolCode}
                type="button"
                onClick={() => copyCode(school.schoolCode)}
              >
                <Clipboard aria-hidden="true" />
                {school.schoolCode ?? 'No code'}
              </button>
            </div>
            <span className="status-badge approved">Approved</span>
            <time>{formatUpdatedAt(school)}</time>
          </article>
        ))}
      </section>
    </main>
  )
}
