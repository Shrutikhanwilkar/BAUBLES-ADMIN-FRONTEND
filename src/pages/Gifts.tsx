import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const gifts = [
  {
    id: 1,
    title: "Educational Toy Set",
    description: "Complete set of learning toys for early childhood development",
    image: "🧸",
    redirectUrl: "https://example.com/toy",
  },
  {
    id: 2,
    title: "Story Book Collection",
    description: "Beautiful collection of illustrated children's books",
    image: "📖",
    redirectUrl: "https://example.com/books",
  },
  {
    id: 3,
    title: "Art & Craft Kit",
    description: "Creative art supplies for young artists",
    image: "🎨",
    redirectUrl: "https://example.com/art",
  },
];

export default function Gifts() {
  const handleDelete = (id: number) => {
    toast.success("Gift deleted successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gifts Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Gift
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gifts.map((gift) => (
          <Card key={gift.id} className="shadow-card hover-scale transition-all">
            <CardHeader>
              <div className="w-full h-40 rounded-lg bg-primary/10 flex items-center justify-center text-6xl mb-4">
                {gift.image}
              </div>
              <CardTitle className="text-lg">{gift.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{gift.description}</p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <ExternalLink className="h-4 w-4" />
                <span className="truncate">{gift.redirectUrl}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDelete(gift.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        size="lg"
        className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-elevated"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
