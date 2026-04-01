/**
 * Maps icon names to their lucide-react components
 * This avoids dynamic imports and provides better performance
 */

import {
  Home,
  Building2,
  Crown,
  User,
  Megaphone,
  ShoppingCart,
  Store,
  TrendingUp,
  Heart,
  Package,
  Wrench,
  DollarSign,
  Users,
  Cpu,
  Truck,
  Sparkles,
  Palette,
  Headphones,
  Scale,
  Hammer,
  Briefcase,
  GitBranch,
  CheckSquare,
  FileCheck,
  Zap,
  BarChart3,
  Bell,
  Settings,
  Shield,
  Plug,
  Sliders,
  ChevronRight,
  ChevronDown,
  LogOut,
  Search,
  Menu,
  X,
  Diamond,
} from 'lucide-react';

export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Building2,
  Crown,
  User,
  Megaphone,
  ShoppingCart,
  Store,
  TrendingUp,
  Heart,
  Package,
  Wrench,
  DollarSign,
  Users,
  Cpu,
  Truck,
  Sparkles,
  Palette,
  Headphones,
  Scale,
  Hammer,
  Briefcase,
  GitBranch,
  CheckSquare,
  FileCheck,
  Zap,
  BarChart3,
  Bell,
  Settings,
  Shield,
  Plug,
  Sliders,
  ChevronRight,
  ChevronDown,
  LogOut,
  Search,
  Menu,
  X,
  Diamond,
};

/**
 * Get an icon component by name
 * Falls back to User icon if not found
 */
export function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return iconMap[iconName] || User;
}
