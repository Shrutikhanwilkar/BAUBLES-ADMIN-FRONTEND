import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare } from "lucide-react";

const queries = [
  {
    id: 1,
    user: "John Doe",
    email: "john@example.com",
    subject: "Unable to add audio book",
    message: "I'm having trouble adding a new audio book to my child's profile. The upload button doesn't seem to work.",
    date: "2 hours ago",
    status: "unresolved",
  },
  {
    id: 2,
    user: "Sarah Smith",
    email: "sarah@example.com",
    subject: "Gift not showing",
    message: "The gift I selected for my child is not appearing in the dashboard. Can you help?",
    date: "5 hours ago",
    status: "resolved",
  },
  {
    id: 3,
    user: "Michael Johnson",
    email: "michael@example.com",
    subject: "Account access issue",
    message: "I can't log into my account. It says my password is incorrect even though I'm using the right one.",
    date: "1 day ago",
    status: "unresolved",
  },
];

export default function Support() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {queries.filter((q) => q.status === "unresolved").length} Pending
        </Badge>
      </div>

      <div className="grid gap-4">
        {queries.map((query) => (
          <Card key={query.id} className="shadow-card hover-scale transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{query.subject}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {query.user}
                      </p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">{query.email}</p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">{query.date}</p>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={query.status === "resolved" ? "secondary" : "destructive"}
                >
                  {query.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{query.message}</p>
              <Button variant="default" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Reply via Email
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {queries.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Support Queries</h3>
            <p className="text-muted-foreground">
              All support queries have been resolved
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
