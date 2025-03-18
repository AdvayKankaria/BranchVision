import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MessageSquare, Menu, X } from "lucide-react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 md:px-8",
        scrolled
          ? "py-3 bg-white/80 backdrop-blur-lg shadow-subtle"
          : "py-5 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <MessageSquare className="w-8 h-8 text-primary" />
          <span className="text-xl font-semibold text-gray-800">
            BranchVision
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/about">About</NavLink>
          <Link
            to="/apply"
            className="bg-primary text-white px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Apply Now
          </Link>
        </nav>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-fade-in">
          <div className="flex flex-col py-4 px-8 space-y-4">
            <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </MobileNavLink>
            <MobileNavLink to="/about" onClick={() => setMobileMenuOpen(false)}>
              About
            </MobileNavLink>
            <Link
              to="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors text-center"
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => {
  return (
    <Link
      to={to}
      className="text-gray-700 hover:text-primary transition-colors font-medium"
    >
      {children}
    </Link>
  );
};

const MobileNavLink = ({
  to,
  children,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-gray-700 hover:text-primary transition-colors font-medium text-lg py-1"
    >
      {children}
    </Link>
  );
};

export default Header;
