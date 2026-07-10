import { env } from "@/lib/env";
import { http } from "@/services/http";
import { getSupabaseClient } from "@/integrations/supabase/client";
import type { Proof, ProofKind } from "@/types";

/** Backend proof row. `path` is the storage key; `url` is a signed/public URL. */
interface ApiProof {
  id: string;
  bookingId: string;
  kind: ProofKind;
  path: string;
  url?: string;
  uploadedAt: string;
}

function normalize(p: ApiProof): Proof {
  return {
    id: p.id,
    bookingId: p.bookingId,
    kind: p.kind,
    url: p.url ?? p.path,
    uploadedAt: p.uploadedAt,
  };
}

function extForFile(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  const fromMime = file.type.split("/").pop();
  return (fromMime ?? "jpg").toLowerCase();
}

async function uploadToStorage(bookingId: string, kind: ProofKind, file: File): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Storage not configured");
  const path = `bookings/${bookingId}/${kind}-${Date.now()}.${extForFile(file)}`;
  const { error } = await supabase.storage
    .from(env.proofsBucket)
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export const proofsApi = {
  async list(bookingId: string): Promise<Proof[]> {
    const { data } = await http.get<ApiProof[] | { data: ApiProof[] }>(
      `/bookings/${bookingId}/proofs`,
    );
    const rows = Array.isArray(data) ? data : data.data ?? [];
    return rows.map(normalize);
  },
  async upload(bookingId: string, kind: ProofKind, file: File): Promise<Proof> {
    // Prefer direct-to-Storage upload; fall back to multipart if unconfigured.
    if (getSupabaseClient()) {
      const path = await uploadToStorage(bookingId, kind, file);
      const { data } = await http.post<ApiProof | { data: ApiProof }>(
        `/bookings/${bookingId}/proofs`,
        { kind, path },
      );
      const raw = (data as { data?: ApiProof }).data ?? (data as ApiProof);
      return normalize(raw);
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const { data } = await http.post<ApiProof | { data: ApiProof }>(
      `/bookings/${bookingId}/proofs`,
      fd,
    );
    const raw = (data as { data?: ApiProof }).data ?? (data as ApiProof);
    return normalize(raw);
  },
};
