import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  Settings,
  BarChart3,
  ChevronDown,
  ChevronRight,
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
import { useUnsavedChanges } from "@/pages/UnsavedChangesContext ";

const superAdminMenuItems = [
  { title: "Records Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Believer Families", url: "/users", icon: Users },
  { title: "Believer Records", url: "/reports", icon: BarChart3 },
  { title: "Elf Support Desk", url: "/support", icon: HelpCircle },
  { title: "Gift Suggestions", url: "/gifts", icon: Gift },
  {
    title: "Bauble Settings",
    icon: Settings,
    isDropdown: true,
    subItems: [
      { title: "Santa's Message Library", url: "/musiclibrary", icon: BookAudio },
      { title: "Santa's Audio Books", url: "/audiobooks", icon: Headphones },
      { title: "Santa Broadcast", url: "/notifications", icon: Bell },
      { title: "Behaviour Categories", url: "/categories", icon: FolderTree },
      { title: "Version Control", url: "/version-control", icon: Settings },
    ],
  },
];

const adminMenuItems = [
  { title: "Records Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Believer Families", url: "/users", icon: Users },
  { title: "Believer Records", url: "/reports", icon: BarChart3 },
  { title: "Elf Support Desk", url: "/support", icon: HelpCircle },
  { title: "Gift Suggestions", url: "/gifts", icon: Gift },
  {
    title: "Bauble Settings",
    icon: Settings,
    isDropdown: true,
    subItems: [
      { title: "Santa's Message Library", url: "/musiclibrary", icon: BookAudio },
      { title: "Santa's Audio Books", url: "/audiobooks", icon: Headphones },
      { title: "Santa Broadcast", url: "/notifications", icon: Bell },
      { title: "Behaviour Categories", url: "/categories", icon: FolderTree },
    ],
  },
];

export function AppSidebar() {
  const { open, state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmNavigation } = useUnsavedChanges();
  const isCollapsed = state === "collapsed";
  const [userRole, setUserRole] = useState<string>("");
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role || "");
  }, []);

  useEffect(() => {
    const menuItems = userRole === "SUPERADMIN" ? superAdminMenuItems : adminMenuItems;
    const dropdownItem = menuItems.find(item => item.isDropdown);
    if (dropdownItem && dropdownItem.subItems) {
      const isAnySubItemActive = dropdownItem.subItems.some(
        subItem => location.pathname === subItem.url || location.pathname.startsWith(subItem.url + '/')
      );
      if (isAnySubItemActive) {
        setOpenDropdowns(prev => ({ ...prev, [dropdownItem.title]: true }));
      }
    }
  }, [location.pathname, userRole]);

  const menuItems = userRole === "SUPERADMIN" ? superAdminMenuItems : adminMenuItems;

  const toggleDropdown = (title: string) => {
    setOpenDropdowns(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleNavClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    confirmNavigation(() => navigate(url));
  };

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
                if (item.isDropdown && item.subItems) {
                  const isOpen = openDropdowns[item.title];
                  const isAnySubItemActive = item.subItems.some(
                    subItem => location.pathname === subItem.url || location.pathname.startsWith(subItem.url + '/')
                  );

                  return (
                    <div key={item.title}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          size="lg"
                          tooltip={isCollapsed ? item.title : undefined}
                          className={`${isAnySubItemActive
                            ? "bg-[#dc2626] text-white hover:bg-[#dc2626] hover:text-white shadow-sm"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            } rounded-lg transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} cursor-pointer`}
                          onClick={() => toggleDropdown(item.title)}
                        >
                          <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && (
                              <>
                                <span className="font-medium text-[15px] flex-1">{item.title}</span>
                                {isOpen ? (
                                  <ChevronDown className="h-4 w-4 shrink-0" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 shrink-0" />
                                )}
                              </>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      {!isCollapsed && isOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.subItems.map((subItem) => {
                            const isSubActive = location.pathname === subItem.url || location.pathname.startsWith(subItem.url + '/');
                            return (
                              <SidebarMenuItem key={subItem.title}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={isSubActive}
                                  size="lg"
                                  className={`${isSubActive
                                    ? "bg-[#dc2626]/10 text-[#dc2626] hover:bg-[#dc2626]/20 hover:text-[#dc2626] data-[active=true]:bg-[#dc2626]/10 data-[active=true]:text-[#dc2626]"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    } rounded-lg transition-all duration-200`}
                                >
                                  <NavLink to={subItem.url} onClick={(e) => handleNavClick(e, subItem.url)} className="flex items-center gap-3 pl-2">
                                    <subItem.icon className="h-4 w-4 shrink-0" />
                                    <span className="font-medium text-[14px]">{subItem.title}</span>
                                  </NavLink>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

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
                      <NavLink to={item.url} onClick={(e) => handleNavClick(e, item.url)} className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
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