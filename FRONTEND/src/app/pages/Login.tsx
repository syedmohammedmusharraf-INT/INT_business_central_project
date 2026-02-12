import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import backgroundImage from "../../assets/background_image.png"; // collaborative logo
import intLogo from "../../assets/brand_logo.png"; // brandlogo

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Mock Google SSO - in production this would use actual OAuth
    localStorage.setItem("isAuthenticated", "true");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img 
          src={backgroundImage} 
          alt="Business professionals" 
          className="w-full h-full object-cover"
        />
        {/* Royal Blue to White Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/90 via-blue-600/70 to-white/80"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between gap-12 px-8">
        
        {/* Left Side - Welcome Content */}
        <div className="flex-1 space-y-8 text-white animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-tight">
              Welcome to<br />INT Business Central
            </h1>
          </div>
          
          <div className="space-y-4 text-lg">
            <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <p className="font-medium">AI-Powered Service Matching</p>
            </div>
            
            <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <p className="font-medium">Automated Sales Pitch Generation</p>
            </div>
            
            <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <p className="font-medium">Market Research & Content Hub</p>
            </div>
          </div>

          <div className="pt-8 opacity-80">
            <p className="text-sm">
              Streamline your sales process from lead intake to pitch generation with intelligent automation
            </p>
          </div>
        </div>

        {/* Right Side - Glass Effect Login Card */}
        <div className="w-full max-w-md">
          <Card className="p-8 space-y-6 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02]">
            <div className="text-center space-y-4">
              {/* INT Logo */}
              <div className="flex justify-center mb-2">
                <img 
                  src={intLogo} 
                  alt="INT Logo" 
                  className="w-20 h-20 object-contain"
                />
              </div>
              
              <h2 className="text-2xl font-bold text-white">INT Business Central</h2>
              <p className="text-white/80 text-sm">AI-Powered Sales Intelligence Platform</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleGoogleLogin}
                className="w-full h-12 text-base bg-white hover:bg-gray-50 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>

              <p className="text-xs text-white/70 text-center">
                Sign in with your @indusnet.co.in Google Workspace account
              </p>
            </div>

            <div className="pt-4 border-t border-white/20 text-center">
              <p className="text-xs text-white/60">
                Secure authentication powered by Google SSO
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
    </div>
  );
}