import { useUsersContext } from "@/app/home/users/components/users-context/use-users-context";
import type { EditableUser } from "@/app/home/users/components/users-context/users-context.dto";

interface UserRowProps {
  user: EditableUser;
}

/**
 * Independent per row: gets its own user by prop from UsersTable (the
 * one direction of data flow that's still allowed - parent to child),
 * and reaches into UsersContext directly for the edit action instead
 * of bubbling a click up through UsersTable.
 */
export default function UserRow({ user }: UserRowProps) {
  const { openEdit } = useUsersContext();

  return (
    <tr>
      <td className="px-4 py-3 text-gray-900">{user.name}</td>
      <td className="px-4 py-3 text-gray-900">{user.lastname}</td>
      <td className="px-4 py-3 text-gray-900">{user.email}</td>
      <td className="px-4 py-3 text-gray-900">{user.roles.join(", ")}</td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={() => openEdit(user)}
          aria-label={`Editar ${user.email}`}
          className="text-gray-400 hover:text-gray-600"
        >
          ✏️
        </button>
      </td>
    </tr>
  );
}
