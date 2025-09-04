

"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Library,
  Music,
  FileText,
  Upload,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppLogo } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProvider, useUser } from "@/context/user-context";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/library", icon: Library, label: "Music Library" },
  { href: "/dashboard/concerts", icon: Music, label: "Concerts" },
  { href: "/dashboard/copyright", icon: FileText, label: "Copyright Checker" },
  { href: "/dashboard/import", icon: Upload, label: "Import" },
  { href: "/dashboard/admin", icon: Shield, label: "Admin", requiredRole: "Music Director" },
];

function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const visibleNavItems = navItems.filter(item => {
    return !item.requiredRole || item.requiredRole === user.role;
  });

  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={item.label}
              className="justify-start"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-base">{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function UserProfile() {
  const router = useRouter();
  const { user } = useUser();

  const handleLogout = () => {
    router.push("/");
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('');
  }

  return (
    <UserProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 w-full h-auto p-2 justify-start">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://picsum.photos/100" data-ai-hint="profile picture" />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden group-data-[state=expanded]:block">
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/70">
                {user.role}
              </p>
            </div>
            <ChevronDown className="ml-auto h-4 w-4 opacity-50 hidden group-data-[state=expanded]:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/account">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </UserProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar
            className="border-r bg-sidebar text-sidebar-foreground"
            collapsible="icon"
          >
            <SidebarHeader className="p-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <AppLogo className="w-8 h-8 text-primary" />
                <span className="font-headline text-2xl font-semibold hidden group-data-[state=expanded]:inline">
                  Tartones
                </span>
              </Link>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <MainNav />
            </SidebarContent>
            <SidebarFooter className="p-4">
              <UserProfile />
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1 bg-background">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
