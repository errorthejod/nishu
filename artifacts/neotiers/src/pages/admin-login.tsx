import { useState } from "react";
import { Layout } from "@/components/layout";
import { EsportsButton } from "@/components/ui-elements";
import { useLocation } from "wouter";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel."
        });

        setLocation("/admin/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Access Denied",
        description: "Server error.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border p-8 esports-clip relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

          <div className="flex flex-col items-center mb-8">
            <Shield className="w-12 h-12 text-primary mb-4" />

            <h1 className="text-4xl font-display uppercase tracking-widest text-foreground">
              Admin Access
            </h1>

            <p className="text-muted-foreground mt-2 text-center">
              Restricted area. Authorized personnel only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-display uppercase tracking-widest text-muted-foreground mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all esports-clip-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-display uppercase tracking-widest text-muted-foreground mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all esports-clip-sm"
                required
              />
            </div>

            <EsportsButton
              type="submit"
              className="w-full mt-8"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Initialize Session"}
            </EsportsButton>
          </form>
        </div>
      </div>
    </Layout>
  );
}
