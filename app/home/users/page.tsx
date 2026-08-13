/**
 * Landing for the Users section: structure only. The entry points into
 * the routed flows (viewing the list, creating a user) now live in
 * UsersHeader, mounted once in users/layout.tsx and visible across
 * this whole section -- no need to repeat them here.
 */
export default function UsersPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900">ABMC Usuarios</h1>
    </div>
  );
}
