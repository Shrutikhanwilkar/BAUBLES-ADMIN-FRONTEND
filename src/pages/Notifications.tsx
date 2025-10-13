import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Bell } from "lucide-react";
import { toast } from "sonner";

const pastNotifications = [
  {
    id: 1,
    title: "New Gift Available",
    message: "Check out our new educational toy set!",
    type: "Gift",
    date: "2 days ago",
  },
  {
    id: 2,
    title: "Featured Audio Book",
    message: "Listen to our featured bedtime story collection",
    type: "Audio Book",
    date: "1 week ago",
  },
  {
    id: 3,
    title: "Dashboard Update",
    message: "New video tutorial available on dashboard",
    type: "Dashboard Video",
    date: "2 weeks ago",
  },
];

export default function Notifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const handleSend = () => {
    if (title && message && type) {
      toast.success("Notification sent successfully!");
      setTitle("");
      setMessage("");
      setType("");
    } else {
      toast.error("Please fill in all fields");
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Notification Broadcast</h1>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Create New Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              placeholder="Enter notification title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select notification type" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="gift">Gift</SelectItem>
                <SelectItem value="audiobook">Audio Book</SelectItem>
                <SelectItem value="video">Dashboard Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {title && message && type && (
            <Card className="bg-muted/50 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{message}</p>
                    <Badge variant="secondary" className="mt-2">
                      {type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleSend} className="w-full" size="lg">
            <Send className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Past Broadcasts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastNotifications.map((notification) => (
              <Card key={notification.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Bell className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{notification.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {notification.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
