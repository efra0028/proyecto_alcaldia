import Navbar from "./components/Navbar";
import "../styles/navbar.css";
import "../styles/landing.css";
import "../styles/pages.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}