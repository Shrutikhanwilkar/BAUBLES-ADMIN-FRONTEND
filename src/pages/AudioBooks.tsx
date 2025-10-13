import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Edit, Trash2, Star, BookAudio } from "lucide-react";
import { toast } from "sonner";

const audioBooks = [
  {
    id: 1,
    title: "The Adventure Begins",
    author: "Jane Author",
    category: "Adventure",
    isDefault: true,
    thumbnail: "🎧",
  },
  {
    id: 2,
    title: "Bedtime Stories",
    author: "John Writer",
    category: "Bedtime",
    isDefault: false,
    thumbnail: "📚",
  },
  {
    id: 3,
    title: "Learning ABC",
    author: "Sarah Educator",
    category: "Educational",
    isDefault: false,
    thumbnail: "🔤",
  },
];

export default function AudioBooks() {
  const handleDelete = (id: number) => {
    toast.success("Audio book deleted successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Audio Books</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Audio Book
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audioBooks.map((book) => (
                <TableRow key={book.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                      {book.thumbnail}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{book.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {book.isDefault && (
                      <Badge className="bg-primary">
                        <Star className="mr-1 h-3 w-3" />
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(book.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-elevated"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
