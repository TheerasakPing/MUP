import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useWorkspaceTemplates } from "@/browser/hooks/useWorkspaceTemplates";
import type { WorkspaceTemplateInput } from "@/common/types/workspaceTemplates";
import { X, Download, Upload, Plus, Trash2, Edit } from "lucide-react";

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (templateId: string) => void;
}

/**
 * Template Manager Dialog
 * Allows users to create, edit, delete, and export/import workspace templates
 */
export function TemplateManager({ isOpen, onClose, onSelectTemplate }: TemplateManagerProps) {
  const {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    exportTemplates,
    importTemplates,
  } = useWorkspaceTemplates();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleExport = () => {
    const json = exportTemplates();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mux-templates-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        importTemplates(json);
      } catch (error) {
        alert("Failed to import templates. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="border-border bg-background fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">Workspace Templates</Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-sm opacity-70 transition hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm"
            >
              <Plus className="h-4 w-4" />
              New Template
            </button>
            <button
              onClick={handleExport}
              className="border-border hover:bg-secondary/50 flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <label className="border-border hover:bg-secondary/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
              <Upload className="h-4 w-4" />
              Import
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border-border hover:bg-secondary/30 flex items-center justify-between rounded-md border p-3 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{template.name}</h3>
                    {template.isDefault && (
                      <span className="bg-accent/20 text-accent rounded-full px-2 py-0.5 text-xs">
                        Default
                      </span>
                    )}
                  </div>
                  {template.description && (
                    <p className="text-muted-foreground mt-1 text-sm">{template.description}</p>
                  )}
                  <div className="text-muted-foreground mt-2 flex gap-2 text-xs">
                    <span>Runtime: {template.runtime}</span>
                    {template.model && <span>Model: {template.model}</span>}
                    {template.thinkingLevel !== undefined && (
                      <span>Thinking: {template.thinkingLevel}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  {onSelectTemplate && (
                    <button
                      onClick={() => {
                        onSelectTemplate(template.id);
                        onClose();
                      }}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm"
                    >
                      Use
                    </button>
                  )}
                  <button
                    onClick={() => setEditingId(template.id)}
                    className="hover:bg-secondary/50 rounded-md p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {!template.isDefault && (
                    <button
                      onClick={() => {
                        if (confirm("Delete this template?")) {
                          deleteTemplate(template.id);
                        }
                      }}
                      className="hover:bg-danger/10 text-danger rounded-md p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
