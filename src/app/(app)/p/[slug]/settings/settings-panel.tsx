"use client";

import { useState, useTransition } from "react";
import { Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateProject, deleteProject, archiveProject } from "@/server/projects";
import { PROJECT_STATUS, PRIORITY, DEFAULT_CATEGORIES } from "@/lib/constants";
import { Button, Card, Field, Input, NativeSelect, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { ConfirmButton } from "@/components/modal";

const COLORS = ["#7c8cff", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#38bdf8", "#fb923c"];

type ProjectData = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  status: keyof typeof PROJECT_STATUS;
  priority: keyof typeof PRIORITY;
  color: string;
  dueDate: string;
  archived: boolean;
};

export function SettingsPanel({ project }: { project: ProjectData }) {
  const [color, setColor] = useState(project.color);
  const [, startTransition] = useTransition();

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <Card>
        <h2 className="mb-4 text-sm font-semibold">Údaje projektu</h2>
        <form
          action={async (fd) => {
            try {
              await updateProject(project.id, fd);
              toast.success("Uložené");
            } catch {
              toast.error("Uloženie zlyhalo");
            }
          }}
          className="space-y-4"
        >
          <Field label="Názov">
            <Input name="title" required defaultValue={project.title} />
          </Field>
          <Field label="Popis">
            <Textarea name="description" rows={4} defaultValue={project.description ?? ""} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kategória">
              <Input name="category" list="hf-cat-settings" defaultValue={project.category} />
              <datalist id="hf-cat-settings">
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Termín">
              <Input name="dueDate" type="date" defaultValue={project.dueDate} />
            </Field>
            <Field label="Stav">
              <NativeSelect name="status" defaultValue={project.status}>
                {Object.entries(PROJECT_STATUS).map(([v, m]) => (
                  <option key={v} value={v}>
                    {m.label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Priorita">
              <NativeSelect name="priority" defaultValue={project.priority}>
                {Object.entries(PRIORITY).map(([v, m]) => (
                  <option key={v} value={v}>
                    {m.label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>

          <Field label="Farba">
            <input type="hidden" name="color" value={color} />
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Farba ${c}`}
                  aria-pressed={color === c}
                  className="focus-ring size-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: c,
                    outline: color === c ? "2px solid var(--text)" : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </Field>

          <p className="text-xs text-[var(--text-muted)]">
            Zmena názvu zmení aj adresu projektu — staré odkazy prestanú fungovať.
          </p>

          <div className="flex justify-end">
            <SubmitButton>Uložiť zmeny</SubmitButton>
          </div>
        </form>
      </Card>

      <div className="space-y-5">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Archív</h2>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            Archivovaný projekt zmizne z hlavného zoznamu, ale nič sa nezmaže.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              startTransition(async () => {
                await archiveProject(project.id, !project.archived);
                toast.success(project.archived ? "Obnovené" : "Archivované");
              })
            }
          >
            <Archive className="size-3.5" />
            {project.archived ? "Obnoviť z archívu" : "Archivovať projekt"}
          </Button>
        </Card>

        <Card className="border-red-500/25">
          <h2 className="mb-1.5 text-sm font-semibold text-red-300">Nebezpečná zóna</h2>
          <p className="mb-3 text-xs text-[var(--text-muted)]">
            Zmaže projekt aj všetky úlohy, súčiastky, odkazy, poznámky, mapy a nahraté súbory.
            Nedá sa vrátiť (okrem obnovy zo zálohy).
          </p>
          <ConfirmButton
            title="Zmazať projekt?"
            message={`Projekt „${project.title}“ a všetok jeho obsah sa zmažú natrvalo. Túto akciu nemožno vrátiť.`}
            confirmLabel="Zmazať natrvalo"
            onConfirm={() => deleteProject(project.id)}
          >
            <Button variant="danger" size="sm">
              <Trash2 className="size-3.5" />
              Zmazať projekt
            </Button>
          </ConfirmButton>
        </Card>
      </div>
    </div>
  );
}
