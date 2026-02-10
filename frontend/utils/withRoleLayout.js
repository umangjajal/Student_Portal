"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function withRoleLayout(role, Component) {
  return function Protected(props) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (loading) {
        setIsChecking(true);
        return;
      }

      // If context has user with correct role, allow
      if (user && user.role === role) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // If context is empty, check localStorage directly
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.role === role) {
            setIsAuthorized(true);
            setIsChecking(false);
            return;
          }
        } catch (err) {
          // Invalid token
        }
      }

      // Not authorized
      setIsAuthorized(false);
      setIsChecking(false);
      router.replace("/auth/login");
    }, [user?.id, user?.role, loading, role, router]);

    if (isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      );
    }

    if (!isAuthorized) {
      return null;
    }

    return <Component {...props} />;
  };
}
