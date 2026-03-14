import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-text-primary">404</h1>
      <p className="mt-4 text-xl font-medium text-text-secondary">
        Page Not Found
      </p>
      <p className="mt-2 text-sm text-text-muted">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to="/app/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  )
}
