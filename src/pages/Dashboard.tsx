import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Baby, BookAudio, Gift, Video, Activity } from "lucide-react";

const stats = [
  {
    title: "Total Parents",
    value: "1,234",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Total Children",
    value: "2,456",
    icon: Baby,
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
  },
  {
    title: "Audio Books",
    value: "89",
    icon: BookAudio,
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
  },
  {
    title: "Total Gifts",
    value: "156",
    icon: Gift,
    color: "text-green-600",
    bgColor: "bg-green-600/10",
  },
];

const recentActivities = [
  { action: "New parent registered", time: "5 minutes ago", user: "John Doe" },
  { action: "Gift added", time: "15 minutes ago", user: "Admin" },
  { action: "Audio book updated", time: "1 hour ago", user: "Admin" },
  { action: "Support query resolved", time: "2 hours ago", user: "Sarah Smith" },
  { action: "New child profile created", time: "3 hours ago", user: "Jane Wilson" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your platform today
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="hover-scale shadow-card hover:shadow-elevated transition-all"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Dashboard Video
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Current video: Welcome Tutorial
            </p>
            <Button variant="outline" className="w-full">
              Change Video
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
