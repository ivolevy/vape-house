import { MessageCircle } from "lucide-react";
export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="font-display text-base tracking-[0.25em] font-semibold">VAPE·HOUSE</div>
        <a
          href="https://wa.me/5491138240929"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm glass rounded-full px-5 py-2.5 hover:border-[oklch(0.62_0.18_320)] transition"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Vape House</p>
      </div>
    </footer>
  );
}
