import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileStack,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Send,
  Users,
  UserRound,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";

type NavItem = { label: string; to: string; icon: typeof LayoutDashboard };

const NAV: Record<Role, NavItem[]> = {
  STUDENT: [
    { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Courses", to: "/student/courses", icon: BookOpen },
    { label: "Assessments", to: "/student/assessments", icon: ClipboardList },
    { label: "Submissions", to: "/student/submissions", icon: Send },
    { label: "Grades", to: "/student/grades", icon: ScrollText },
    { label: "Profile", to: "/student/profile", icon: UserRound },
  ],
  LECTURER: [
    { label: "Dashboard", to: "/lecturer/dashboard", icon: LayoutDashboard },
    { label: "My Courses", to: "/lecturer/courses", icon: BookOpen },
    { label: "Materials", to: "/lecturer/materials", icon: FileStack },
    { label: "Assessments", to: "/lecturer/assessments", icon: ClipboardList },
    { label: "Submissions", to: "/lecturer/submissions", icon: Send },
    { label: "Grading", to: "/lecturer/grading", icon: ScrollText },
    { label: "Statistics", to: "/lecturer/statistics", icon: BarChart3 },
    { label: "Profile", to: "/lecturer/profile", icon: UserRound },
  ],
  ADMIN: [
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Courses", to: "/admin/courses", icon: BookOpen },
    { label: "Users", to: "/admin/users", icon: Users },
    { label: "Academic Structure", to: "/admin/academic", icon: Building2 },
    { label: "Statistics", to: "/admin/statistics", icon: BarChart3 },
    { label: "Profile", to: "/admin/profile", icon: UserRound },
  ],
};

function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV[role].map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active &&
                "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_var(--sidebar-primary)]",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
      <span className="grid size-9 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <GraduationCap className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-base font-semibold text-sidebar-foreground">Chuo LMS</p>
        <p className="text-[11px] uppercase tracking-widest text-sidebar-foreground/60">
          Learning Portal
        </p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const role = (user?.role ?? "STUDENT") as Role;

  async function handleLogout() {
    await logout();
    toast.success("Logged out successfully");
    navigate({ to: "/login", replace: true });
  }

  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar lg:flex">
        <Brand />
        <SidebarNav role={role} />
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0 text-sidebar-foreground">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <SidebarNav role={role} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-semibold text-foreground">{title}</h1>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>

          <Badge variant="secondary" className="hidden capitalize sm:inline-flex">
            {role.toLowerCase()}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials || "?"}
                </span>
                <span className="hidden text-sm font-medium sm:inline">
                  {user?.first_name} {user?.last_name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.login_id}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => navigate({ to: `/${role.toLowerCase()}/profile` })}
              >
                <UserRound className="mr-2 size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 size-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
