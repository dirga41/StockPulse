"use client";

export const THEME_KEY = "sp-theme";

/**
 * Dijalankan di <head> sebelum halaman tampil agar tidak ada kedipan tema.
 * Pilihan tersimpan di localStorage; tanpa pilihan, ikuti tema sistem.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

/** Tombol ganti tema terang/gelap. Ikon dipilih lewat CSS, jadi tidak ada mismatch saat hydrate. */
export function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Ganti tema terang/gelap"
      title="Ganti tema terang/gelap"
      className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      <span className="dark:hidden"><MoonIcon /></span>
      <span className="hidden dark:inline"><SunIcon /></span>
      {withLabel && (
        <>
          <span className="dark:hidden">Mode gelap</span>
          <span className="hidden dark:inline">Mode terang</span>
        </>
      )}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
