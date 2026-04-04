import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aleatórios Padel — Ranking",
  description:
    "Ranking oficial do grupo Aleatórios Padel. Veja placares, estatísticas e histórico de partidas.",
  openGraph: {
    title: "Aleatórios Padel — Ranking",
    description:
      "Ranking oficial do grupo Aleatórios Padel. Veja placares, estatísticas e histórico de partidas.",
    type: "website",
    locale: "pt_BR",
    siteName: "Aleatórios Padel",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aleatórios Padel — Ranking",
    description:
      "Ranking oficial do grupo Aleatórios Padel. Veja placares, estatísticas e histórico de partidas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
