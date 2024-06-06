import { fetchPlus } from "@/lib/verificarApiResponse";
import { Comprobante } from "@prisma/client";

export default async function obtenerComprobantePorId( id : string) {
  
  const server_url = process.env.URL;
  const url = server_url || "";
  
  return await fetchPlus<Comprobante>(`${url}/api/comprobante/${id}`);
}