
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import { AuroraText } from '@/components/ui/aurora-text';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

const NavbarComponent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const navItems = [
    {
      name: "Dashboard",
      link: "/",
    },
    {
      name: "Profile",
      link: "/profile",
    }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
      <Navbar>
        <NavBody>
          <NavbarLogo>
            <span className="text-2xl font-bold">
              <AuroraText 
                colors={["#9b87f5", "#7E69AB", "#6E59A5", "#D946EF"]}
                speed={0.8}
              >
                SR WorkFlow
              </AuroraText>
            </span>
          </NavbarLogo>
          {user && (
            <>
              <NavItems items={navItems} />
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <NavbarButton variant="dark" onClick={handleLogout}>
                  Logout
                </NavbarButton>
              </div>
            </>
          )}
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo>
              <span className="text-xl font-bold">
                <AuroraText 
                  colors={["#9b87f5", "#7E69AB", "#6E59A5", "#D946EF"]}
                  speed={0.8}
                >
                  SR WorkFlow
                </AuroraText>
              </span>
            </NavbarLogo>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </MobileNavHeader>

          {user && (
            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              {navItems.map((item, idx) => (
                <a
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-neutral-600 dark:text-neutral-300"
                >
                  <span className="block">{item.name}</span>
                </a>
              ))}
              <div className="flex w-full flex-col gap-4">
                <NavbarButton
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="dark"
                  className="w-full"
                >
                  Logout
                </NavbarButton>
              </div>
            </MobileNavMenu>
          )}
        </MobileNav>
      </Navbar>
    </div>
  );
};

export default NavbarComponent;
