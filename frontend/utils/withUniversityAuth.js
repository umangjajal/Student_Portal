'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function withUniversityAuth(Component) {
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

        if (decoded.role !== 'UNIVERSITY') {
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.clear();
        router.replace('/auth/login');
      }
    }, [router]);

    return <Component {...props} />;
  };
}
