import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInAsMock: (email: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signInAsMock: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [mockUser, setMockUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for mock session
    const storedMock = localStorage.getItem("aulaFlow_mockUser");
    if (storedMock) {
      setMockUser(JSON.parse(storedMock));
      setLoading(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setMockUser(null);
        localStorage.removeItem("aulaFlow_mockUser");
      }
      setLoading(false);
    });

    // Handle hash fragments from magic links / email confirmations
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        if (!storedMock) setLoading(false);
      }
    };

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
        window.history.replaceState(null, "", window.location.pathname);
      }).catch((err) => {
        console.error("Error setting session from hash:", err);
        setLoading(false);
      });
    } else {
      fetchSession();
    }

    // Safety timeout: stop loading after 5 seconds no matter what
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signInAsMock = (email: string) => {
    const mock: User = {
      id: "00000000-0000-0000-0000-000000000123",
      email: email,
      user_metadata: { full_name: "Usuário de Teste" },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    setMockUser(mock);
    localStorage.setItem("aulaFlow_mockUser", JSON.stringify(mock));
    setLoading(false);
  };

  const signOut = async () => {
    setMockUser(null);
    localStorage.removeItem("aulaFlow_mockUser");
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: mockUser || session?.user || null, loading, signOut, signInAsMock }}>
      {children}
    </AuthContext.Provider>
  );
}
