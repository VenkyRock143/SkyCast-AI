"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login"); // redirect if not logged in
    } else {
      setChecked(true);
    }
  }, [router]);
  if (!checked) {
    return (
      // Branded loading screen while checking token
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-float"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}
          >
            ■
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Loading SkyCast...
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
