/** Landing de /home: solo composición, sin lógica ni fetching -- las acciones ya viven en TicketsSidebar. */
export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">
        Panel de ticketera
      </h1>
      <p className="max-w-md text-sm text-gray-500">
        Usá las acciones de la izquierda
      </p>
    </div>
  );
}
