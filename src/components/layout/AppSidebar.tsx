import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookAudio,
  Gift,
  FolderTree,
  HelpCircle,
  Bell,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Admin Profile", url: "/profile", icon: User },
  { title: "Users", url: "/users", icon: Users },
  { title: "Help & Support", url: "/support", icon: HelpCircle },
  { title: "Audio Books", url: "/audiobooks", icon: BookAudio },
  { title: "Gifts", url: "/gifts", icon: Gift },
  { title: "Categories", url: "/categories", icon: FolderTree },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarContent className="bg-card">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <Gift className="h-6 w-6 text-white" />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="font-bold text-xl text-foreground">
                Baubles
              </span>
              <span className="text-sm text-muted-foreground">
                Admin Panel
              </span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`transition-all mx-3 my-1 ${
                        isActive
                          ? "bg-primary text-white hover:bg-primary hover:text-white rounded-xl"
                          : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                      }`}
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
