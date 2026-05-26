/**
 * SectionHeading — consistent section header used throughout the site
 * Props:
 *   eyebrow  — small red uppercase label
 *   title    — main heading
 *   accent   — word inside title to render in red
 *   sub      — subtext
 *   center   — centre-align (default true)
 */
export default function SectionHeading({ eyebrow, title, accent, sub, center = true }) {
  const renderTitle = () => {
    if (!accent || !title.includes(accent)) return title;
    const [before, after] = title.split(accent);
    return (
      <>
        {before}
        <span style={{ color: '#CC0000' }}>{accent}</span>
        {after}
      </>
    );
  };

  return (
    <div className={center ? 'text-center' : ''}>
      {eyebrow && (
        <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#CC0000' }}>
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight" style={{ color: '#1a0000' }}>
        {renderTitle()}
      </h2>
      {sub && (
        <p className="mt-3 text-sm md:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#888' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
