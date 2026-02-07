import './globals.css';

export const metadata = {
  title: 'General Student Portal',
  description: 'University Management System'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
