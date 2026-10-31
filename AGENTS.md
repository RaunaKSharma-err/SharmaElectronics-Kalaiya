<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Store settings live only in src/config/store.ts; categories in src/data/categories.ts.
- Products live in the database; storefront reads only through src/lib/catalog.functions.ts (publishable client, active rows) and admin writes only through src/lib/admin.functions.ts (requireSupabaseAuth + is_admin check, RLS enforces too) so authorization is never client-side.
- Admin access = row in public.user_roles with role 'admin'; RLS and storage policies call public.is_admin(). Never derive admin from user metadata.
- Product images: private "product-images" bucket (public buckets are blocked in this workspace), served via signed URLs; "seed/..." image paths map to bundled sample photos in src/lib/images.ts.
- Stock status is computed only by src/lib/stock.ts; stock changes go through the adjust_stock() SQL function for atomic, non-negative updates.
