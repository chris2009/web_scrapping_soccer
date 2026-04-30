export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-line bg-white px-8 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Elaborada by{" "}
          <span className="font-semibold text-ink">Sherlock</span>
        </p>
        <p className="text-xs text-slate-400">
          © {year} Football Data App. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
