export const env = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ??
    "https://ephsilalahi.tailf32e23.ts.net/api",
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? "true") !== "false",
  /**
   * When true, proof photos must be captured live from the device camera and
   * cannot be picked from the gallery. Defaults to true.
   * Set VITE_PROOF_CAMERA_ONLY="false" in your env to allow gallery uploads.
   */
  proofCameraOnly: (import.meta.env.VITE_PROOF_CAMERA_ONLY ?? "true") !== "false",
  /**
   * Supabase Storage config for direct-from-browser proof uploads.
   * Configure via env when deploying; leave blank to disable direct uploads
   * (the client will fall back to POSTing the file as multipart to the API).
   */
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL ?? "https://hnjabgypxtmtakauhauz.supabase.co") as string,
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuamFiZ3lweHRtdGFrYXVoYXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDcxNDIsImV4cCI6MjA5ODM4MzE0Mn0.XzzdCTp3P31esxG5-gxrQiU3iNsI3l-pl2wRfXLCJTo") as string,
  proofsBucket: (import.meta.env.VITE_SUPABASE_PROOFS_BUCKET ?? "booking-proofs") as string,
  resourcesBucket: (import.meta.env.VITE_SUPABASE_RESOURCES_BUCKET ?? "resource-photos") as string,
};
