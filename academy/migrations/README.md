# academy/migrations — status (2026-09-03)
`001_academy_users.sql` was applied to Supabase project `rklpcemhaimavneypubr`, which no longer exists (NXDOMAIN).
`../admin.html` targets the same project and is therefore inert. Both files are kept, unlinked from the hub.
To re-enable: create a Supabase project, apply this migration, restore the auth block removed from
`../assets/academy.js` in SP4 (git show ef17bfb0:academy/assets/academy.js), and re-add the footer link.
