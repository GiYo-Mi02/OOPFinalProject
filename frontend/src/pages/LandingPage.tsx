import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  BarChart3, 
  Mail,
  Lock,
  Vote,
  Users,
  CheckCircle,
  TrendingUp,
  FileText,
  Clock,
  Heart
} from "lucide-react";
import { clsx } from "clsx";

const studentFeatures = [
  {
    icon: <Mail className="h-5 w-5" />,
    title: "Email Verification",
    description: "Secure login using your official @umak.edu.ph email address"
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "OTP Protection",
    description: "Two-factor authentication with time-limited one-time passwords"
  },
  {
    icon: <Vote className="h-5 w-5" />,
    title: "Easy Voting",
    description: "Cast your vote for candidates or abstain with a single click"
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: "Vote Confirmation",
    description: "Instant confirmation that your vote has been recorded securely"
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Live Results",
    description: "Watch real-time election results as votes are counted"
  },
];

const adminFeatures = [
  {
    icon: <Users className="h-5 w-5" />,
    title: "Candidate Management",
    description: "Add, edit, and organize candidates for each position"
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Election Creation",
    description: "Set up elections with custom dates, positions, and institutes"
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Analytics Dashboard",
    description: "Monitor voter turnout and engagement in real-time"
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Export Reports",
    description: "Generate PDF and CSV reports for official records"
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Schedule Elections",
    description: "Automate election start and end times for seamless operations"
  },
];

const testimonials = [
  {
    name: "Maria Santos",
    role: "BSIT Student, CCIS",
    image: "MS",
    quote: "UMak eBallot made voting so convenient! I was able to cast my vote during my break without waiting in long lines."
  },
  {
    name: "John Dela Cruz",
    role: "Student Council President",
    image: "JD",
    quote: "The transparency and real-time results feature gave everyone confidence in the electoral process. Best voting system we've used!"
  },
  {
    name: "Dr. Ana Reyes",
    role: "Election Committee Head",
    image: "AR",
    quote: "As an administrator, the analytics and reporting tools saved us countless hours. The system is secure, fast, and reliable."
  },
];

const howToSteps = [
  {
    step: 1,
    title: "Register & Verify",
    description: "Log in using your @umak.edu.ph email. We'll send you a one-time code to verify your identity.",
    icon: <Mail className="h-6 w-6" />,
  },
  {
    step: 2,
    title: "Browse Candidates",
    description: "Review all candidates running for different positions. Read their platforms and qualifications.",
    icon: <Users className="h-6 w-6" />,
  },
  {
    step: 3,
    title: "Cast Your Vote",
    description: "Select your preferred candidates for each position or choose to abstain. Your vote is encrypted and secure.",
    icon: <Vote className="h-6 w-6" />,
  },
  {
    step: 4,
    title: "View Results",
    description: "After voting, watch the real-time results dashboard to see how the election unfolds.",
    icon: <TrendingUp className="h-6 w-6" />,
  },
];

