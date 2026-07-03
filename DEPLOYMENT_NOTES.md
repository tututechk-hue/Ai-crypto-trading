### Render persistent disk instructions

To persist the SQLite database on Render between deploys you'll need to attach a Persistent Disk to the service and point DATABASE_URL to the file path on disk.

1. In Render, go to your Service -> Settings -> Persistent Disks and add a disk mounted at `/data` (size as needed).
2. Set the DATABASE_URL environment variable to `file:./data/dev.db` (this will create the DB on the attached disk).
3. Deploy. The container will run `prisma migrate deploy` on startup and create the DB on the persistent disk.

If you cannot attach a disk you should instead use a managed Postgres database and set DATABASE_URL accordingly (recommended for production when multiple instances or true durability is required).
