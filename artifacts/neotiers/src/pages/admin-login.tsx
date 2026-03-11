import { useState } from "react";
import { Layout } from "@/components/layout";
import { EsportsButton } from "@/components/ui-elements";
import { useAdminLogin } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        if (data.success) {
          toast({ title: "Login Successful", description: "Welcome to the admin panel." });
          setLocation("/admin/dashboard");
        } else {
          toast({ title: "Login Failed", description: data.message, variant: "destructive" });
        }
      },
      onError: (error: any) => {
        toast({ 
          title: "Access Denied", 
          description: error?.response?.data?.message || "Invalid credentials.", 
          variant: "destructive" 
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { username, password } });
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border p-8 esports-clip relative">
          {/* Decorative accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          
          <div className="flex flex-col items-center mb-8">
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h1 className="text-4xl font-display uppercase tracking-widest text-foreground">Admin Access</h1>
            <p className="text-muted-foreground mt-2 text-center">Restricted area. Authorized personnel only.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-display uppercase tracking-widest text-muted-foreground mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all esports-clip-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-display uppercase tracking-widest text-muted-foreground mb-2">Password</label>
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
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Authenticating..." : "Initialize Session"}
            </EsportsButton>
          </form>
        </div>
      </div>
    </Layout>
  );
}
