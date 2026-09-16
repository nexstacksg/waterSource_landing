import Header from "@/components/Header";
import Topbar from "@/components/Topbar";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <><Topbar /><Header />{children}</>;
}
