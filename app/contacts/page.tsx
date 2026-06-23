'use client'

import { useEffect, useState } from 'react'
import { Contact } from '@/domain/contacts/entities/Contact'
import { LocalStorageContactRepository } from '@/infrastructure/persistence/LocalStorageContactRepository'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Plus, Trash2, Pencil, X, Check } from 'lucide-react'

const repo = new LocalStorageContactRepository()

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [editing, setEditing] = useState<Contact | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })

  const refresh = () => setContacts(repo.getAll().sort((a, b) => a.name.localeCompare(b.name)))
  useEffect(() => { refresh() }, [])

  const openCreate = () => { setForm({ name: '', email: '', phone: '', company: '', notes: '' }); setCreating(true); setEditing(null) }
  const openEdit = (c: Contact) => { setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '', company: c.company ?? '', notes: c.notes ?? '' }); setEditing(c); setCreating(false) }
  const cancel = () => { setCreating(false); setEditing(null) }

  const save = () => {
    if (!form.name.trim()) return
    const contact: Contact = {
      id: editing?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email || undefined,
      phone: form.phone || undefined,
      company: form.company || undefined,
      notes: form.notes || undefined,
      position: editing?.position ?? contacts.length,
    }
    repo.save(contact)
    refresh()
    cancel()
  }

  const remove = (id: string) => { repo.delete(id); refresh() }

  const ContactForm = () => (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{editing ? 'Modifier le contact' : 'Nouveau contact'}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[['name', 'Nom *'], ['email', 'Email'], ['phone', 'Téléphone'], ['company', 'Entreprise']].map(([field, label]) => (
          <div key={field}>
            <label htmlFor={`contact-${field}`} className="sr-only">{label}</label>
            <Input id={`contact-${field}`} placeholder={label} value={form[field as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} className="h-10 bg-card border-border" />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label htmlFor="contact-notes" className="sr-only">Notes</label>
          <Input id="contact-notes" placeholder="Notes..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="h-10 bg-card border-border" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={save} disabled={!form.name.trim()} className="h-10 gap-1.5 rounded-xl"><Check size={14} /> Enregistrer</Button>
        <Button variant="ghost" onClick={cancel} className="h-10 rounded-xl"><X size={14} /></Button>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Users size={22} className="text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Contacts</h1>
            <p className="text-xs text-muted-foreground">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {!creating && !editing && (
          <Button onClick={openCreate} className="h-10 gap-1.5 rounded-xl"><Plus size={16} /> Ajouter</Button>
        )}
      </div>

      {(creating || editing) && <ContactForm />}

      {contacts.length === 0 && !creating ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users size={28} className="text-primary" />
          </div>
          <p className="font-semibold text-foreground">Aucun contact</p>
          <p className="text-xs text-muted-foreground">Ajoute des contacts pour les associer à tes tâches et projets.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border p-4 flex items-start gap-3" style={{ background: 'var(--card)' }}>
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 font-bold text-sm text-primary" aria-hidden="true">
                {initials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{c.name}</p>
                {c.company && <p className="text-xs text-muted-foreground truncate">{c.company}</p>}
                {c.email && <p className="text-xs text-muted-foreground truncate">{c.email}</p>}
                {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(c)} aria-label={`Modifier ${c.name}`} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"><Pencil size={14} /></button>
                <button onClick={() => remove(c.id)} aria-label={`Supprimer ${c.name}`} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
