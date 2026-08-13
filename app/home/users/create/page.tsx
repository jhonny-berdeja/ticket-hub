import CreateUserForm from "@/app/home/users/create/components/create-user-form/CreateUserForm";

/**
 * Structure only: a normal page container + card, matching the
 * non-modal look of /login. CreateUserForm no longer renders its own
 * overlay wrapper -- this page owns the outer layout now that it's a
 * real route, not a dialog.
 */
export default function CreateUserPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6">
        <CreateUserForm />
      </div>
    </div>
  );
}
