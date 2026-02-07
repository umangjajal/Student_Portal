'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jwtDecode from 'jwt-decode';

export default function withAdminAuth(Component) {
  return function ProtectedPage(props) {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');

      if (!token) {
        router.replace('/auth/login');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        if (decoded.role !== 'ADMIN') {
          router.replace('/auth/login');
        }
      } catch {
        router.replace('/auth/login');
      }
    }, []);

    return <Component {...props} />;
  };
}
