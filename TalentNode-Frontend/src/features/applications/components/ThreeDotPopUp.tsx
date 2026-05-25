import type { LabelProp } from "../../../types/types";


const ThreeDotPopUp = ({
  showFirstMenu = true,
  showSecondMenu = true,
  showThirdMenu = false,
  firstmenutext = 'Edit candidate',
  secondmenutext = 'Delete candidate',
  thirdmenutext,
  onFirstClick,
  onSecondClick,
  onThirdClick,
}: LabelProp) => {
  return (
    <div className="w-44 py-1" role="menu" aria-label="Candidate actions">
      {showFirstMenu ? (
        <button
          type="button"
          onClick={onFirstClick}
          className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
          role="menuitem"
        >
          {firstmenutext}
        </button>
      ) : null}

      {showSecondMenu ? (
        <button
          type="button"
          onClick={onSecondClick}
          className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          role="menuitem"
        >
          {secondmenutext}
        </button>
      ) : null}

      {showThirdMenu ? (
        <button
          type="button"
          onClick={onThirdClick}
          className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
          role="menuitem"
        >
          {thirdmenutext}
        </button>
      ) : null}
    </div>
  )
}

export default ThreeDotPopUp
