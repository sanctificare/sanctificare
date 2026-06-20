import { useState } from "react";
import { templates, type TemplateType, applyTemplateTheme } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Palette } from "lucide-react";

interface TemplateSelectorProps {
  currentTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
  showDialog?: boolean;
  onClose?: () => void;
}

export default function TemplateSelector({
  currentTemplate,
  onTemplateChange,
  showDialog = false,
  onClose,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(currentTemplate);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType | null>(null);

  const handleSelectTemplate = (templateId: TemplateType) => {
    setSelectedTemplate(templateId);
    setPreviewTemplate(templateId);
    applyTemplateTheme(templateId);
  };

  const handleConfirm = () => {
    onTemplateChange(selectedTemplate);
    if (onClose) onClose();
  };

  const handleCancel = () => {
    // Revert to original template
    applyTemplateTheme(currentTemplate);
    setPreviewTemplate(null);
    if (onClose) onClose();
  };

  const templateList = Object.values(templates);

  const content = (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[oklch(0.75_0.12_75/0.15)] border border-[oklch(0.75_0.12_75/0.4)] mb-3">
          <Palette size={24} className="text-[oklch(0.65_0.12_70)]" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[oklch(0.22_0.07_260)] mb-2">
          Escolha seu Estilo
        </h2>
        <p className="text-sm text-muted-foreground">
          Personalize o app com um dos nossos temas católicos elegantes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templateList.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template.id)}
            className={`relative rounded-2xl p-6 border-2 transition-all duration-300 text-left group ${
              selectedTemplate === template.id
                ? "border-[oklch(0.75_0.12_75)] bg-[oklch(0.75_0.12_75/0.05)] shadow-lg"
                : "border-border hover:border-[oklch(0.75_0.12_75/0.5)] hover:shadow-md"
            }`}
          >
            {/* Preview visual */}
            <div className="flex items-end gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg shadow-md border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${template.preview.bgColor} 0%, ${template.preview.accentColor} 100%)`,
                }}
              />
              <div className="flex-1">
                <div
                  className="h-2 rounded-full mb-1"
                  style={{ backgroundColor: template.preview.accentColor }}
                />
                <div
                  className="h-1.5 rounded-full w-2/3"
                  style={{ backgroundColor: template.preview.accentColor, opacity: 0.6 }}
                />
              </div>
            </div>

            {/* Informações */}
            <h3 className="font-display text-lg font-bold text-[oklch(0.22_0.07_260)] mb-1">
              {template.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {template.description}
            </p>

            {/* Cores */}
            <div className="flex gap-2 mb-4">
              <div
                className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: template.preview.bgColor }}
                title="Primária"
              />
              <div
                className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: template.preview.textColor }}
                title="Secundária"
              />
              <div
                className="w-5 h-5 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: template.preview.accentColor }}
                title="Accent"
              />
            </div>

            {/* Checkmark */}
            {selectedTemplate === template.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[oklch(0.75_0.12_75)] flex items-center justify-center">
                <Check size={16} className="text-[oklch(0.15_0.02_260)]" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Ações */}
      {showDialog && (
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-[oklch(0.75_0.12_75)] hover:bg-[oklch(0.70_0.13_73)] text-[oklch(0.15_0.02_260)] font-semibold"
            onClick={handleConfirm}
          >
            Aplicar Tema
          </Button>
        </div>
      )}
    </div>
  );

  if (showDialog) {
    return (
      <Dialog open={showDialog} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Seletor de Templates</DialogTitle>
            <DialogDescription className="sr-only">
              Escolha um dos nossos temas católicos para personalizar o app
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="w-full">
      {content}
    </div>
  );
}
