import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Alô presença 2.0',
  description: 'Plataforma de monitoramento e frequência escolar.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#F8F9FA] text-[#1A1A1A]">
        {children}
      </body>
    </html>
  );
}
