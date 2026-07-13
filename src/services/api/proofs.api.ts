import { http } from "@/services/http";
import type { Proof, ProofKind } from "@/types";
import { env } from "@/lib/env";
import { getSupabaseClient } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";

/** Backend proof row. `path` is the storage key; `url` is a signed/public URL. */
interface ApiProof {
  id: string;
  bookingId: string;
  kind: ProofKind;
  path: string;
  url?: string;
  createdAt: string;
}

async function normalize(p: ApiProof): Promise<Proof> {
  let url = p.url ?? p.path;
  if (!p.url && !p.path.startsWith("http")) {
    const supabase = await getSupabaseClient();
    if (supabase) {
      const { data } = await supabase.storage.from(env.proofsBucket).createSignedUrl(p.path, 60 * 60);
      url = data?.signedUrl ?? p.path;
    }
  }
  return {
    id: p.id,
    bookingId: p.bookingId,
    kind: p.kind,
    url,
    uploadedAt: p.createdAt,
  };
}

export const proofsApi = {
  async list(bookingId: string): Promise<Proof[]> {
    const { data } = await http.get<ApiProof[] | { data: ApiProof[] }>(
      `/bookings/${bookingId}/proofs`,
    );
    const rows = Array.isArray(data) ? data : data.data ?? [];
    return Promise.all(rows.map(normalize));
  },
  async upload(bookingId: string, kind: ProofKind, file: File): Promise<Proof> {
    const userId = useAuthStore.getState().user?.id;
    const supabase = await getSupabaseClient();
    if (!userId || !supabase) throw new Error("Storage is not configured or you are not signed in");

    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${userId}/${bookingId}/${kind}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(env.proofsBucket)
      .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
    if (uploadError) throw new Error(uploadError.message);

    try {
      const { data } = await http.post<ApiProof | { data: ApiProof }>(
        `/bookings/${bookingId}/proofs`,
        { kind, path },
      );
      const raw = (data as { data?: ApiProof }).data ?? (data as ApiProof);
      return normalize(raw);
    } catch (error) {
      await supabase.storage.from(env.proofsBucket).remove([path]);
      throw error;
    }
  },
};
