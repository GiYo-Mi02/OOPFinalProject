import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Mail, MapPin, Phone, Github, Twitter, Linkedin, Facebook } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { clsx } from "clsx";
import LogoImg from "../../assets/Logos.png";

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic nav items based on user role
  const getNavItems = () => {
    const items = [
      { to: "/", label: "Overview", requiresAuth: false },
    ];
    
    if (user) {
      if (user.role === "admin") {
        items.push({ to: "/admin", label: "Admin Dashboard", requiresAuth: true });
        items.push({ to: "/admin/candidates", label: "Manage Candidates", requiresAuth: true });
        items.push({ to: "/admin/elections", label: "Manage Elections", requiresAuth: true });
        items.push({ to: "/admin/analytics", label: "Analytics", requiresAuth: true });
        items.push({ to: "/admin/settings", label: "Settings", requiresAuth: true });
      } else {
        items.push({ to: "/dashboard", label: "Dashboard", requiresAuth: true });
        items.push({ to: "/vote", label: "Vote Now", requiresAuth: true });
        items.push({ to: "/account", label: "Account", requiresAuth: true });
      }
    }
    
    return items;
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 opacity-20 blur-xl"></div>
                <img
                  src={LogoImg}
                  alt="UMak eBallot Logo"
                  className="relative h-10 w-10 rounded-xl object-cover"
                />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">UMak eBallot</p>
                <p className="text-xs text-gray-600 dark:text-slate-400">Secure Digital Voting</p>
              </div>
            </Link>
          </div>
          
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            {getNavItems()
              .filter((item) => (item.requiresAuth ? Boolean(user) : true))
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      "rounded-lg px-4 py-2 transition-all",
                      isActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2.5 text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden flex-col text-right text-sm sm:flex">
                  <span className="font-semibold text-gray-900 dark:text-slate-200">{user.email}</span>
                  <span className="text-xs text-gray-600 dark:text-slate-500">
                    {user.role === "admin" ? "Administrator" : "Student"}
                    {user.instituteId ? ` • ${user.instituteId.toUpperCase()}` : ""}
                  </span>
                </div>
                <Button variant="secondary" size="sm" onClick={logout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (location.pathname !== "/login") navigate("/login");
                }}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:py-20">
        <Outlet />
      </main>
      
      <footer className="border-t border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand Section */}
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 opacity-20 blur-xl"></div>
                  <img
                    src={LogoImg}
                    alt="UMak eBallot Logo"
                    className="relative h-10 w-10 rounded-xl shadow-lg shadow-primary-500/50 object-cover"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">UMak eBallot</p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">Secure Digital Voting</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-slate-400">
                Empowering democratic participation through secure, transparent, and accessible digital voting for the University of Makati community.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/umak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-primary-400"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="https://twitter.com/umak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-primary-400"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://facebook.com/umak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-primary-400"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com/school/umak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-primary-400"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-gray-700 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="/#how-to-use" className="text-gray-700 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                    How to Vote
                  </a>
                </li>
                <li>
                  <a href="/#features" className="text-gray-700 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                    Features
                  </a>
                </li>
                <li>
                  <a href="/#testimonials" className="text-gray-700 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Contact Us</h3>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                  <span>J.P. Rizal Ext., West Rembo, Makati City, 1215</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                  <span>(02) 8883-1863</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                  <span>eballot@umak.edu.ph</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 dark:border-slate-800">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-600 dark:text-slate-500 md:flex-row">
              <p>© {new Date().getFullYear()} University of Makati. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="/privacy" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
                  Privacy Policy
                </a>
                <a href="/terms" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
