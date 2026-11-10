import "./globals.css";

export const metadata = {
  title: "Smart Lost & Found",
  description: "A campus lost and found management system"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
