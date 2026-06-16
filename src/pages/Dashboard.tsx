import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
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
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [inputUrl, setInputUrl] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "pie">("chart");
  const [statePercentageData, setStatePercentageData] = useState<any[]>([]);
  const [stateLoading, setStateLoading] = useState(true);
  const [avgNice, setAvgNice] = useState(0);
  const [avgNaughty, setAvgNaughty] = useState(0);
  const [userName, setUserName] = useState<string>("Admin");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
    fetchDashboardStats();
    fetchStateReport();
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
            setOriginalUrl(response.data.dashboardVideo.videoFile);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch dashboard stats");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStateReport = async () => {
    try {
      setStateLoading(true);
      const response = await apiService.getStateReport();
      if (response.success) {
        const allStatesNice = response.data.data.reduce((sum, state) => sum + state.nice, 0);
        const allStatesNaughty = response.data.data.reduce((sum, state) => sum + state.naughty, 0);
        const allStatesTotal = allStatesNice + allStatesNaughty;
        const allStatesNicePercent = allStatesTotal > 0 ? Math.round((allStatesNice / allStatesTotal) * 100) : 0;
        const allStatesNaughtyPercent = allStatesTotal > 0 ? Math.round((allStatesNaughty / allStatesTotal) * 100) : 0;

        const stateData = response.data.data.map((state) => {
          const total = state.nice + state.naughty;
          const nicePercent = total > 0 ? Math.round((state.nice / total) * 100) : 0;
          const naughtyPercent = total > 0 ? Math.round((state.naughty / total) * 100) : 0;

          return {
            state: state.state,
            nice: nicePercent,
            naughty: naughtyPercent,
            niceCount: state.nice,
            naughtyCount: state.naughty,
          };
        });

        const allStatesEntry = {
          state: "All States",
          nice: allStatesNicePercent,
          naughty: allStatesNaughtyPercent,
          niceCount: allStatesNice,
          naughtyCount: allStatesNaughty,
        };

        setStatePercentageData([allStatesEntry, ...stateData]);

        const totalNice = response.data.data.reduce((sum, state) => sum + state.nice, 0);
        const totalNaughty = response.data.data.reduce((sum, state) => sum + state.naughty, 0);
        const total = totalNice + totalNaughty;

        if (total > 0) {
          setAvgNice(Math.round((totalNice / total) * 100));
          setAvgNaughty(Math.round((totalNaughty / total) * 100));
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch state report");
    } finally {
      setStateLoading(false);
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
        setOriginalUrl(inputUrl);
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
    setInputUrl(originalUrl);
    setIsDialogOpen(true);
  };

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  const statsCards = [
    {
      title: "Parent Helpers",
      value: stats?.userCount || 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/users",
    },
    {
      title: "Believers",
      value: stats?.childrenCount || 0,
      icon: Baby,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      route: "/users",
    },
    {
      title: "Santa's Message Library",
      value: stats?.musicCount || 0,
      icon: BookAudio,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
      route: "/musiclibrary",
    },
    {
      title: "Active Gift Suggestions",
      value: stats?.giftCount || 0,
      icon: Gift,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
      route: "/gifts",
    },
  ];

  const stateChartData = stats?.stateCounts
    ? (() => {
      const entries = Object.entries(stats.stateCounts).map(([name, value], index) => ({
        name,
        value,
        color: STATE_COLORS[index % STATE_COLORS.length],
      }));

      const totalValue = entries.reduce((sum, entry) => sum + entry.value, 0);
      const otherThreshold = totalValue * 0.05;

      const mainEntries = entries.filter(entry => entry.value >= otherThreshold);
      const otherEntries = entries.filter(entry => entry.value < otherThreshold);

      if (otherEntries.length > 0) {
        const otherValue = otherEntries.reduce((sum, entry) => sum + entry.value, 0);
        mainEntries.push({
          name: "Other",
          value: otherValue,
          color: STATE_COLORS[mainEntries.length % STATE_COLORS.length],
        });
      }

      return mainEntries;
    })()
    : [];

  const genderCards = [
    {
      title: "Boys",
      value: stats?.maleChildren || 0,
      icon: Baby,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
    {
      title: "Girls",
      value: stats?.femaleChildren || 0,
      icon: Baby,
      color: "text-pink-600",
      bgColor: "bg-pink-600/10",
    },
    {
      title: "Rather Not Say",
      value: stats?.otherChildren || 0,
      icon: Baby,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
    },
  ];

  const pieData = [
    { name: "Naughty", value: avgNaughty, color: "#F44336" },
    { name: "Nice", value: avgNice, color: "#4CAF50" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to the North Pole Records Room, {userName}! 🎅</h1>
          <p className="text-muted-foreground">
            Here's what's happening with Santa's Records today.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card
            key={index}
            className="hover-scale shadow-card hover:shadow-elevated transition-all cursor-pointer"
            onClick={() => handleCardClick(stat.route)}
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
              Australia's Snapshot
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

            <div className="grid grid-cols-3 gap-4">
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

      {statePercentageData.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Santa's List Snapshot by State</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("chart")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === "chart" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      }`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setViewMode("pie")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === "pie" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      }`}
                  >
                    Overview
                  </button>
                </div>
              </div>

              {viewMode === "chart" ? (
                <>
                  <ResponsiveContainer width="100%" height={450}>
                    <BarChart data={statePercentageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="state"
                        angle={-45}
                        textAnchor="end"
                        height={115}
                        style={{ fontSize: '11px' }}
                      />
                      <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #f3f4f6',
                          borderRadius: '8px',
                        }}
                        formatter={(value, name, props) => {
                          const isNaughty = name === "Naughty %";
                          const count = isNaughty ? props.payload.naughtyCount : props.payload.niceCount;
                          return [count, isNaughty ? "Naughty" : "Nice"];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="naughty" fill="#F44336" radius={[8, 8, 0, 0]} name="Naughty %" />
                      <Bar dataKey="nice" fill="#4CAF50" radius={[8, 8, 0, 0]} name="Nice %" />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Overall Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `${value}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3">Statistics Summary</h4>
                    <div className="space-y-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Best Performing State</span>
                            <span className="font-semibold">
                              {statePercentageData.length > 1
                                ? statePercentageData.slice(1).reduce((max, state) => state.nice > max.nice ? state : max).state
                                : "N/A"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Needs Attention</span>
                            <span className="font-semibold">
                              {statePercentageData.length > 1
                                ? statePercentageData.slice(1).reduce((max, state) => state.naughty > max.naughty ? state : max).state
                                : "N/A"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total States Analyzed</span>
                            <span className="font-semibold">{statePercentageData.length - 1}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statePercentageData.map((state) => (
                  <Card key={state.state}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 text-sm">{state.state}</h4>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-600">Nice</span>
                          <span className="font-bold">{state.nice}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-red-600">Naughty</span>
                          <span className="font-bold">{state.naughty}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              {originalUrl && (
                <p className="text-xs text-muted-foreground">
                  Current URL: {originalUrl}
                </p>
              )}
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