import { useNavigate } from 'react-router-dom'
import { useLessons } from '../hooks/useLessons'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import type { Lesson } from '../types/lesson'

const TYPE_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  home_row: 'Home Row',
  top_row: 'Top Row',
  bottom_row: 'Bottom Row',
  words: 'Words',
  sentences: 'Sentences',
  number_row: 'Number Row',
  paragraph: 'Paragraph',
  speed_challenge: 'Speed Challenge',
  code_typing: 'Code Typing',
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  intermediate: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  advanced: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
}

function StatusIcon({ status }: { status?: string }) {
  if (status === 'completed') {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-correct/20 text-correct">
        ✓
      </span>
    )
  }
  if (status === 'locked') {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-text-muted">
        🔒
      </span>
    )
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-accent">
      ▶
    </span>
  )
}

function LessonCard({
  lesson,
  onSelect,
}: {
  lesson: Lesson
  onSelect: () => void
}) {
  const isLocked = lesson.locked ?? lesson.status === 'locked'
  const difficulty = lesson.difficulty ?? 'beginner'
  const progress = lesson.progress ?? 0
  const status = lesson.status ?? 'not_started'
  const typeLabel = TYPE_LABELS[lesson.type] ?? lesson.type
  const difficultyStyle = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.beginner

  return (
    <Card
      className={`transition-colors ${
        isLocked
          ? 'cursor-not-allowed opacity-75'
          : 'cursor-pointer hover:bg-surface-muted'
      }`}
      onClick={isLocked ? undefined : onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-text-primary">{lesson.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-text-muted">
            {lesson.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${difficultyStyle}`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="text-xs text-text-muted">{typeLabel}</span>
          </div>
        </div>
        <StatusIcon status={status} />
      </div>
      {!isLocked && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  )
}

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced']

function groupByDifficulty(lessons: Lesson[]): Map<string, Lesson[]> {
  const map = new Map<string, Lesson[]>()
  for (const lesson of lessons) {
    const d = lesson.difficulty ?? 'beginner'
    const list = map.get(d) ?? []
    list.push(lesson)
    map.set(d, list)
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0))
  }
  return map
}

export function LessonsPage() {
  const navigate = useNavigate()
  const { lessons, loading, error, refetch } = useLessons()

  const handleFreePractice = () => {
    navigate('/app/practice', { state: { lesson: null } })
  }

  const handleAdaptivePractice = () => {
    navigate('/app/practice/adaptive')
  }

  const handleSelectLesson = (lesson: Lesson) => {
    if (lesson.locked ?? lesson.status === 'locked') return
    navigate('/app/practice', { state: { lesson } })
  }

  const grouped = groupByDifficulty(lessons)

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-xl font-medium text-text-primary">Lessons</h2>
          <p className="mt-1 text-sm text-text-muted">
            Choose a lesson to practice
          </p>
        </div>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-xl font-medium text-text-primary">Lessons</h2>
          <p className="mt-4 text-sm text-incorrect">{error}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="secondary" onClick={refetch}>
              Retry
            </Button>
            <Button onClick={handleFreePractice}>Free Practice Anyway</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-medium text-text-primary">Lessons</h2>
        <p className="mt-1 text-sm text-text-muted">
          Choose a lesson to practice or start with free practice
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">
            Free Practice
          </h3>
          <p className="text-sm text-text-muted">
            Type a sample paragraph with no specific focus. Good for warming up.
          </p>
          <Button onClick={handleFreePractice}>Start Free Practice</Button>
        </Card>
        <Card className="space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">
            Adaptive Practice
          </h3>
          <p className="text-sm text-text-muted">
            Personalized lines based on your mistakes. Each new line focuses on
            keys you struggle with.
          </p>
          <Button variant="secondary" onClick={handleAdaptivePractice}>
            Start Adaptive Practice
          </Button>
        </Card>
      </div>

      <div className="space-y-6">
        {DIFFICULTY_ORDER.map((difficulty) => {
          const list = grouped.get(difficulty)
          if (!list?.length) return null
          const title =
            difficulty.charAt(0).toUpperCase() + difficulty.slice(1) + ' Level'
          return (
            <div key={difficulty}>
              <h3 className="mb-4 text-sm font-medium text-text-secondary">
                {title}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    onSelect={() => handleSelectLesson(lesson)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
