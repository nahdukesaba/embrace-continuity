import { http } from "@/services/http";
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

export const proofsApi = {
  async list(bookingId: string): Promise<Proof[]> {
    const { data } = await http.get<ApiProof[] | { data: ApiProof[] }>(
      `/bookings/${bookingId}/proofs`,
    );
    const rows = Array.isArray(data) ? data : data.data ?? [];
    return rows.map(normalize);
  },
  async upload(bookingId: string, kind: ProofKind, file: File): Promise<Proof> {
    // Route through the API so the backend's auth + service-role key handle
    // the storage write. Direct-to-Storage uploads from the browser fail
    // Supabase RLS because the anon session has no auth.uid().
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const { data } = await http.post<ApiProof | { data: ApiProof }>(
      `/bookings/${bookingId}/proofs`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    const raw = (data as { data?: ApiProof }).data ?? (data as ApiProof);
    return normalize(raw);
  },
};
