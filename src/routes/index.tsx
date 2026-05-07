import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/store/Header";
import { Catalog } from "@/components/store/Catalog";
import { Benefits } from "@/components/store/Benefits";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Particles } from "@/components/store/Particles";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Particles />
      <Header />
      <main className="relative z-10">
        <div id="inicio" />
        <Catalog />
        <Benefits />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
