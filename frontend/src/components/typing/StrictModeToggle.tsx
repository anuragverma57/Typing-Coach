type StrictModeToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function StrictModeToggle({
  checked,
  onChange,
  disabled,
}: StrictModeToggleProps) {
  const handleToggle = () => {
    if (!disabled) onChange(!checked)
  }
  return (
    <label
      className="flex items-center gap-3 cursor-pointer"
      onClick={handleToggle}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleToggle()
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-accent' : 'bg-surface-muted'
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <div>
        <span className="text-sm font-medium text-text-primary">
          Strict mode
        </span>
        <p className="text-xs text-text-muted">
          Must type correct character to advance.
        </p>
      </div>
    </label>
  )
}