export function LandingPage() {
  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300">
            <Shield className="h-4 w-4" />
            Secure • Transparent • Accessible
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            The Future of Campus Democracy
          </h1>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-slate-300">
            UMak eBallot empowers every student voice with a secure, transparent, and accessible digital voting platform. Vote anytime, anywhere, from any device.
          </p>
          
          {/* Sign In / Create Account Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary-500/40"
              >
                <Lock className="h-5 w-5" />
                Sign In
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                to="/login"
                className={clsx(
                  "inline-flex items-center gap-2 rounded-xl border-2 border-primary-500 bg-white px-8 py-4 text-base font-semibold text-primary-600 shadow-sm transition-all hover:bg-primary-50",
                  "dark:border-primary-400 dark:bg-slate-800 dark:text-primary-300 dark:hover:bg-slate-700",
                )}
              >
                <Mail className="h-5 w-5" />
                Create Account
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              🎓 Use your <span className="font-semibold text-primary-600 dark:text-primary-400">@umak.edu.ph</span> email to sign in or create an account. We'll send an OTP to verify your identity.
            </p>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="animate-fade-in rounded-3xl border border-gray-200 bg-gradient-to-br from-primary-50 to-blue-50 p-8 shadow-2xl dark:border-slate-800 dark:from-slate-900/60 dark:to-blue-950/40">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 p-2.5">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900 dark:text-slate-100">Live Metrics</h2>
          </div>
          <dl className="grid grid-cols-2 gap-6">
            {[
              { label: "Active Elections", value: "12+", color: "from-blue-500 to-blue-600" },
              { label: "Students Registered", value: "5,000+", color: "from-emerald-500 to-emerald-600" },
              { label: "Votes Cast", value: "15k+", color: "from-purple-500 to-purple-600" },
              { label: "Uptime", value: "99.9%", color: "from-orange-500 to-orange-600" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:scale-105 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity group-hover:opacity-5`}></div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">{stat.label}</dt>
                <dd className={`mt-2 bg-gradient-to-r ${stat.color} bg-clip-text text-4xl font-bold text-transparent`}>
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How to Use Section */}
      <section id="how-to-use" className="space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300">
            <CheckCircle className="h-4 w-4" />
            Simple & Easy
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">How to Vote in 4 Easy Steps</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-700 dark:text-slate-300">
            Voting with UMak eBallot is designed to be simple, secure, and accessible for every student.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {howToSteps.map((item) => (
            <div
              key={item.step}
              className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary-500/10 to-primary-600/10 blur-2xl"></div>
              <div className="relative space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg">
                    {item.icon}
                  </div>
                  <span className="text-5xl font-bold text-gray-200 dark:text-slate-800">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Built For Everyone</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-700 dark:text-slate-300">
            Whether you're casting a vote or managing an election, UMak eBallot has powerful features tailored for you.
          </p>
        </div>
        
        <div className="grid gap-12 lg:grid-cols-2">
          <FeatureCard title="For Students" items={studentFeatures} gradient="from-blue-500 to-blue-600" />
          <FeatureCard title="For Election Admins" items={adminFeatures} gradient="from-purple-500 to-purple-600" />
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300">
            <Heart className="h-4 w-4" />
            Trusted by Herons
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">What Our Community Says</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-700 dark:text-slate-300">
            Hear from students and administrators who have experienced the convenience of digital voting.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-lg font-bold text-white shadow-lg">
                  {testimonial.image}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-slate-100">{testimonial.name}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-slate-300 leading-relaxed">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section
        id="tech-stack"
        className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-12 shadow-xl dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-900/40"
      >
        <div className="mb-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300">
            <Zap className="h-4 w-4" />
            Modern Technology
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Powered by Cutting-Edge Tech</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-700 dark:text-slate-300">
            Built with modern tools to ensure speed, security, and scalability.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <TechCard
            title="Frontend"
            techs={["React 18 + TypeScript", "Vite for lightning-fast builds", "TailwindCSS for modern UI", "React Query for data management"]}
            icon={<BarChart3 className="h-6 w-6" />}
            gradient="from-blue-500 to-blue-600"
          />
          <TechCard
            title="Backend"
            techs={["Express.js + TypeScript", "Supabase PostgreSQL", "Redis for caching", "JWT Authentication"]}
            icon={<Shield className="h-6 w-6" />}
            gradient="from-emerald-500 to-emerald-600"
          />
          <TechCard
            title="Security"
            techs={["Email-based OTP verification", "Encrypted vote storage", "Rate limiting & CORS", "Audit trail logging"]}
            icon={<Lock className="h-6 w-6" />}
            gradient="from-purple-500 to-purple-600"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl border border-primary-200 bg-gradient-to-br from-primary-500 to-primary-600 p-12 text-center shadow-2xl dark:border-primary-500/30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold text-white">Ready to Make Your Voice Heard?</h2>
          <p className="mx-auto max-w-2xl text-lg text-white/90">
            Join thousands of UMak students who have already experienced secure, convenient digital voting.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-white px-8 py-4 text-base font-semibold text-primary-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            Start Voting Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  items: Array<{ icon: React.ReactNode; title: string; description: string }>;
  gradient: string;
}

function FeatureCard({ title, items, gradient }: FeatureCardProps) {
  return (
    <article className="group rounded-3xl border border-gray-200 bg-white p-8 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-8 flex items-center gap-3">
        <div className={`rounded-xl bg-gradient-to-br ${gradient} p-2.5 text-white shadow-lg group-hover:shadow-xl`}>
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{title}</h3>
      </div>
      <ul className="space-y-6">
        {items.map((item) => (
          <li key={item.title} className="flex items-start gap-4">
            <span className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
              {item.icon}
            </span>
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-900 dark:text-slate-200">{item.title}</h4>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-400">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

interface TechCardProps {
  title: string;
  techs: string[];
  icon: React.ReactNode;
  gradient: string;
}

function TechCard({ title, techs, icon, gradient }: TechCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-xl bg-gradient-to-br ${gradient} p-2.5 text-white shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-200">{title}</h3>
      </div>
      <ul className="space-y-3">
        {techs.map((tech) => (
          <li key={tech} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" aria-hidden />
            <span className="text-sm text-gray-700 dark:text-slate-400">{tech}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
