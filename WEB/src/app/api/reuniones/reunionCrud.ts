import { ConnectA } from "../../../config/index";

export interface Reunion {
  id?: number;
  proy: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  estado?: number;
}

// Obtener todas las reuniones de un proyecto
export async function getReuniones(proy: number): Promise<Reunion[]> {
  const url = `${ConnectA.api}/reunion-proyectos/${proy}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("🔍 Respuesta completa del servidor (getReuniones):", data);

    // Varias formas posibles — normalizamos y devolvemos siempre un arreglo
    if (Array.isArray(data)) {
      return data as Reunion[];
    }

    // Forma: { status: 200, data: [...] }  ==> devolver data
    if (data && (data.status === 200 || data.msg) && Array.isArray(data.data)) {
      return data.data as Reunion[];
    }

    // Forma: { data: { data: [...] } } (por si hay doble nesting)
    if (data && data.data && Array.isArray(data.data.data)) {
      return data.data.data as Reunion[];
    }

    // Forma alterna: { reuniones: [...] }
    if (data && Array.isArray(data.reuniones)) {
      return data.reuniones as Reunion[];
    }

    console.warn("⚠️ getReuniones: estructura inesperada del servidor:", data);
    return [];
  } catch (error) {
    console.error("❌ Error al obtener reuniones:", error);
    return [];
  }
}

// Obtener una reunión específica
export async function getReunion(proy: number, id: number): Promise<Reunion | null> {
  const url = `${ConnectA.api}/reunion-proyectos/${proy}/${id}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("📄 Respuesta completa del servidor (getReunion):", data);

    if (data && data.status === 200 && data.data) return data.data as Reunion;
    if (data && data.reunion) return data.reunion as Reunion;
    return null;
  } catch (error) {
    console.error("❌ Error al obtener reunión:", error);
    return null;
  }
}

// Crear reunión (mantengo tu formato para MySQL)
export async function crearReunion(form: Reunion): Promise<boolean> {
  const url = `${ConnectA.api}/reunion-proyectos/`;
  const fechaMySQL = form.fecha.replace("T", " ") + ":00";

  const formData = new FormData();
  formData.append("proy", form.proy.toString());
  formData.append("titulo", form.titulo);
  formData.append("descripcion", form.descripcion);
  formData.append("fecha", fechaMySQL);

  try {
    const res = await fetch(url, { method: "POST", body: formData });
    const data = await res.json();
    console.log("🟢 Respuesta del servidor (crearReunion):", data);
    return data.status === 200 || data.success === true;
  } catch (error) {
    console.error("❌ Error al crear reunión:", error);
    return false;
  }
}

// 🟠 Actualizar una reunión
export async function actualizarReunion(id: number, form: Reunion): Promise<boolean> {
  const url = `${ConnectA.api}/reunion-proyectos/${id}`;
  const fechaMySQL = form.fecha.replace("T", " ") + ":00";

  const formData = new FormData();
  formData.append("proy", form.proy.toString());
  formData.append("titulo", form.titulo);
  formData.append("descripcion", form.descripcion);
  formData.append("fecha", fechaMySQL);
  if (form.estado !== undefined) formData.append("est", form.estado.toString());

  try {
    const res = await fetch(url, { method: "PUT", body: formData });
    const data = await res.json();
    console.log("🟠 Respuesta del servidor (actualizarReunion):", data);
    return data.status === 200 || data.success === true;
  } catch (error) {
    console.error("❌ Error al actualizar reunión:", error);
    return false;
  }
}

// 🔴 Eliminar una reunión
export async function eliminarReunion(id: number): Promise<boolean> {
  const url = `${ConnectA.api}/reunion-proyectos/${id}`;
  try {
    const res = await fetch(url, { method: "DELETE" });
    const data = await res.json();
    console.log("🔴 Respuesta del servidor (eliminarReunion):", data);
    return data.status === 200 || data.success === true;
  } catch (error) {
    console.error("❌ Error al eliminar reunión:", error);
    return false;
  }
}