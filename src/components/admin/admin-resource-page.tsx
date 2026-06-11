import type { InputHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const textareaClass = "min-h-24 w-full rounded-lg border border-border bg-card/90 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10";
export const selectClass = "h-11 w-full rounded-lg border border-border bg-card/90 px-4 text-sm text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10";

export interface AdminColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
}

export function AdminPageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p><h1 className="mt-3 text-4xl font-black tracking-tight text-foreground">{title}</h1><p className="mt-3 text-muted-foreground">{description}</p></div>;
}

export function AdminTable<T extends { id: string }>({ columns, rows, emptyLabel }: { columns: AdminColumn<T>[]; rows: T[]; emptyLabel: string }) {
  if (!rows.length) return <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-sm text-muted-foreground">{emptyLabel}</div>;
  return <div className="overflow-x-auto rounded-lg border border-border bg-card/82 shadow-[0_18px_50px_hsl(172_55%_16%/0.08)]"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-muted/70 text-xs uppercase tracking-[0.18em] text-muted-foreground"><tr>{columns.map((column) => <th key={column.header} className="px-4 py-3">{column.header}</th>)}</tr></thead><tbody className="divide-y divide-border">{rows.map((row) => <tr key={row.id} className="align-top transition hover:bg-muted/40">{columns.map((column) => <td key={column.header} className="px-4 py-4 text-muted-foreground">{column.cell(row)}</td>)}</tr>)}</tbody></table></div>;
}

export function AdminSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle>{description ? <CardDescription>{description}</CardDescription> : null}</CardHeader><div className="px-6 pb-6">{children}</div></Card>;
}

export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return <div className="grid gap-2"><Label htmlFor={props.name}>{label}</Label><Input id={props.name} {...props} /></div>;
}

export function Textarea({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><textarea id={name} name={name} defaultValue={defaultValue} className={textareaClass} /></div>;
}

export function Select({ label, name, options, required = true, defaultValue }: { label: string; name: string; options: Array<string | { label: string; value: string }>; required?: boolean; defaultValue?: string }) {
  return <div className="grid gap-2"><Label htmlFor={name}>{label}</Label><select id={name} name={name} className={selectClass} required={required} defaultValue={defaultValue}>{options.map((option) => { const value = typeof option === "string" ? option : option.value; const labelText = typeof option === "string" ? option : option.label; return <option key={`${name}-${value || "empty"}`} value={value}>{labelText}</option>; })}</select></div>;
}

export function HiddenId({ id }: { id: string }) {
  return <input type="hidden" name="id" value={id} />;
}

export function ActionButton({ children = "Save" }: { children?: ReactNode }) {
  return <Button type="submit" variant="accent" size="sm">{children}</Button>;
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  return <span className="inline-flex rounded-full bg-accent/12 px-3 py-1 text-xs font-semibold capitalize text-accent ring-1 ring-accent/20">{value ?? "none"}</span>;
}
