import {
  Bell,
  CalendarBlank,
  CaretDown,
  CaretRight,
  Certificate,
  ChartLineUp,
  Check,
  ClockCountdown,
  FileText,
  IdentificationBadge,
  MapPinLine,
  ShieldCheck,
  SignOut,
  SquaresFour,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react';

/**
 * Every glyph the app uses, keyed by role rather than by shape, so a screen asks for "the documents
 * icon" and cannot pick a different one than the sidebar did.
 *
 * Two roles deliberately read geospatial rather than generic, because that is what the underlying
 * action actually is at an engineering consultancy with field and site staff: attendance is a geofenced check-in at a named site, not a
 * timesheet, so it carries a map pin; and an employee's identity in the field is the site ID badge.
 * Everything else stays conventional, because a survey metaphor on a leave request
 * would only make a standard task harder to recognise.
 */
const ICONS = {
  grid: SquaresFour,
  user: IdentificationBadge,
  siteCheckIn: MapPinLine,
  calendar: CalendarBlank,
  pending: ClockCountdown,
  file: FileText,
  users: UsersThree,
  chart: ChartLineUp,
  award: Certificate,
  shield: ShieldCheck,
  check: Check,
  bell: Bell,
  logout: SignOut,
  chevronDown: CaretDown,
  chevronRight: CaretRight,
  alertCircle: WarningCircle,
};

/**
 * The single icon weight for the whole app. The brand's own site draws its few icons as thin
 * monoline strokes, so selection and emphasis are carried by colour and background, never by
 * swapping an icon to a heavier or filled weight, which makes the glyph jump optically.
 */
const WEIGHT = 'regular';

/**
 * Line icon from the app's one icon family.
 * @param {keyof typeof ICONS} name - Role key from the map above.
 * @param {number} [size] - Width/height in px. 16 inline with text, 20 standalone.
 * @param {string} [color] - Stroke colour; inherits from the parent by default.
 * @param {string} [className] - Passed through for layout only.
 * @returns {JSX.Element|null} The icon, or null when `name` is not a known role.
 */
const Icon = ({ name, size = 20, color = 'currentColor', className }) => {
  const Glyph = ICONS[name];
  if (!Glyph) return null;
  return <Glyph size={size} color={color} weight={WEIGHT} className={className} aria-hidden="true" />;
};

export default Icon;
