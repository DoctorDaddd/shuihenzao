export default function HeroTitles({ titles }: { titles: readonly string[] }) {
  if (!titles.length) return null;
  return (
    <div className="hero-titles" role="list" aria-label="已获得称号">
      {titles.map(title => <span key={title} role="listitem">《{title}》</span>)}
    </div>
  );
}
