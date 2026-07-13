import fireIcon  from '@/assets/astrology/fire.png';
import earthIcon from '@/assets/astrology/earth.png';
import airIcon   from '@/assets/astrology/air.png';
import waterIcon from '@/assets/astrology/water.png';

const ELEMENTS = [
  { name: 'Fire',  icon: fireIcon  },
  { name: 'Earth', icon: earthIcon },
  { name: 'Air',   icon: airIcon   },
  { name: 'Water', icon: waterIcon },
] as const;

interface Props {
  selectedElement: string | null;
  onSelect: (element: string | null) => void;
}

export default function ElementSelector({ selectedElement, onSelect }: Props) {
  const handleClick = (name: string) => {
    // Toggle: clicking the active element deselects (shows all)
    onSelect(selectedElement === name ? null : name);
  };

  return (
    <div
      role="group"
      aria-label="Filter zodiac signs by element"
      className="element-selector"
    >
      {ELEMENTS.map(({ name, icon }) => {
        const active = selectedElement === name;
        return (
          <button
            key={name}
            onClick={() => handleClick(name)}
            aria-pressed={active}
            aria-label={`${active ? 'Remove' : 'Apply'} ${name} element filter`}
            className={`element-btn${active ? ' element-btn--active' : ''}`}
          >
            <span className="element-icon-wrap">
              {/* element-float is the animation layer — separate from hover-scale on element-icon-wrap */}
              <span className="element-float">
                <img src={icon} alt="" aria-hidden="true" width={84} height={84} />
              </span>
            </span>
            <span className={`element-label${active ? ' element-label--active' : ''}`}>
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
