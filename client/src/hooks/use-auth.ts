import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { onAuthStateChange, handleAuthRedirect } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle any pending auth redirects first
    handleAuthRedirect().catch(console.error);
    
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
