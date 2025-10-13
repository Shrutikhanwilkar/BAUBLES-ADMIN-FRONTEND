import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users as UsersIcon, Baby, MapPin } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    location: "New York, USA",
    children: [
      { name: "Emma Doe", age: 8 },
      { name: "Liam Doe", age: 5 },
    ],
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@example.com",
    location: "London, UK",
    children: [{ name: "Oliver Smith", age: 6 }],
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michael@example.com",
    location: "Toronto, Canada",
    children: [
      { name: "Sophia Johnson", age: 7 },
      { name: "Noah Johnson", age: 4 },
      { name: "Ava Johnson", age: 9 },
    ],
  },
];

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users Management</h1>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Parent Users
            </CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockUsers.map((user) => (
              <Collapsible key={user.id}>
                <Card className="hover-scale transition-all">
                  <CollapsibleTrigger className="w-full">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {user.location}
                        </div>
                        <Badge variant="secondary">
                          {user.children.length} Children
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-2 border-t">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Baby className="h-4 w-4" />
                        Children Profiles
                      </p>
                      <div className="grid gap-3 md:grid-cols-3">
                        {user.children.map((child, index) => (
                          <Card key={index} className="bg-muted/50">
                            <CardContent className="p-4">
                              <p className="font-medium">{child.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Age: {child.age}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
