/**
 * PageHeader — consistent red-gradient banner used at the top of every page
 * Props:
 *   eyebrow  — small uppercase label above the title (optional)
 *   title    — main heading text
 *   accent   — portion of title to render in gold colour (optional)
 *   sub      — subtext below the title (optional)
 *   children — extra content (breadcrumb, buttons, etc.)
 */
export default function PageHeader({ eyebrow, title, accent, sub, children, compact = false }) {
  const renderTitle = () => {
    if (!accent || !title.includes(accent)) {
      return <span className="text-white">{title}</span>;
    }
    const [before, after] = title.split(accent);
    return (
      <>
        {before && <span className="text-white">{before}</span>}
        <span style={{ color: '#ffd700' }}>{accent}</span>
        {after && <span className="text-white">{after}</span>}
      </>
    );
  };

  return (
    <div
      style={{ background: 'linear-gradient(135deg, #8B0000 0%, #CC0000 100%)' }}
      className={compact ? 'py-10 px-6 text-center' : 'py-16 px-6 text-center'}>
      <div className="max-w-3xl mx-auto">
        {eyebrow && (
          <p className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: 'rgba(255,255,255,0.65)' }}>
            {eyebrow}
          </p>
        )}
        <h1 className={`font-display font-bold text-white leading-tight ${compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'}`}>
          {renderTitle()}
        </h1>
        {sub && (
          <p className={`mt-3 max-w-xl mx-auto leading-relaxed ${compact ? 'text-sm' : 'text-base'}`}
            style={{ color: 'rgba(255,255,255,0.75)' }}>
            {sub}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
