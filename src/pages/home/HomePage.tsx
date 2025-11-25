import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section>
      <h1>Telemetry Dashboard</h1>
      <p>Choose a section to get started.</p>
      <nav>
        <Link to="/vehicles">View vehicles</Link>
      </nav>
    </section>
  )
}

