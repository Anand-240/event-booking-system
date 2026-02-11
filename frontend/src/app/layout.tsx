import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Event Booking App</title>
      </head>
      <body>{children}</body>
    </html>
  );
}