import type { Database } from "@/integrations/supabase/types";

export type DbTable<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type DbInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type DbUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
