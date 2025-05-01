import { Button } from "@/components/ui/button";
import { HeroSection } from "./HeroSection";
import { RetroCard } from "@/components/ui/retro-card";
import Link from "next/link";

export function MarketingPage() {
  return (
    <>
      <HeroSection />

      <div className="retro-divider"></div>

      <section className="py-14 bg-muted/50">
        <div className="container">
          <h2 className="text-2xl font-pixel text-center mb-12">
            Cara Kerja <span className="text-stamp">ArisanKu</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RetroCard className="text-center">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto font-pixel">
                1
              </div>
              <h3 className="text-xl font-medium mb-2">Bikin Arisan Baru</h3>
              <p className="text-muted-foreground">
                Atur grup arisan dengan nama, jumlah iuran bulanan, dan aturan
                main.
              </p>
            </RetroCard>

            <RetroCard className="text-center">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto font-pixel">
                2
              </div>
              <h3 className="text-xl font-medium mb-2">Tambah Anggota</h3>
              <p className="text-muted-foreground">
                Undang anggota dengan kode QR untuk bergabung dengan aman.
              </p>
            </RetroCard>

            <RetroCard className="text-center">
              <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto font-pixel">
                3
              </div>
              <h3 className="text-xl font-medium mb-2">Kelola Bersama</h3>
              <p className="text-muted-foreground">
                Lacak iuran dan kelola arisan dengan transparansi penuh.
              </p>
            </RetroCard>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" className="font-mono" asChild>
              <Link href="/claim">Klaim Keanggotaan Anda</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="retro-divider"></div>

      <section className="py-14">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-pixel font-medium mb-10">
              ArisanKu - Kelola Arisan Jadi Lebih Mudah!{" "}
              <span className="text-stamp">👍</span>
            </h3>
            <p className="text-lg mb-6">
              Catat peserta, lacak pembayaran, dan tentukan pemenang dalam satu
              aplikasi. Tidak perlu repot lagi pakai buku catatan!
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-8 italic">
              <p className="mb-1">
                Sejak pakai ArisanKu, ngurus arisan RT jadi gampang banget!
              </p>
              <p className="text-sm font-medium">
                - Bu Siti, Ketua Arisan RW 05 -
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary-dark text-ink text-xl"
            asChild
          >
            <Link href="/login">Mulai Sekarang</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
