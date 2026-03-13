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
}

function LessonCard({
  lesson,
  onSelect,
}: {
  lesson: Lesson
  onSelect: () => void
}) {
  const label = TYPE_LABELS[lesson.type] ?? lesson.type

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-surface-muted"
      onClick={onSelect}
    >
      <h3 className="font-medium text-text-primary">{lesson.name}</h3>
      <p className="mt-1 text-sm text-text-muted line-clamp-2">
        {lesson.description}
      </p>
      <span className="mt-2 inline-block text-xs text-accent">{label}</span>
    </Card>
  )
}

export function LessonsPage() {
  const navigate = useNavigate()
  const { lessons, loading, error, refetch } = useLessons()

  const handleFreePractice = () => {
    navigate('/practice', { state: { lesson: null } })
  }

  const handleSelectLesson = (lesson: Lesson) => {
    navigate('/practice', { state: { lesson } })
  }

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
            <Button onClick={handleFreePractice}>
              Free Practice Anyway
            </Button>
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

      <Card className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">
          Free Practice
        </h3>
        <p className="text-sm text-text-muted">
          Type a sample paragraph with no specific focus. Good for warming up.
        </p>
        <Button onClick={handleFreePractice}>Start Free Practice</Button>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">
          Structured Lessons
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onSelect={() => handleSelectLesson(lesson)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
