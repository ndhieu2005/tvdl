export default function AboutPage() {
  return (
    <div className="px-8 py-10 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-10">
        <h1 className="text-page font-bold text-blue">Về Thư viện</h1>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 border-2 border-blue text-blue px-5 py-2.5 text-sm font-semibold hover:bg-blue hover:text-white transition-colors rounded-lg shrink-0"
        >
          → Liên hệ Thư viện Dương Liễu
        </a>
      </div>

      {/* Placeholder illustration */}
      <div className="w-full h-80 bg-cream rounded-2xl flex items-center justify-center mb-10">
        <span className="text-blue/20 text-6xl">🖼</span>
        <span className="ml-4 text-blue/30 text-sm italic">Illustration sẽ được bổ sung</span>
      </div>

      <h2 className="text-2xl font-black text-blue tracking-wide">WE DO LIBRARY & BEYOND</h2>
    </div>
  );
}
