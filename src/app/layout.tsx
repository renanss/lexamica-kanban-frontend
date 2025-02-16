import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BoardProvider } from "@/providers/board-provider";
import "@/styles/globals.scss";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lexamica Kanban",
  description: "A modern Kanban board application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-vh-100 d-flex flex-column">
          <header className="py-3 bg-light border-bottom">
            <div className="container">
              <h1 className="h4 mb-0">Lexamica Kanban</h1>
            </div>
          </header>
          <main className="flex-grow-1 py-4">
            <div className="container">
              <BoardProvider>
                {children}
              </BoardProvider>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
