"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Map as MapIcon } from "lucide-react";
import { toast } from "sonner";
import { createWhiteboard, renameWhiteboard, deleteWhiteboard } from "@/server/whiteboards";
import { TEMPLATES, type TemplateId } from "@/lib/whiteboard/templates";
import { timeAgo, cn } from "@/lib/utils";
import { Button, Card, EmptyState, Field, Input } from "@/components/ui";
import { Modal, ConfirmButton } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";

type Board = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  updatedAt: string;
  fileCount: number;
};

export function MapsList({
  projectId,
  slug,
  boards,
}: {
  projectId: string;
  slug: string;
  boards: Board[];
}) {
  const [creating, setCreating] = useState(false);
  const [template, setTemplate] = useState<TemplateId>("plan");
  const [renaming, setRenaming] = useState<Board | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Mapy</h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Vizuálny náčrt projektu — plán, schéma zapojenia, krabička, nápady.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Nová mapa
        </Button>
      </div>

      {boards.length === 0 ? (
        <EmptyState
          icon={<MapIcon className="size-9" />}
          title="Zatiaľ žiadne mapy"
          description="Nakresli si, čo treba spraviť, ako je to zapojené alebo ako má vyzerať krabička. Môžeš vkladať obrázky a prepájať úlohy."
          action={
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Nová mapa
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((b) => (
            <Card key={b.id} className="card-hover group/map flex flex-col gap-3 p-3">
              <Link
                href={`/p/${slug}/maps/${b.id}`}
                className="block overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)]"
              >
                <div className="aspect-[16/10] w-full">
                  {b.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-[var(--text-muted)]">
                      <MapIcon className="size-8 opacity-40" />
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/p/${slug}/maps/${b.id}`}
                    className="block truncate text-sm font-medium hover:text-[var(--accent)]"
                  >
                    {b.title}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                    upravené {timeAgo(b.updatedAt)}
                    {b.fileCount > 0 && ` · ${b.fileCount} obrázkov`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover/map:opacity-100 focus-within:opacity-100">
                  <button
                    onClick={() => setRenaming(b)}
                    className="focus-ring rounded p-1.5 text-[var(--text-muted)] hover:text-[var(--text)]"
                    aria-label={`Premenovať ${b.title}`}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <ConfirmButton
                    title="Zmazať mapu?"
                    message={`Mapa „${b.title}“ a jej obrázky sa zmažú natrvalo.`}
                    onConfirm={() => deleteWhiteboard(b.id)}
                  >
                    <button
                      className="focus-ring rounded p-1.5 text-[var(--text-muted)] hover:text-red-400"
                      aria-label={`Zmazať ${b.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </ConfirmButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Nová mapa */}
      <Modal open={creating} onOpenChange={setCreating} title="Nová mapa">
        <form
          action={async (fd) => {
            fd.set("template", template);
            try {
              await createWhiteboard(projectId, fd);
              // createWhiteboard presmeruje do editora
            } catch (err) {
              // redirect() hodí NEXT_REDIRECT - to nechceme hlásiť ako chybu
              if ((err as Error).message?.includes("NEXT_REDIRECT")) throw err;
              toast.error("Mapu sa nepodarilo vytvoriť");
            }
          }}
          className="space-y-4"
        >
          <Field label="Názov">
            <Input name="title" defaultValue="Nová mapa" autoFocus />
          </Field>

          <div>
            <p className="mb-1.5 text-xs font-medium text-[var(--text-muted)]">Predloha</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={cn(
                    "focus-ring rounded-lg border px-3 py-2 text-left transition-colors",
                    template === t.id
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--border-strong)] hover:bg-[var(--surface-hover)]",
                  )}
                >
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">{t.hint}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreating(false)}>
              Zrušiť
            </Button>
            <SubmitButton>Vytvoriť</SubmitButton>
          </div>
        </form>
      </Modal>

      {/* Premenovanie */}
      {renaming && (
        <Modal open onOpenChange={(v) => !v && setRenaming(null)} title="Premenovať mapu">
          <form
            action={(fd) => {
              const title = fd.get("title")?.toString() ?? "";
              startTransition(async () => {
                try {
                  await renameWhiteboard(renaming.id, title);
                  setRenaming(null);
                } catch {
                  toast.error("Premenovanie zlyhalo");
                }
              });
            }}
            className="space-y-4"
          >
            <Field label="Názov">
              <Input name="title" defaultValue={renaming.title} autoFocus required />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setRenaming(null)}>
                Zrušiť
              </Button>
              <SubmitButton>Uložiť</SubmitButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
