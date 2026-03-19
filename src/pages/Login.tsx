import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { user } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: {
          full_name: fullName,
          phone: phone,
        },
        emailRedirectTo: window.location.origin 
      },
    });
    if (error) toast.error(error.message);
    else toast.success("Verifique seu email para confirmar o cadastro!");
    setLoading(false);
  };

  const handleSubmit = mode === "login" ? handleLogin : handleSignup;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={logo} alt="AulaFlow" className="mx-auto mb-4 h-32 w-32 object-contain" />
          <h1 className="text-3xl font-bold bg-hero-gradient bg-clip-text text-transparent">
            AulaFlow
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sua assistente pedagógica com inteligência artificial
          </p>
        </div>

        <div className="rounded-xl bg-card p-6 border border-border shadow-medium">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-1"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
              />
              {mode === "login" && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      toast.error("Por favor, insira seu e-mail primeiro.");
                      return;
                    }
                    const { error } = await supabase.auth.resetPasswordForEmail(email);
                    if (error) toast.error(error.message);
                    else toast.success("E-mail de recuperação enviado!");
                  }}
                  className="text-xs text-primary hover:underline self-end"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm space-y-3">
            {mode === "login" ? (
              <button 
                type="button"
                onClick={() => setMode("signup")} 
                className="text-muted-foreground hover:text-foreground block w-full"
              >
                Não tem conta? <span className="text-primary font-medium">Criar agora</span>
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => setMode("login")} 
                className="text-muted-foreground hover:text-foreground"
              >
                Já tem conta? <span className="text-primary font-medium">Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
