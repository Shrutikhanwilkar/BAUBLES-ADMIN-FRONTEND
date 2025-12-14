import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, AlertTriangle, XCircle, Users, Award, TrendingDown, BarChart3, Trophy, Medal } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api_service";
import { Category } from "@/services/api_types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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

const STATES = [
  "Queensland",
  "New South Wales",
  "Tasmania",
  "South Australia",
  "Victoria",
  "Western Australia",
  "Northern Territory"
];

const TOP_BOYS_NAMES = [
  "Oliver", "Noah", "Jack", "Leo", "Charlie", "Henry", "William", "Thomas", "Lucas", "Liam",
  "Hudson", "Oscar", "Harry", "Archer", "Theodore", "Cooper", "Mason", "Ethan", "James", "Max"
];

const TOP_GIRLS_NAMES = [
  "Charlotte", "Amelia", "Isla", "Olivia", "Mia", "Ava", "Grace", "Chloe", "Willow", "Sophie",
  "Ella", "Emily", "Zoe", "Harper", "Matilda", "Ruby", "Lily", "Ivy", "Evie", "Lucy"
];

const TOP_NAUGHTY_NAMES = [
  "Jackson", "Liam", "Noah", "Mason", "Ethan", "Logan", "Lucas", "Oliver", "Charlie", "Henry",
  "Mia", "Olivia", "Ava", "Emily", "Isla", "Harper", "Charlotte", "Amelia", "Sophie", "Grace"
];

const TOP_NICE_NAMES = [
  "Theodore", "Sebastian", "Alexander", "Benjamin", "William", "James", "Thomas", "Leo", "Jack", "Oscar",
  "Matilda", "Ruby", "Lily", "Ivy", "Evie", "Lucy", "Zoe", "Chloe", "Willow", "Ella"
];

export default function Reports() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>(STATES[0]);
  const [viewMode, setViewMode] = useState<"chart" | "pie">("chart");
  const hasFetched = useRef(false);

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
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const chartData = categories.map((category) => ({
    name: category.name,
    children: Math.floor(Math.random() * 100) + 20,
    fill: category.color,
  }));

  const statePercentageData = STATES.map((state) => {
    const naughtyPercent = Math.floor(Math.random() * 40) + 30;
    const nicePercent = 100 - naughtyPercent;
    return {
      state,
      naughty: naughtyPercent,
      nice: nicePercent,
    };
  });

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/reports/category/${categoryId}`);
  };

  const boysNameData = TOP_BOYS_NAMES.map((name, index) => ({
    rank: index + 1,
    name,
    count: 100 - (index * 4),
  }));

  const girlsNameData = TOP_GIRLS_NAMES.map((name, index) => ({
    rank: index + 1,
    name,
    count: 95 - (index * 4),
  }));

  const naughtyNameData = TOP_NAUGHTY_NAMES.map((name, index) => ({
    rank: index + 1,
    name,
    count: 85 - (index * 3),
  }));

  const niceNameData = TOP_NICE_NAMES.map((name, index) => ({
    rank: index + 1,
    name,
    count: 90 - (index * 3),
  }));

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "";
  };

  const totalNaughty = statePercentageData.reduce((acc, curr) => acc + curr.naughty, 0);
  const totalNice = statePercentageData.reduce((acc, curr) => acc + curr.nice, 0);
  const avgNaughty = Math.round(totalNaughty / statePercentageData.length);
  const avgNice = Math.round(totalNice / statePercentageData.length);

  const pieData = [
    { name: "Naughty", value: avgNaughty, color: "#F44336" },
    { name: "Nice", value: avgNice, color: "#4CAF50" },
  ];

  const behaviorTrend = STATES.map((state, index) => ({
    month: state.split(' ')[0].substring(0, 3),
    naughty: Math.floor(Math.random() * 30) + 25,
    nice: Math.floor(Math.random() * 30) + 45,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Behaviour Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive analysis of children's behavior patterns</p>
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Children</p>
                <p className="text-2xl font-bold">{chartData.reduce((acc, curr) => acc + curr.children, 0)}</p>
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
                Behavior Lists
              </TabsTrigger>
              <TabsTrigger
                value="state-analysis"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                State Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="popular-names" className="space-y-4 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Top 20 Boys Names</h3>
                    </div>
                    <Badge variant="secondary">{boysNameData.length}</Badge>
                  </div>
                  <div className="space-y-1 max-h-[500px] overflow-y-auto border rounded-lg">
                    {boysNameData.map((item) => (
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
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-pink-600" />
                      <h3 className="text-lg font-semibold">Top 20 Girls Names</h3>
                    </div>
                    <Badge variant="secondary">{girlsNameData.length}</Badge>
                  </div>
                  <div className="space-y-1 max-h-[500px] overflow-y-auto border rounded-lg">
                    {girlsNameData.map((item) => (
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
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="behavior-lists" className="space-y-4 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold">Top 20 Naughty List</h3>
                    </div>
                    <Badge variant="destructive">{naughtyNameData.length}</Badge>
                  </div>
                  <div className="space-y-1 max-h-[500px] overflow-y-auto border rounded-lg">
                    {naughtyNameData.map((item) => (
                      <div
                        key={item.rank}
                        className="flex items-center justify-between p-3 hover:bg-red-50 transition-colors border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-red-600 w-5 text-center">{item.rank}</span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline" className="text-red-600 border-red-300">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Top 20 Nice List</h3>
                    </div>
                    <Badge className="bg-green-600">{niceNameData.length}</Badge>
                  </div>
                  <div className="space-y-1 max-h-[500px] overflow-y-auto border rounded-lg">
                    {niceNameData.map((item) => (
                      <div
                        key={item.rank}
                        className="flex items-center justify-between p-3 hover:bg-green-50 transition-colors border-b last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-green-600 w-5 text-center">{item.rank}</span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-300">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="state-analysis" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Behavior Distribution Across States</h3>
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
                          formatter={(value) => `${value}%`}
                        />
                        <Legend />
                        <Bar dataKey="naughty" fill="#F44336" radius={[8, 8, 0, 0]} name="Naughty %" />
                        <Bar dataKey="nice" fill="#4CAF50" radius={[8, 8, 0, 0]} name="Nice %" />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* <div>
                      <h4 className="text-sm font-semibold mb-3">Behavior Trend</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={behaviorTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" style={{ fontSize: '11px' }} />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #f3f4f6',
                              borderRadius: '8px',
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="naughty" stroke="#F44336" strokeWidth={2} name="Naughty %" />
                          <Line type="monotone" dataKey="nice" stroke="#4CAF50" strokeWidth={2} name="Nice %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div> */}
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
                              <span className="font-semibold">{STATES.length}</span>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
        </CardContent>
      </Card>
    </div>
  );
}