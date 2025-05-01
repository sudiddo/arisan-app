import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="bg-paper py-12 md:py-20 relative overflow-hidden">
      {/* Retro pattern (reduced opacity for mobile) */}
      <div className="absolute inset-0 opacity-5 md:opacity-10 bg-retro-pattern bg-cover md:bg-auto"></div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 text-center relative z-10">
        {/* Responsive headline */}
        <h1 className="text-3xl md:text-5xl font-pixel text-primary mb-4 md:mb-6">
          Selamat Datang di <span className="stamp text-stamp">ArisanKu!</span>
        </h1>

        {/* Mobile-optimized card */}
        <div className="max-w-md mx-auto bg-paper border-2 md:border-4 border-ink p-4 md:p-8 shadow-retro">
          {/* Piggy bank with responsive sizing */}
          <div className="mb-4 md:mb-6 relative">
            <Image
              src="/retro-piggybank.png"
              width={150}
              height={150}
              alt="Retro piggy bank"
              className="mx-auto w-[120px] md:w-[200px] hover:-translate-y-2 transition-transform duration-300"
              priority
            />
            {/* Smaller bouncing coin for mobile */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 -translate-y-3 animate-bounce">
              <Image
                src="/money-coins.png"
                width={20}
                height={20}
                alt="Coins"
                className="w-4 h-4 md:w-6 md:h-6"
              />
            </div>
          </div>

          {/* Adjusted text sizing */}
          <p className="text-base md:text-lg mb-6 md:mb-8 font-mono">
            &ldquo;Ngumpul bareng, nabung bareng, dapat giliran bareng!&rdquo;
            🎉
          </p>

          {/* CTA with mobile tap target */}
          <div className="relative inline-block">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary-dark text-ink text-lg md:text-xl px-6 py-4 md:px-8 md:py-6 min-w-[180px]"
              asChild
            >
              <Link href="/login">Mulai Arisan Sekarang</Link>
            </Button>
            <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 transform rotate-12">
              <div className="text-xs md:text-sm sticker">Baru!</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
