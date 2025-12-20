import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, AlertTriangle, XCircle, Users, Award, TrendingDown, BarChart3, Trophy, Medal, Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api_service";
import { Category } from "@/services/api_types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CategorySkeleton = () => (
  <Card className="shadow-card animate-pulse min-w-[200px]">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted/80"></div>
        <div className="h-5 w-24 bg-muted/80 rounded"></div>
      </div>
    </CardContent>
  </Card>
);

const StatCardSkeleton = () => (
  <Card className="shadow-card animate-pulse">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-muted/80"></div>
        <div className="flex-1">
          <div className="h-4 w-24 bg-muted/80 rounded mb-2"></div>
          <div className="h-8 w-16 bg-muted/80 rounded"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const NameListSkeleton = () => (
  <div className="space-y-1 max-h-[500px] overflow-y-auto border rounded-lg">
    {[...Array(10)].map((_, index) => (
      <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0 animate-pulse">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-5 h-5 bg-muted/80 rounded"></div>
          <div className="h-4 w-24 bg-muted/80 rounded"></div>
        </div>
        <div className="h-4 w-8 bg-muted/80 rounded"></div>
      </div>
    ))}
  </div>
);

const STATES = [
  "Queensland",
  "New South Wales",
  "Tasmania",
  "South Australia",
  "Victoria",
  "Western Australia",
  "Northern Territory"
];

export default function Reports() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>(STATES[0]);
  const [viewMode, setViewMode] = useState<"chart" | "pie">("chart");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<"popular" | "behavior">("popular");
  const [exporting, setExporting] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [realChartData, setRealChartData] = useState<any[]>([]);
  const hasFetched = useRef(false);
  const [popularLoading, setPopularLoading] = useState(true);
  const [behaviourLoading, setBehaviourLoading] = useState(true);
  const [stateLoading, setStateLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [boysNameData, setBoysNameData] = useState<any[]>([]);
  const [girlsNameData, setGirlsNameData] = useState<any[]>([]);
  const [naughtyNameData, setNaughtyNameData] = useState<any[]>([]);
  const [niceNameData, setNiceNameData] = useState<any[]>([]);
  const [statePercentageData, setStatePercentageData] = useState<any[]>([]);
  const [totalChildren, setTotalChildren] = useState(0);
  const [avgNice, setAvgNice] = useState(0);
  const [avgNaughty, setAvgNaughty] = useState(0);
  const iconOptions = [
    { value: "Star", component: Star },
    { value: "TrendingUp", component: TrendingUp },
    { value: "AlertTriangle", component: AlertTriangle },
    { value: "XCircle", component: XCircle },
  ];
  const iconMapping: { [key: number]: string } = {
    1: "Star",
    2: "TrendingUp",
    3: "AlertTriangle",
    4: "XCircle",
  };
  const getIconComponent = (rank: number) => {
    let iconName: string;
    if (rank >= 4) {
      iconName = "XCircle";
    } else {
      iconName = iconMapping[rank] || "Star";
    }
    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.component : Star;
  };
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      if (!hasFetched.current) {
        hasFetched.current = true;
        if (isMounted) {
          await fetchCategories();
          await fetchAllReports();
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    if (categories.length > 0 && selectedState) {
      fetchReportsByState(selectedState);
    }
  }, [selectedState, categories]);
  const fetchAllReports = async () => {
    await Promise.all([
      fetchPopularReport(),
      fetchBehaviourReport(),
      fetchStateReport()
    ]);
  };
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchPopularReport = async () => {
    try {
      setPopularLoading(true);
      const response = await apiService.getPopularReport();
      if (response.success) {
        const boysData = response.data.data.top20BoysName.map((item, index) => ({
          rank: index + 1,
          name: item.firstName,
          count: item.count,
        }));

        const girlsData = response.data.data.top20GirlsName.map((item, index) => ({
          rank: index + 1,
          name: item.firstName,
          count: item.count,
        }));

        setBoysNameData(boysData);
        setGirlsNameData(girlsData);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch popular report");
    } finally {
      setPopularLoading(false);
    }
  };
  const fetchBehaviourReport = async () => {
    try {
      setBehaviourLoading(true);
      setStatsLoading(true);
      const response = await apiService.getBehaviourReport();
      if (response.success) {
        const niceData = response.data.data.topNice.map((item, index) => ({
          rank: index + 1,
          name: item.firstName,
          count: item.count,
        }));

        const naughtyData = response.data.data.topNaughty.map((item, index) => ({
          rank: index + 1,
          name: item.firstName,
          count: item.count,
        }));

        setNiceNameData(niceData);
        setNaughtyNameData(naughtyData);

        setTotalChildren(response.data.totalChildren);
        const totalNice = response.data.totalNice;
        const totalNaughty = response.data.totalNaughty;
        const total = totalNice + totalNaughty;

        if (total > 0) {
          setAvgNice(Math.round((totalNice / total) * 100));
          setAvgNaughty(Math.round((totalNaughty / total) * 100));
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch behaviour report");
    } finally {
      setBehaviourLoading(false);
      setStatsLoading(false);
    }
  };
  const fetchStateReport = async () => {
    try {
      setStateLoading(true);
      const response = await apiService.getStateReport();
      if (response.success) {
        const stateData = response.data.data.map((state) => {
          const total = state.nice + state.naughty;
          const nicePercent = total > 0 ? Math.round((state.nice / total) * 100) : 0;
          const naughtyPercent = total > 0 ? Math.round((state.naughty / total) * 100) : 0;

          return {
            state: state.state,
            nice: nicePercent,
            naughty: naughtyPercent,
          };
        });

        setStatePercentageData(stateData);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch state report");
    } finally {
      setStateLoading(false);
    }
  };
  const fetchReportsByState = async (state: string) => {
    try {
      setChartLoading(true);
      const response = await apiService.getReportsByState({ state });
      if (response.success && response.data.length > 0) {
        const stateData = response.data[0];
        const formattedData = Object.entries(stateData.categories).map(([name, count]) => {
          const category = categories.find(cat => cat.name === name);
          return {
            name,
            children: count as number,
            fill: category?.color || '#999999',
          };
        });
        setRealChartData(formattedData);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch reports by state");
    } finally {
      setChartLoading(false);
    }
  };
  const chartData = realChartData.length > 0 ? realChartData : categories.map((category) => ({
    name: category.name,
    children: 0,
    fill: category.color,
  }));
  const handleCategoryClick = (categoryId: string) => {
    navigate(`/reports/category/${categoryId}`);
  };
  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "";
  };
  const pieData = [
    { name: "Naughty", value: avgNaughty, color: "#F44336" },
    { name: "Nice", value: avgNice, color: "#4CAF50" },
  ];
  const handleOpenExportDialog = (type: "popular" | "behavior") => {
    setExportType(type);
    setIsExportDialogOpen(true);
  };
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const csvRows = [];

      if (exportType === "popular") {
        csvRows.push(["Type", "Rank", "Name", "Count"]);

        boysNameData.forEach(item => {
          csvRows.push(["Boys", item.rank.toString(), item.name, item.count.toString()]);
        });

        girlsNameData.forEach(item => {
          csvRows.push(["Girls", item.rank.toString(), item.name, item.count.toString()]);
        });
      } else {
        csvRows.push(["List Type", "Rank", "Name", "Count"]);

        naughtyNameData.forEach(item => {
          csvRows.push(["Naughty", item.rank.toString(), item.name, item.count.toString()]);
        });

        niceNameData.forEach(item => {
          csvRows.push(["Nice", item.rank.toString(), item.name, item.count.toString()]);
        });
      }

      const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportType}_names_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsExportDialogOpen(false);
      toast.success(`CSV exported successfully`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };
  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text(exportType === "popular" ? 'Popular Names Report' : 'Behaviour Lists Report', 14, 22);

      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      const tableData: any[] = [];

      if (exportType === "popular") {
        boysNameData.forEach(item => {
          tableData.push(["Boys", item.rank.toString(), item.name, item.count.toString()]);
        });

        girlsNameData.forEach(item => {
          tableData.push(["Girls", item.rank.toString(), item.name, item.count.toString()]);
        });

        autoTable(doc, {
          head: [['Type', 'Rank', 'Name', 'Count']],
          body: tableData,
          startY: 40,
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [76, 175, 80], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { top: 40 },
        });
      } else {
        naughtyNameData.forEach(item => {
          tableData.push(["Naughty", item.rank.toString(), item.name, item.count.toString()]);
        });

        niceNameData.forEach(item => {
          tableData.push(["Nice", item.rank.toString(), item.name, item.count.toString()]);
        });

        autoTable(doc, {
          head: [['List Type', 'Rank', 'Name', 'Count']],
          body: tableData,
          startY: 40,
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [76, 175, 80], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { top: 40 },
        });
      }

      doc.save(`${exportType}_names_export_${new Date().toISOString().split('T')[0]}.pdf`);

      setIsExportDialogOpen(false);
      toast.success(`PDF exported successfully`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive analysis of children's behaviour patterns</p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[...Array(6)].map((_, index) => (
            <CategorySkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.visibilityRank);
            return (
              <Card
                key={category._id}
                className="shadow-card hover-scale transition-all cursor-pointer min-w-[200px] flex-shrink-0"
                onClick={() => handleCategoryClick(category._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: category.color + '30' }}
                    >
                      <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                    </div>
                    <h3 className="font-semibold text-base whitespace-nowrap">{category.name}</h3>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {statsLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Children</p>
                  <p className="text-2xl font-bold">{totalChildren}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nice Average</p>
                  <p className="text-2xl font-bold">{avgNice}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Naughty Average</p>
                  <p className="text-2xl font-bold">{avgNaughty}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-card">
        <CardContent className="p-6">
          <Tabs defaultValue="popular-names" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger
                value="popular-names"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Popular Names
              </TabsTrigger>
              <TabsTrigger
                value="behavior-lists"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Behaviour Lists
              </TabsTrigger>
              <TabsTrigger
                value="state-analysis"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                State Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popular-names" className="space-y-4 mt-6">
              <div className="flex justify-end mb-4">
                <Button onClick={() => handleOpenExportDialog("popular")} disabled={popularLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              {popularLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Top 20 Boys Names</h3>
                      </div>
                    </div>
                    <NameListSkeleton />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-pink-600" />
                        <h3 className="text-lg font-semibold">Top 20 Girls Names</h3>
                      </div>
                    </div>
                    <NameListSkeleton />
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Top 20 Boys Names</h3>
                      </div>
                    </div>
                    <div className="space-y-1 max-h-[500px] overflow-y-auto border rounded-lg">
                      {boysNameData.length > 0 ? boysNameData.map((item) => (
                        <div
                          key={item.rank}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            {item.rank <= 3 ? (
                              <Trophy className={`h-5 w-5 ${getMedalColor(item.rank)}`} />
                            ) : (
                              <span className="text-sm font-bold text-muted-foreground w-5 text-center">{item.rank}</span>
                            )}
                            <span className="font-medium capitalize">{item.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.count}</span>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-muted-foreground">No data available</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-pink-600" />
                        <h3 className="text-lg font-semibold">Top 20 Girls Names</h3>
                      </div>
                    </div>
                    <div className="space-y-1 max-h-[500px] overflow-y-auto border rounded-lg">
                      {girlsNameData.length > 0 ? girlsNameData.map((item) => (
                        <div
                          key={item.rank}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            {item.rank <= 3 ? (
                              <Trophy className={`h-5 w-5 ${getMedalColor(item.rank)}`} />
                            ) : (
                              <span className="text-sm font-bold text-muted-foreground w-5 text-center">{item.rank}</span>
                            )}
                            <span className="font-medium capitalize">{item.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{item.count}</span>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-muted-foreground">No data available</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="behavior-lists" className="space-y-4 mt-6">
              <div className="flex justify-end mb-4">
                <Button onClick={() => handleOpenExportDialog("behavior")} disabled={behaviourLoading}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              {behaviourLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                        <h3 className="text-lg font-semibold">Top 20 Naughty List</h3>
                      </div>
                    </div>
                    <NameListSkeleton />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Top 20 Nice List</h3>
                      </div>
                    </div>
                    <NameListSkeleton />
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                        <h3 className="text-lg font-semibold">Top 20 Naughty List</h3>
                      </div>
                    </div>
                    <div className="space-y-1 max-h-[500px] overflow-y-auto border rounded-lg">
                      {naughtyNameData.length > 0 ? naughtyNameData.map((item) => (
                        <div
                          key={item.rank}
                          className="flex items-center justify-between p-3 hover:bg-red-50 transition-colors border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-red-600 w-5 text-center">{item.rank}</span>
                            <span className="font-medium capitalize">{item.name}</span>
                          </div>
                          <Badge variant="outline" className="text-red-600 border-red-300">{item.count}</Badge>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-muted-foreground">No data available</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Top 20 Nice List</h3>
                      </div>
                    </div>
                    <div className="space-y-1 max-h-[500px] overflow-y-auto border rounded-lg">
                      {niceNameData.length > 0 ? niceNameData.map((item) => (
                        <div
                          key={item.rank}
                          className="flex items-center justify-between p-3 hover:bg-green-50 transition-colors border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-green-600 w-5 text-center">{item.rank}</span>
                            <span className="font-medium capitalize">{item.name}</span>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-300">{item.count}</Badge>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-muted-foreground">No data available</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="state-analysis" className="mt-6">
              {stateLoading ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Behaviour Distribution Across States</h3>
                  </div>
                  <div className="h-[450px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
              ) : statePercentageData.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Behaviour Distribution Across States</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode("chart")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === "chart" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                      >
                        Bar Chart
                      </button>
                      <button
                        onClick={() => setViewMode("pie")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === "pie" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
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
                      formatter={(value) => `${value}%`}
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
                            {statePercentageData.reduce((max, state) => state.nice > max.nice ? state : max).state}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Needs Attention</span>
                          <span className="font-semibold">
                            {statePercentageData.reduce((max, state) => state.naughty > max.naughty ? state : max).state}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total States Analyzed</span>
                          <span className="font-semibold">{statePercentageData.length}</span>
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
          ) : (
          <div className="p-8 text-center text-muted-foreground">
            No state data available
          </div>
          )}
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card >

  <Card className="shadow-card">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Children Distribution by Category</h2>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent>
            {STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {chartLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} barSize={85}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #f3f4f6',
                borderRadius: '8px',
              }}
            />
            <Bar
              dataKey="children"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </CardContent>
  </Card>

  <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Export {exportType === "popular" ? "Popular Names" : "Behaviour Lists"} Data</DialogTitle>
        <DialogDescription>
          Choose the format you want to export the data
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center gap-2"
          onClick={handleExportCSV}
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
          )}
          <span className="font-semibold">
            {exporting ? "Exporting..." : "Export as CSV"}
          </span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex flex-col items-center justify-center gap-2"
          onClick={handleExportPDF}
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
          ) : (
            <FileText className="h-8 w-8 text-red-600" />
          )}
          <span className="font-semibold">
            {exporting ? "Exporting..." : "Export as PDF"}
          </span>
        </Button>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsExportDialogOpen(false)} disabled={exporting}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div >
);
}