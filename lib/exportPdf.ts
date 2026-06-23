'use client'

import { WeeklyPlan } from '@/domain/planning/entities/WeeklyPlan'
import { DAYS_FR_FULL } from '@/lib/constants'

export async function exportWeeklyPDF(plan: WeeklyPlan): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const primary = [141, 75, 0] as [number, number, number]
  const muted = [107, 80, 64] as [number, number, number]

  doc.setFillColor(250, 243, 238)
  doc.rect(0, 0, 210, 297, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...primary)
  doc.text('Productive Daily Planner', 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...muted)
  doc.text(`Semaine ${plan.weekNumber} — ${plan.year}  ·  ${plan.startDate}`, 105, 28, { align: 'center' })

  let y = 38

  const totalTasks = plan.dailyPlans.flatMap((d) => d.tasks)
  const done = totalTasks.filter((t) => t.status === 'Fait').length
  const pct = totalTasks.length > 0 ? Math.round((done / totalTasks.length) * 100) : 0
  const estMin = totalTasks.reduce((a, t) => a + (t.estimatedMinutes ?? 0), 0)
  const realMin = totalTasks.reduce((a, t) => a + (t.realMinutes ?? 0), 0)

  doc.setFillColor(255, 255, 255)
  doc.roundedRect(14, y, 182, 20, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...primary)
  doc.text(`${done}/${totalTasks.length} tâches accomplies · ${pct}% · Estimé: ${Math.round(estMin / 60)}h · Réel: ${Math.round(realMin / 60)}h`, 105, y + 7, { align: 'center' })

  doc.setFillColor(...primary)
  doc.rect(14, y + 15, Math.min(182 * pct / 100, 182), 2, 'F')
  y += 28

  if (plan.mainTasks.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...primary)
    doc.text('Tâches de la semaine', 14, y)
    y += 5

    autoTable(doc, {
      startY: y,
      head: [['#', 'Désignation', 'Statut']],
      body: plan.mainTasks.map((t, i) => [i + 1, t.designation || '—', t.status]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: primary, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 248, 246] },
      margin: { left: 14, right: 14 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  }

  for (let i = 0; i < plan.dailyPlans.length; i++) {
    const dp = plan.dailyPlans[i]
    if (!dp.tasks.length) continue

    const dayLabel = `${DAYS_FR_FULL[i]} ${dp.date}`

    if (y > 240) { doc.addPage(); doc.setFillColor(250, 243, 238); doc.rect(0, 0, 210, 297, 'F'); y = 15 }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...primary)
    doc.text(dayLabel, 14, y)

    const done = dp.tasks.filter((t) => t.status === 'Fait').length
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...muted)
    doc.text(`${done}/${dp.tasks.length} faites`, 196, y, { align: 'right' })
    y += 4

    autoTable(doc, {
      startY: y,
      head: [['Désignation', 'Priorité', 'Statut', 'Estimé', 'Réel']],
      body: dp.tasks.map((t) => [
        t.designation || '—',
        t.priority?.split(' - ')[0] ?? '—',
        t.status,
        t.estimatedMinutes ? `${t.estimatedMinutes}min` : '—',
        t.realMinutes ? `${t.realMinutes}min` : '—',
      ]),
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [255, 219, 204], textColor: [53, 16, 0], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [255, 248, 246] },
      columnStyles: { 0: { cellWidth: 70 } },
      margin: { left: 14, right: 14 },
    })
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6

    if (dp.journal) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(...muted)
      doc.text(`📝 ${dp.journal}`, 14, y, { maxWidth: 182 })
      y += 8
    }
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...muted)
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} · Productive Daily Planner`, 105, 292, { align: 'center' })

  doc.save(`PDP-S${plan.weekNumber}-${plan.year}.pdf`)
}
