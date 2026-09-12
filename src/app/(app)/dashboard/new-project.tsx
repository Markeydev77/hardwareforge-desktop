"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { createProject } from "@/server/projects";
import { PROJECT_STATUS, PRIORITY, DEFAULT_CATEGORIES } from "@/lib/constants";
import { Button, Field, Input, NativeSelect, Textarea } from "@/components/ui";
import { Modal } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";

const COLORS = ["#7c8cff", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#38bdf8", "#fb923c"];

export function NewProjectButton({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(COLORS[0]);

  const allCategories = [...new Set([...categories, ...DEFAULT_CATEGORIES])];

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Nový projekt"
      description="Základné údaje sa dajú kedykoľvek zmeniť v nastaveniach projektu."
      trigger={
        <Button variant="primary">
          <Plus className="size-4" />
          Nový projekt
        </Button>
      }
    >
      {/* createProject na konci presmeruje na detail projektu */}
      <form action={createProject} className="space-y-4">
        <Field label="Názov">
          <Input name="title" required autoFocus placeholder="Spotify displej s ESP32" />
        </Field>

        <Field label="Popis">
          <Textarea
            name="description"
            rows={3}
            placeholder="Displej ukazujúci aktuálne prehrávanú skladbu…"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Kategória">
            <Input
              name="category"
              list="hf-categories"
              defaultValue="ESP32"
              placeholder="ESP32"
            />
            <datalist id="hf-categories">
              {allCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Termín (voliteľné)">
            <Input name="dueDate" type="date" />
          </Field>

          <Field label="Stav">
            <NativeSelect name="status" defaultValue="IDEA">
              {Object.entries(PROJECT_STATUS).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </NativeSelect>
          </Field>

          <Field label="Priorita">
            <NativeSelect name="priority" defaultValue="MEDIUM">
              {Object.entries(PRIORITY).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
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

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Zrušiť
          </Button>
          <SubmitButton>Vytvoriť projekt</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
