import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TimerProvider } from "./context/TimerContext";
import { TimerAlert } from "./components/TimerAlert"; // Import the new component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HCI Cooking Assistant",
  description: "Calm technology for the kitchen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-stone-800 antialiased`}>
        <TimerProvider>
          <TimerAlert /> {/* Add the alert banner here */}
          {children}
        </TimerProvider>
      </body>
    </html>
  );
}