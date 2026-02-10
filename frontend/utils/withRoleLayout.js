"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function withRoleLayout(role, Component) {
  return function Protected(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!user || user.role !== role)) {
        router.replace("/auth/login");
      }
    }, [user, loading, router]);

    if (loading || !user) return null;

    return <Component {...props} />;
  };
}
