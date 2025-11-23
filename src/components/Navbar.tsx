import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { studentMode } from '@/lib/studentMode';
import { useCart } from '@/hooks/useCart';

interface NavbarProps {
  onStudentModeToggle: () => void;
}

export function Navbar({ onStudentModeToggle }: NavbarProps) {
  const [isStudentMode, setIsStudentMode] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    setIsStudentMode(studentMode.isActive());
  }, []);

  const handleToggle = () => {
    studentMode.toggle();
    setIsStudentMode(studentMode.isActive());
    onStudentModeToggle();
  };

  return (
    <nav className="sticky top-0 z-40 glass border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-glow">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-semibold hidden sm:block">AppleStore</span>
          </Link>

          {/* Center Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Products
            </Link>
            <Link
              to="/cart"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Cart
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Student Mode Toggle */}
            <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg">
              <GraduationCap
                className={`w-4 h-4 transition-colors ${
                  isStudentMode ? 'text-student-cyan neon-cyan' : 'text-muted-foreground'
                }`}
              />
              <Switch checked={isStudentMode} onCheckedChange={handleToggle} />
              <span className="text-xs font-medium hidden sm:inline">Student Mode</span>
            </div>

            {/* Cart Button */}
            <Link to="/cart">
              <Button variant="outline" size="icon" className="relative hover-lift">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}