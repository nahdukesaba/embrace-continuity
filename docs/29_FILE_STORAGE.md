# File Storage

Files should never become application state.

---

Upload Flow

Select

↓

Validate

↓

Upload

↓

Storage

↓

Database reference

↓

Frontend refresh

---

Frontend Responsibility

Display upload progress.

Handle cancellation.

Display success.

Display failure.

---

Backend Responsibility

Validation

Authorization

Persistence

Storage access policy

## Supabase Storage

Resource photos upload directly to the public `resource-photos` bucket.
Booking proofs upload directly to the private `booking-proofs` bucket using
the authenticated user's Supabase JWT. Proof objects use the path
`{userId}/{bookingId}/{kind}-{uuid}.{extension}`. After a successful object
upload, the frontend sends that object path to `POST /bookings/:bookingId/proofs`;
the API persists it in `booking_proofs.path`. The frontend creates short-lived
signed URLs only for displaying private proofs.

Create both buckets in Supabase Storage with a 10 MB file-size limit and allow
only `image/jpeg`, `image/png`, and `image/webp`. Set `resource-photos` to
public and keep `booking-proofs` private. In the Supabase SQL Editor, apply:

```sql
create policy "Admins can upload resource photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'resource-photos'
  and exists (
    select 1 from public.app_users
    where id = auth.uid() and role = 'admin'
  )
);

create policy "Users and admins can read permitted booking proofs"
on storage.objects for select to authenticated
using (
  bucket_id = 'booking-proofs'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'admin'
    )
  )
);

create policy "Users can upload their booking proofs"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'booking-proofs'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users and admins can remove permitted booking proofs"
on storage.objects for delete to authenticated
using (
  bucket_id = 'booking-proofs'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or exists (
      select 1 from public.app_users
      where id = auth.uid() and role = 'admin'
    )
  )
);
```

---

Future Storage Providers

The storage implementation should remain replaceable.

Frontend should only understand

Upload

Download

Preview

Delete

Not storage internals.
