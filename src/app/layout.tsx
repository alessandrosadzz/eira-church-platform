import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastContainer } from "../components/ui/Toast";
import { ThemeInitializer } from "../components/ThemeInitializer";

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://eventos.eirachurch.com.br'),
  title: "Eira Church // Inscrições Oficiais de Eventos e Retiros",
  description:
    "Participe dos retiros, conferências e encontros da Eira Church. Garanta sua vaga com segurança, pagamento rápido via Pix e confirmação imediata.",
  keywords: [
    "Eira Church",
    "eventos igreja",
    "retiro de jovens",
    "rede one way",
    "rede hype teens",
    "conferência igreja",
    "inscrição retiro"
  ],
  openGraph: {
    title: "Eira Church // Encontros e Inscrições Oficiais",
    description: "Conecte-se com sua congregação. Inscrições abertas para retiros e conferências.",
    locale: "pt_BR",
    type: "website",
    siteName: "Eira Church",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Church",
    "name": "Eira Church",
    "url": "https://eventos.eirachurch.com.br",
    "description": "Comunidade cristã contemporânea em células, gerando impacto através da adoração e comunhão.",
  };

  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0A0A0A]">
        <ThemeInitializer />
        {/* Link para pular direto ao conteudo (Acessibilidade WCAG 2.2 AA) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-contrast focus:font-bold focus:rounded-md focus:shadow-md"
        >
          Pular para o conteúdo principal
        </a>

        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>

        <ToastContainer />
      </body>
    </html>
  );
}
