import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Baby, BookAudio, Gift, Video, TrendingUp, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiService } from "@/services/api_service";
import { DashboardStats } from "@/services/api_types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { toast } from "sonner";

const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const STATE_COLORS = [
  "#dc2626",
  "#2563eb",
  "#9333ea",
  "#16a34a",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
];

export default function Dashboard() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [inputUrl, setInputUrl] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
        if (response.data.dashboardVideo?.videoFile) {
          const embedUrl = getYouTubeEmbedUrl(response.data.dashboardVideo.videoFile);
          if (embedUrl) {
            setVideoUrl(embedUrl);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch dashboard stats");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVideo = async () => {
    if (!inputUrl.trim()) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    const embedUrl = getYouTubeEmbedUrl(inputUrl);
    if (!embedUrl) {
      toast.error("Invalid YouTube URL");
      return;
    }

    try {
      setIsSaving(true);
      const response = await apiService.addDashboardVideo({
        videoFile: inputUrl,
      });

      if (response.success) {
        setVideoUrl(embedUrl);
        setInputUrl("");
        setIsDialogOpen(false);
        toast.success("Dashboard video updated successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update video");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const statsCards = [
    {
      title: "Total Parents",
      value: stats?.userCount || 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Children",
      value: stats?.childrenCount || 0,
      icon: Baby,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
    {
      title: "Music Library",
      value: stats?.musicCount || 0,
      icon: BookAudio,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
    },
    {
      title: "Total Gifts",
      value: stats?.giftCount || 0,
      icon: Gift,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
  ];

  const stateChartData = stats?.stateCounts
    ? Object.entries(stats.stateCounts).map(([name, value], index) => ({
      name,
      value,
      color: STATE_COLORS[index % STATE_COLORS.length],
    }))
    : [];

  const genderCards = [
    {
      title: "Male Children",
      value: stats?.maleChildren || 0,
      icon: Baby,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
    {
      title: "Female Children",
      value: stats?.femaleChildren || 0,
      icon: Baby,
      color: "text-pink-600",
      bgColor: "bg-pink-600/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
          <p className="text-muted-foreground">
            Here's what's happening today.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
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
              <div className="text-3xl font-bold">
                {isLoading ? "..." : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Dashboard Video
            </CardTitle>
            {videoUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDialog}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit URL
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {videoUrl ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  width="100%"
                  height="100%"
                  src={videoUrl}
                  title="Dashboard Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <>
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No video added yet
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleOpenDialog}
                >
                  Add Video
                </Button>
              </>
            )}
            {videoUrl && (
              <p className="text-sm text-muted-foreground">
                Featured video for users
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statewise Children's
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stateChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                >
                  {stateChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #f3f4f6',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4">
              {genderCards.map((card, index) => (
                <Card key={index} className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : card.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Update Video URL</DialogTitle>
            <DialogDescription>
              Enter a YouTube video URL to display on the dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="youtube-url" className="text-sm font-medium">
                YouTube URL
              </label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full"
                disabled={isSaving}
              />
            </div>
            <Button
              onClick={handleUpdateVideo}
              className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white"
              disabled={isSaving}
            >
              {isSaving ? "Updating..." : "Update Video"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}