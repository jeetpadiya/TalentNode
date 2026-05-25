import '../../../css/setting.css'

type SettingTabsProps = {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  setActiveTab: (index: number) => void;
  isAdmin: boolean;
}

const SETTING_MENUS = [
  { label: 'Organization', index: 1, adminOnly: true },
  { label: 'Team', index: 2, adminOnly: true },
  { label: 'Message Templates', index: 3, adminOnly: false },
  { label: 'Review Templates', index: 4, adminOnly: false },
  { label: 'Job Categories', index: 5, adminOnly: false },
] as const

const SideBar = ({
  activeIndex,
  setActiveIndex,
  setActiveTab,
  isAdmin,
}: SettingTabsProps) => {
  const visibleMenus = SETTING_MENUS.filter((menu) => isAdmin || !menu.adminOnly)

  return (
    <aside className="setting-sidebar scroll-none" aria-label="Settings navigation">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Personal
          </p>

          <button
            type="button"
            className={`setting-sidebar-btn setting-menu-btn ${
              activeIndex === 0 ? 'setting-menu-activebtn' : ''
            }`}
            onClick={() => setActiveIndex(0)}
          >
            User Preferences
          </button>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Workspace
          </p>

          <div className="mt-2 space-y-1">
            {visibleMenus.map(({ label, index: menuIndex }) => {
              const isActive = activeIndex === menuIndex

              const handleClick = () => {
                setActiveIndex(menuIndex)
                setActiveTab(0)
              }

              return (
                <div key={label} className="space-y-1">
                  <button
                    type="button"
                    className={`setting-sidebar-btn setting-menu-btn ${
                      isActive ? 'setting-menu-activebtn' : ''
                    }`}
                    onClick={handleClick}
                    aria-pressed={isActive}
                  >
                    <span>{label}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default SideBar
