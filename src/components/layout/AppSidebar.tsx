import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookAudio,
  Gift,
  FolderTree,
  HelpCircle,
  Bell,
  User,
  Headphones,
  UserCog,
  Settings,
  BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const superAdminMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Your Profile", url: "/profile", icon: User },
  { title: "Admin Management", url: "/admin-management", icon: UserCog },
  { title: "All Users", url: "/users", icon: Users },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Help & Support", url: "/support", icon: HelpCircle },
  { title: "Audio Books", url: "/audiobooks", icon: Headphones },
  { title: "Music Library", url: "/musiclibrary", icon: BookAudio },
  { title: "Gifts", url: "/gifts", icon: Gift },
  { title: "Behaviour", url: "/categories", icon: FolderTree },
  { title: "Send Broadcast", url: "/notifications", icon: Bell },
  { title: "Version Control", url: "/version-control", icon: Settings },
];

const adminMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Your Profile", url: "/profile", icon: User },
  { title: "Registered Users", url: "/users", icon: Users },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Help & Support", url: "/support", icon: HelpCircle },
  { title: "Audio Books", url: "/audiobooks", icon: Headphones },
  { title: "Music Library", url: "/musiclibrary", icon: BookAudio },
  { title: "Gifts", url: "/gifts", icon: Gift },
  { title: "Behaviour", url: "/categories", icon: FolderTree },
  { title: "Send Broadcast", url: "/notifications", icon: Bell },
];

export function AppSidebar() {
  const { open, state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === "collapsed";
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role || "");
  }, []);

  const menuItems = userRole === "SUPERADMIN" ? superAdminMenuItems : adminMenuItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className={`${isCollapsed ? 'px-2' : 'px-0'}`}>
        <div className={`flex items-center transition-all duration-200 ${isCollapsed ? 'py-6 justify-center' : 'px-6 py-6 gap-3'}`}>
          <div className="w-14 h-14 rounded-xl bg-[#dc2626] flex items-center justify-center shadow-md shrink-0">
            <img
              src="/logo.png"
              alt="Baubles Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
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
            <SidebarMenu className={`gap-1 ${isCollapsed ? 'px-0' : 'px-3'}`}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + '/');
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      size="lg"
                      tooltip={isCollapsed ? item.title : undefined}
                      className={`${isActive
                        ? "bg-[#dc2626] text-white hover:bg-[#dc2626] hover:text-white data-[active=true]:bg-[#dc2626] data-[active=true]:text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        } rounded-lg transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      <NavLink to={item.url} className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!isCollapsed && <span className="font-medium text-[15px]">{item.title}</span>}
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