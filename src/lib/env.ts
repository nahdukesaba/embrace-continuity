export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  /**
   * When true, proof photos must be captured live from the device camera and
   * cannot be picked from the gallery. Defaults to true.
   * Set VITE_PROOF_CAMERA_ONLY="false" in your env to allow gallery uploads.
   */
  proofCameraOnly: (import.meta.env.VITE_PROOF_CAMERA_ONLY ?? "true") !== "false",
  /**
   * Supabase Storage config for direct-from-browser proof uploads.
   * Leave either variable blank to disable direct uploads; the client falls
   * back to posting the file as multipart to the API.
   */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  proofsBucket: import.meta.env.VITE_SUPABASE_PROOFS_BUCKET as string,
  resourcesBucket: import.meta.env.VITE_SUPABASE_RESOURCES_BUCKET as string,
};
