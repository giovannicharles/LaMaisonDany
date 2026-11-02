import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "@/components/public/Seo";
import { useSite } from "@/lib/siteContent";

export default function NotFoundPage() {
  const { texts } = useSite();
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col items-start justify-center px-5 pb-16 pt-[140px] md:px-10">
      <Seo title={texts.seo_notfound_title} noindex />
      <p className="font-brand text-7xl text-rose md:text-8xl">404</p>
      <h1 className="mt-4 font-brand text-4xl text-wine md:text-5xl">{texts.notfound_title}</h1>
      <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-ink-soft">{texts.notfound_text}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/catalogue" className="lmd-btn lmd-btn-wine">
          {texts.nav_shop} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/" className="lmd-btn lmd-btn-ghost">
          {texts.nav_home}
        </Link>
      </div>
    </div>
  );
}
