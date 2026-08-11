import type { SubmitEvent } from "react";

interface CreateTicketFormProps {
  onClose: () => void;
}

export default function CreateTicketForm({ onClose }: CreateTicketFormProps) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Crear ticket</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="datacenter" className="text-sm font-medium text-gray-700">
              Datacenter
            </label>
            <input
              id="datacenter"
              type="text"
              value="Datacenter"
              disabled
              className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="asunto" className="text-sm font-medium text-gray-700">
              Asunto
            </label>
            <input
              id="asunto"
              type="text"
              placeholder="Asunto del ticket"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="descripcion"
              rows={3}
              placeholder="Describí el problema o la solicitud"
              className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="yaml" className="text-sm font-medium text-gray-700">
              Código YAML
            </label>
            <textarea
              id="yaml"
              rows={6}
              placeholder={"clave: valor\notra_clave: otro_valor"}
              className="resize-none rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
