import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/browser/components/ui/dialog";
import { Button } from "@/browser/components/ui/button";
import { Input } from "@/browser/components/ui/input";
import { Label } from "@/browser/components/ui/label";
import { Textarea } from "@/browser/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/browser/components/ui/select";
import { Badge } from "@/browser/components/ui/badge";
import { ScrollArea } from "@/browser/components/ui/scroll-area";
import { useCodeSnippets } from "@/browser/hooks/useCodeSnippets";
import {
  DEFAULT_SNIPPET_CATEGORIES,
  SUPPORTED_LANGUAGES,
  type CodeSnippet,
  type SnippetInput,
} from "@/common/types/codeSnippets";
import {
  Code,
  Plus,
  Search,
  Star,
  StarOff,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/common/lib/utils";

interface SnippetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert?: (code: string) => void; // Optional callback to insert snippet
}

export function SnippetLibrary({ isOpen, onClose, onInsert }: SnippetLibraryProps) {
  const {
    snippets,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    toggleFavorite,
    recordUsage,
    duplicateSnippet,
    filterSnippets,
    allTags,
    allCategories,
    exportSnippets,
    importSnippets,
  } = useCodeSnippets();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<SnippetInput>({
    name: "",
    code: "",
    language: "typescript",
  });
  const [tagInput, setTagInput] = useState("");

  // Filter snippets
  const filteredSnippets = useMemo(() => {
    return filterSnippets({
      search: searchQuery,
      language: selectedLanguage || undefined,
      category: selectedCategory || undefined,
    });
  }, [searchQuery, selectedLanguage, selectedCategory, filterSnippets]);

  // Handle create/edit
  const handleSave = useCallback(() => {
    if (!editForm.name || !editForm.code) return;

    if (selectedSnippet) {
      updateSnippet(selectedSnippet.id, editForm);
    } else {
      createSnippet(editForm);
    }

    setIsEditing(false);
    setSelectedSnippet(null);
    setEditForm({ name: "", code: "", language: "typescript" });
  }, [editForm, selectedSnippet, createSnippet, updateSnippet]);

  // Handle insert
  const handleInsert = useCallback(
    (snippet: CodeSnippet) => {
      if (onInsert) {
        recordUsage(snippet.id);
        onInsert(snippet.code);
        onClose();
      }
    },
    [onInsert, recordUsage, onClose]
  );

  // Handle import
  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const count = await importSnippets(file);
        alert(`Imported ${count} snippets successfully!`);
      } catch (error) {
        alert(`Failed to import snippets: ${error}`);
      }
    };
    input.click();
  }, [importSnippets]);

  // Add tag
  const handleAddTag = useCallback(() => {
    if (!tagInput || editForm.tags?.includes(tagInput)) return;
    setEditForm((prev) => ({
      ...prev,
      tags: [...(prev.tags ?? []), tagInput],
    }));
    setTagInput("");
  }, [tagInput, editForm.tags]);

  // Remove tag
  const handleRemoveTag = useCallback((tag: string) => {
    setEditForm((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }));
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="h-[80vh] max-w-5xl">
        <DialogHeader>
          <DialogTitle>Code Snippet Library</DialogTitle>
          <DialogDescription>Save and manage your frequently used code snippets</DialogDescription>
        </DialogHeader>

        <div className="flex h-full gap-4">
          {/* Left Panel - Snippet List */}
          <div className="flex flex-1 flex-col gap-3">
            {/* Search and Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  placeholder="Search snippets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  setSelectedSnippet(null);
                  setEditForm({ name: "", code: "", language: "typescript" });
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                New Snippet
              </Button>
              <Button size="sm" variant="outline" onClick={exportSnippets}>
                <Download className="mr-1 h-4 w-4" />
                Export
              </Button>
              <Button size="sm" variant="outline" onClick={handleImport}>
                <Upload className="mr-1 h-4 w-4" />
                Import
              </Button>
            </div>

            {/* Snippet List */}
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {filteredSnippets.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">No snippets found</div>
                ) : (
                  filteredSnippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className={cn(
                        "p-3 rounded border cursor-pointer hover:bg-accent transition-colors",
                        selectedSnippet?.id === snippet.id && "bg-accent"
                      )}
                      onClick={() => setSelectedSnippet(snippet)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 shrink-0" />
                            <span className="truncate font-medium">{snippet.name}</span>
                            {snippet.isFavorite && (
                              <Star className="h-3 w-3 shrink-0 fill-yellow-400 stroke-yellow-400" />
                            )}
                          </div>
                          {snippet.description && (
                            <p className="text-muted-foreground mt-1 truncate text-sm">
                              {snippet.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {snippet.language}
                            </Badge>
                            {snippet.category && (
                              <Badge variant="secondary" className="text-xs">
                                {snippet.category}
                              </Badge>
                            )}
                            {snippet.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(snippet.id);
                            }}
                          >
                            {snippet.isFavorite ? (
                              <StarOff className="h-4 w-4" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Snippet Details/Editor */}
          <div className="flex flex-1 flex-col gap-3">
            {isEditing ? (
              // Edit Form
              <div className="flex h-full flex-col gap-3">
                <Label>Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Snippet name..."
                />

                <Label>Description</Label>
                <Input
                  value={editForm.description ?? ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description..."
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Language *</Label>
                    <Select
                      value={editForm.language}
                      onValueChange={(lang) => setEditForm((prev) => ({ ...prev, language: lang }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={editForm.category ?? ""}
                      onValueChange={(cat) => setEditForm((prev) => ({ ...prev, category: cat }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_SNIPPET_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      placeholder="Add tag..."
                    />
                    <Button size="sm" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {editForm.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Label>Code *</Label>
                <Textarea
                  value={editForm.code}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="Paste your code here..."
                  className="flex-1 font-mono text-sm"
                />

                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedSnippet(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : selectedSnippet ? (
              // Snippet Details
              <div className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedSnippet.name}</h3>
                    {selectedSnippet.description && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {selectedSnippet.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(true);
                        setEditForm({
                          name: selectedSnippet.name,
                          description: selectedSnippet.description,
                          code: selectedSnippet.code,
                          language: selectedSnippet.language,
                          tags: selectedSnippet.tags,
                          category: selectedSnippet.category,
                        });
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => duplicateSnippet(selectedSnippet.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Delete this snippet?")) {
                          deleteSnippet(selectedSnippet.id);
                          setSelectedSnippet(null);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>{selectedSnippet.language}</Badge>
                  {selectedSnippet.category && (
                    <Badge variant="secondary">{selectedSnippet.category}</Badge>
                  )}
                  {selectedSnippet.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <ScrollArea className="flex-1">
                  <pre className="bg-muted overflow-x-auto rounded p-4 font-mono text-sm">
                    <code>{selectedSnippet.code}</code>
                  </pre>
                </ScrollArea>

                {onInsert && (
                  <Button onClick={() => handleInsert(selectedSnippet)}>Insert into Chat</Button>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                Select a snippet to view details
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
