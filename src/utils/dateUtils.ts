import { format } from "date-fns";

export const utcDate = (date: string | Date) => {
  // Para convertir de UTC a local, necesitamos crear la fecha en UTC
  // y luego obtener la representación local
  const utcDate = typeof date === "string" ? new Date(date) : date;
  
  // La fecha ya está en UTC, solo necesitamos retornarla
  // JavaScript automáticamente la mostrará en la zona horaria local
  return utcDate;
};

export const utcFormatDate = (date?: string | Date) => {
  if (!date) return "-";

  const utcDate = typeof date === "string" ? new Date(date) : date;
  
  // Formatear la fecha UTC en zona horaria local
  const formattedDate = format(utcDate, `dd/MM/yyyy`);
  return formattedDate;
};
