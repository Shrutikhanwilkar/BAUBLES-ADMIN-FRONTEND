import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Bell } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api_service";
import { BroadcastHistory, ApiError } from "@/services/api_types";

export default function Notifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<BroadcastHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!hasFetched.current) {
        hasFetched.current = true;
        if (isMounted) {
          await fetchBroadcastHistory();
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchBroadcastHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await apiService.getBroadcastHistory();

      if (response.success) {
        setHistory(response.data.data || []);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to fetch broadcast history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (message.length > 150) {
      toast.error("Message cannot exceed 150 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.sendBroadcast({
        title: title,
        body: message,
        type: "maintenance"
      });

      if (response.success) {
        toast.success(`Broadcast sent successfully to ${response.data.users} users!`);
        setTitle("");
        setMessage("");
        await fetchBroadcastHistory();
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 14) {
      return '1 week ago';
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Broadcast Management</h1>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Create New Broadcast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Broadcast Title</Label>
            <Input
              id="title"
              placeholder="Enter broadcast title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-sm text-muted-foreground">({message.length}/150)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= 150) {
                  setMessage(e.target.value);
                }
              }}
              rows={4}
              maxLength={150}
              disabled={loading}
            />
          </div>

          {title && message && (
            <Card className="bg-muted/50 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Maintenance</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleSend}
            className="w-full"
            size="lg"
            disabled={loading}
          >
            <Send className="mr-2 h-4 w-4" />
            {loading ? 'Sending...' : 'Send Broadcast'}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Broadcast History</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No broadcast history available</div>
          ) : (
            <div className="space-y-4">
              {history.map((broadcast) => (
                <Card key={broadcast._id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        {broadcast.title && (
                          <p className="font-semibold mb-1">{broadcast.title}</p>
                        )}
                        {broadcast.body && (
                          <p className="text-sm text-muted-foreground mb-2">{broadcast.body}</p>
                        )}
                        {!broadcast.title && !broadcast.body && (
                          <p className="text-sm text-muted-foreground italic mb-2">No content available</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {broadcast.type && (
                            <Badge variant="secondary" className="capitalize">
                              {broadcast.type}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(broadcast.createdAt)}
                          </span>
                          <Badge variant="outline">
                            {broadcast.activeUserCount} {broadcast.activeUserCount === 1 ? 'user' : 'users'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}