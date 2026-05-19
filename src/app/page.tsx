import Link from "next/link";
import {
  ClipboardList,
  AlertTriangle,
  Share2,
  FileDown,
  ArrowRight,
} from "lucide-react";
import RavenIcon from "@/components/RavenIcon";

const features = [
  {
    title: "Inspection Reports",
    description:
      "Build detailed inspection reports line-by-line. Mark items Pass, Fail, or N/A and finalize when ready.",
    icon: ClipboardList,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    title: "Deficiency Tracking",
    description:
      "Log deficiencies with severity levels and due dates. See overdue items at a glance from the dashboard.",
    icon: AlertTriangle,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
  {
    title: "Client Portal",
    description:
      "Share a secure, read-only portal link directly with your client. No login required on their end.",
    icon: Share2,
    iconBg: "bg-red-600/10",
    iconColor: "text-red-400",
  },
  {
    title: "PDF Export",
    description:
      "Export polished, branded inspection reports as PDFs. Stored in the cloud and ready to share anytime.",
    icon: FileDown,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RavenIcon className="w-5 h-5 text-red-400" />
            <span className="font-bold text-[15px] tracking-tight text-white">
              RavenDock
            </span>
          </div>
          <Link
            href="/login"
            className="text-[13px] font-medium text-gray-500 hover:text-white transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-red-600/[0.07] blur-[80px]" />
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-[12px] font-medium text-red-400 tracking-wide uppercase">
              Fire & Life Safety
            </span>
          </div>

          <h1 className="text-[46px] sm:text-[56px] font-bold tracking-tight leading-[1.1] text-white mb-5">
            Inspection management
            <br />
            <span className="text-red-400">built for the field.</span>
          </h1>

          <p className="text-[16px] sm:text-[17px] text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
            Generate professional reports, track deficiencies with due dates,
            and share results directly with clients — all in one place.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-[14px] font-semibold px-7 py-3 rounded-xl transition-all shadow-[0_0_24px_rgba(94,129,172,0.35)] hover:shadow-[0_0_32px_rgba(94,129,172,0.5)]"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto w-full px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-900/60 border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] hover:bg-gray-900/80 transition-all"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${f.iconBg}`}
              >
                <f.icon className={`w-[18px] h-[18px] ${f.iconColor}`} />
              </div>
              <h3 className="text-[13.5px] font-semibold text-white mb-1.5">
                {f.title}
              </h3>
              <p className="text-[12.5px] text-gray-500 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-7">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RavenIcon className="w-4 h-4 text-gray-700" />
            <span className="text-[12.5px] text-gray-700 font-medium">
              RavenDock
            </span>
          </div>
          <p className="text-[12px] text-gray-700">
            © {new Date().getFullYear()} RavenDock
          </p>
        </div>
      </footer>
    </div>
  );
}

