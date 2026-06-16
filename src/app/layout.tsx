import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CrestCode Idea Validator — AI-Powered Startup Scoring',
  description: 'Score your startup idea across 6 key dimensions in seconds. Get AI-powered investor appeal, market timing, and feasibility analysis. Free to try.',
  keywords: 'startup idea validator, startup scoring, AI startup analysis, investor appeal, market timing, startup feasibility',
  openGraph: {
    title: 'CrestCode Idea Validator',
    description: 'AI-powered startup idea scoring across 6 key dimensions.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
