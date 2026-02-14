import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "General Student Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
