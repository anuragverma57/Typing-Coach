import { Link } from 'react-router-dom'
import { LandingNav } from '../components/landing/LandingNav'
import { Button } from '../components/ui/Button'

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-surface-muted/50 p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
    </div>
  )
}

function ChartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Improve Your Typing
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
              Practice with structured lessons, track your progress, and get
              AI-powered insights to type faster and more accurately.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <Button className="px-6 py-3 text-base">Get Started</Button>
              </Link>
              <Link to="/app/lessons">
                <Button variant="secondary" className="px-6 py-3 text-base">
                  Browse Lessons
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--color-border)] bg-surface-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center text-2xl font-bold text-text-primary sm:text-3xl">
              Why Typing Coach?
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-text-secondary">
              Everything you need to build better typing habits
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<ChartIcon />}
                title="Track Progress"
                description="See your WPM and accuracy improve over time. Dashboard with stats, charts, and session history."
              />
              <FeatureCard
                icon={<SparklesIcon />}
                title="AI Analysis"
                description="Get detailed mistake reports, per-key accuracy heatmaps, and personalized improvement suggestions."
              />
              <FeatureCard
                icon={<BookIcon />}
                title="Structured Lessons"
                description="Learn step by step: home row, top row, bottom row, words, and sentences. Build skills systematically."
              />
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center text-2xl font-bold text-text-primary sm:text-3xl">
              Simple Pricing
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-text-secondary">
              Start for free. Upgrade when you need more.
            </p>
            <div className="mx-auto mt-12 max-w-md rounded-lg border border-[var(--color-border)] bg-surface-muted/50 p-8 shadow-sm">
              <div className="text-center">
                <p className="text-3xl font-bold text-text-primary">
                  Free
                  <span className="text-lg font-normal text-text-muted">
                    {' '}
                    forever
                  </span>
                </p>
                <ul className="mt-6 space-y-3 text-left text-sm text-text-secondary">
                  <li className="flex items-center gap-2">
                    <span className="text-correct">✓</span>
                    Unlimited typing practice
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-correct">✓</span>
                    All lessons & exercises
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-correct">✓</span>
                    Progress tracking & reports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-correct">✓</span>
                    Mistake analysis & suggestions
                  </li>
                </ul>
                <Link to="/signup" className="mt-6 block">
                  <Button className="w-full">Get Started Free</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[var(--color-border)] py-8">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-text-muted">
                © {new Date().getFullYear()} Typing Coach. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <Link
                  to="/app/lessons"
                  className="text-text-muted hover:text-text-primary"
                >
                  Lessons
                </Link>
                <Link
                  to="/login"
                  className="text-text-muted hover:text-text-primary"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="text-text-muted hover:text-text-primary"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
