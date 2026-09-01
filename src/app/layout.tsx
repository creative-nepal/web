import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  JetBrains_Mono,
  Merriweather,
} from "next/font/google";
import "./globals.css";
import { getTranslations } from "@/features/i18n/server";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers/providers";

const merriweatherHeading = Merriweather({
  subsets: ["latin"],
  variable: "--font-heading",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations();

  return {
    title: t("ui.brand.name"),
    description: t("ui.brand.webDescription"),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, catalogue } = await getTranslations();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-mono",
        jetbrainsMono.variable,
        merriweatherHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers catalogue={catalogue} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
