import * as XLSX from 'xlsx'

export function exportarEquipos(equipos) {
  const datos = equipos.map(eq => ({
    'N° Ingreso':       eq.numero_ingreso,
    'Cliente':          eq.cliente_nombre,
    'Teléfono':         eq.cliente_telefono ?? '',
    'Tipo':             eq.tipo_equipo,
    'Marca':            eq.marca ?? '',
    'Modelo':           eq.modelo ?? '',
    'Falla reportada':  eq.falla_reportada ?? '',
    'Estado':           eq.estado_actual.replace(/_/g, ' '),
    'Costo':            eq.costo_reparacion ?? '',
    'Fecha ingreso':    new Date(eq.fecha_ingreso).toLocaleDateString('es-CL'),
    'Fecha entrega':    eq.fecha_entrega
      ? new Date(eq.fecha_entrega).toLocaleDateString('es-CL') : '',
  }))

  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()

  ws['!cols'] = [
    { wch: 16 }, { wch: 22 }, { wch: 14 }, { wch: 14 },
    { wch: 12 }, { wch: 14 }, { wch: 30 }, { wch: 14 },
    { wch: 10 }, { wch: 14 }, { wch: 14 }
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Equipos')
  XLSX.writeFile(wb, `equipos_${new Date().toISOString().slice(0,10)}.xlsx`)
}