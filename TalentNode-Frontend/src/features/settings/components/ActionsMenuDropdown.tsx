import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type MenuPlacement = 'below' | 'above'

type ActionsMenuDropdownProps = {
  isOpen: boolean
  onToggle: () => void
  menuId: string
  ariaLabel: string
  children: ReactNode
}

const ActionsMenuDropdown = ({
  isOpen,
  onToggle,
  menuId,
  ariaLabel,
  children,
}: ActionsMenuDropdownProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<MenuPlacement>('below')

  useLayoutEffect(() => {
    if (!isOpen) return

    const updatePlacement = () => {
      const trigger = triggerRef.current
      const menu = menuRef.current
      if (!trigger) return

      const triggerRect = trigger.getBoundingClientRect()
      const menuHeight = menu?.offsetHeight ?? 48
      const gap = 4
      const spaceBelow = window.innerHeight - triggerRect.bottom - gap
      const spaceAbove = triggerRect.top - gap

      if (spaceBelow < menuHeight && spaceAbove >= menuHeight) {
        setPlacement('above')
      } else if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        setPlacement('above')
      } else {
        setPlacement('below')
      }
    }

    const raf = requestAnimationFrame(updatePlacement)
    window.addEventListener('resize', updatePlacement)
    window.addEventListener('scroll', updatePlacement, true)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', updatePlacement)
      window.removeEventListener('scroll', updatePlacement, true)
    }
  }, [isOpen])

  return (
    <div
      className="relative"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={ariaLabel}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        onClick={onToggle}
      >
        <span className="text-lg leading-none">⋮</span>
      </button>

      {isOpen ? (
        <div
          ref={menuRef}
          id={menuId}
          className={`absolute right-0 z-50 rounded-md border border-gray-200 bg-white shadow-lg ${
            placement === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default ActionsMenuDropdown
