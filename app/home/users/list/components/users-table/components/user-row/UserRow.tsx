import Link from "next/link";
import type { EditableUser } from "@/app/home/users/users.dto";

interface UserRowProps {
  user: EditableUser;
}

/**
 * Independent per row: gets its own user by prop from UsersTable (the
 * one direction of data flow that's still allowed -- parent to
 * child). The edit action is now a real navigation, a <Link> to the
 * user's edit route, instead of an onClick reaching into
 * UsersActions -- there's no Context left to reach into.
 */
export default function UserRow({ user }: UserRowProps) {
  return (
    <tr>
      <td className="px-4 py-3 text-gray-900">{user.name}</td>
      <td className="px-4 py-3 text-gray-900">{user.lastname}</td>
      <td className="px-4 py-3 text-gray-900">{user.email}</td>
      <td className="px-4 py-3 text-gray-900">{user.roles.join(", ")}</td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/home/users/${user.id}/edit`}
          aria-label={`Editar ${user.email}`}
          className="text-gray-400 hover:text-gray-600"
        >
          ✏️
        </Link>
      </td>
    </tr>
  );
}
