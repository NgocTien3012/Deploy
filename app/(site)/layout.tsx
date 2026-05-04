import Header from "@/app/components/header/Header"
import SiteFooter from "@/app/components/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <SiteFooter />
    </>
  );
}
