import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CalEvent {
  id: string
  title: string
  date: string        // YYYY-MM-DD
  time?: string       // HH:MM
  type: 'task' | 'deadline' | 'appointment' | 'personal'
  note?: string
  done: boolean
}

const TYPE_META: Record<CalEvent['type'], { label: string; color: string; bg: string; emoji: string }> = {
  task:        { label: 'Task',        color: '#6F8F5F', bg: 'rgba(111,143,95,0.12)',  emoji: '✅' },
  deadline:    { label: 'Deadline',    color: '#9B111E', bg: 'rgba(155,17,30,0.10)',   emoji: '⏰' },
  appointment: { label: 'Appointment', color: '#B76E79', bg: 'rgba(183,110,121,0.12)', emoji: '📅' },
  personal:    { label: 'Personal',    color: '#C94C63', bg: 'rgba(201,76,99,0.10)',   emoji: '💗' },
}

const STORAGE_KEY = 'ruby_calendar_events'

function pad(n: number) { return String(n).padStart(2, '0') }
function toYMD(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` }
function monthName(m: number) {
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][m]
}
function dayName(d: number) { return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d] }

export function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string>(toYMD(today))
  const [events, setEvents] = useState<CalEvent[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
  })
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', date: toYMD(today), time: '', type: 'task' as CalEvent['type'], note: '' })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  }, [events])

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const eventsForDay = (day: number) => {
    const ymd = `${year}-${pad(month+1)}-${pad(day)}`
    return events.filter(e => e.date === ymd)
  }

  const selectedEvents = events
    .filter(e => e.date === selected)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))

  const upcomingDeadlines = events
    .filter(e => e.type === 'deadline' && !e.done && e.date >= toYMD(today))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  const openNew = () => {
    setEditId(null)
    setForm({ title: '', date: selected, time: '', type: 'task', note: '' })
    setShowForm(true)
  }

  const openEdit = (ev: CalEvent) => {
    setEditId(ev.id)
    setForm({ title: ev.title, date: ev.date, time: ev.time || '', type: ev.type, note: ev.note || '' })
    setShowForm(true)
  }

  const saveEvent = () => {
    if (!form.title.trim()) return
    if (editId) {
      setEvents(prev => prev.map(e => e.id === editId ? { ...e, ...form } : e))
    } else {
      setEvents(prev => [...prev, { ...form, id: Date.now().toString(), done: false }])
    }
    setShowForm(false)
  }

  const toggleDone = (id: string) => setEvents(prev => prev.map(e => e.id === id ? { ...e, done: !e.done } : e))
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id))

  const cardStyle = {
    background: 'rgba(255,255,255,0.85)',
    border: '1.5px solid rgba(248,200,220,0.45)',
    boxShadow: '0 4px 24px rgba(155,17,30,0.08)',
    backdropFilter: 'blur(8px)',
  }

  return (
    <div className="space-y-5 pb-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl text-[#3A2A2F]">📅 My Calendar</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Your personal planner — tasks, deadlines, and everything in between.</p>
      </motion.div>

      {/* Upcoming deadlines strip */}
      {upcomingDeadlines.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4"
          style={{ background: 'rgba(155,17,30,0.07)', border: '1.5px solid rgba(155,17,30,0.15)' }}
        >
          <p className="text-xs font-bold text-[#9B111E] uppercase tracking-widest mb-2">⏰ Upcoming Deadlines</p>
          <div className="space-y-1.5">
            {upcomingDeadlines.map(ev => {
              const d = new Date(ev.date + 'T12:00:00')
              const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
              return (
                <div key={ev.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-[#3A2A2F] truncate">{ev.title}</span>
                  <span className="text-xs font-medium shrink-0" style={{ color: diff <= 2 ? '#9B111E' : '#7A6670' }}>
                    {diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : `in ${diff}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Calendar grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-5"
        style={cardStyle}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#7A6670] hover:bg-[#F8C8DC]/40 transition-all">‹</button>
          <p className="font-display text-[#3A2A2F] text-base">{monthName(month)} {year}</p>
          <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#7A6670] hover:bg-[#F8C8DC]/40 transition-all">›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-[#B8A0A8] uppercase py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const ymd = `${year}-${pad(month+1)}-${pad(day)}`
            const isToday = ymd === toYMD(today)
            const isSelected = ymd === selected
            const dayEvs = eventsForDay(day)
            const hasDeadline = dayEvs.some(e => e.type === 'deadline')
            return (
              <button
                key={i}
                onClick={() => setSelected(ymd)}
                className="relative flex flex-col items-center py-1.5 rounded-xl transition-all"
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #9B111E, #C94C63)' : isToday ? 'rgba(201,76,99,0.12)' : 'transparent',
                  color: isSelected ? 'white' : isToday ? '#9B111E' : '#3A2A2F',
                  fontWeight: isToday || isSelected ? 700 : 400,
                }}
              >
                <span className="text-sm leading-none">{day}</span>
                {dayEvs.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvs.slice(0, 3).map((ev, j) => (
                      <div
                        key={j}
                        className="w-1 h-1 rounded-full"
                        style={{ background: isSelected ? 'rgba(255,255,255,0.8)' : TYPE_META[ev.type].color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Selected day events */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-3xl p-5"
        style={cardStyle}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-display text-[#3A2A2F] text-base">
              {new Date(selected + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-[#7A6670]">{selectedEvents.length} {selectedEvents.length === 1 ? 'event' : 'events'}</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
          >
            + Add
          </button>
        </div>

        {selectedEvents.length === 0 ? (
          <p className="text-sm text-[#B8A0A8] text-center py-4">Nothing planned. A free day 🌸</p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map(ev => {
              const meta = TYPE_META[ev.type]
              return (
                <div
                  key={ev.id}
                  className="flex items-start gap-3 p-3 rounded-2xl transition-all"
                  style={{ background: meta.bg, border: `1px solid ${meta.color}25` }}
                >
                  <button onClick={() => toggleDone(ev.id)} className="mt-0.5 text-base shrink-0">
                    {ev.done ? '✅' : meta.emoji}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-[#3A2A2F] ${ev.done ? 'line-through opacity-50' : ''}`}>{ev.title}</p>
                    {ev.time && <p className="text-xs text-[#7A6670]">🕐 {ev.time}</p>}
                    {ev.note && <p className="text-xs text-[#7A6670] mt-0.5 italic">{ev.note}</p>}
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(ev)} className="text-xs text-[#B8A0A8] hover:text-[#7A6670] px-1.5 py-1 rounded-lg hover:bg-white/60 transition-all">✏️</button>
                    <button onClick={() => deleteEvent(ev.id)} className="text-xs text-[#B8A0A8] hover:text-[#9B111E] px-1.5 py-1 rounded-lg hover:bg-white/60 transition-all">🗑️</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Add/Edit form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(46,31,37,0.45)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md rounded-3xl p-6 space-y-4"
              style={{ background: '#FFF7EF', border: '1.5px solid rgba(248,200,220,0.6)', boxShadow: '0 20px 60px rgba(46,31,37,0.25)' }}
            >
              <p className="font-display text-[#3A2A2F] text-lg">{editId ? 'Edit event' : 'New event'}</p>

              <input
                className="w-full px-4 py-2.5 rounded-2xl text-sm text-[#3A2A2F] focus:outline-none"
                style={{ background: 'white', border: '1.5px solid rgba(201,76,99,0.25)' }}
                placeholder="Event title…"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#7A6670] mb-1 block">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-xl text-sm text-[#3A2A2F] focus:outline-none"
                    style={{ background: 'white', border: '1.5px solid rgba(201,76,99,0.25)' }}
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#7A6670] mb-1 block">Time (optional)</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 rounded-xl text-sm text-[#3A2A2F] focus:outline-none"
                    style={{ background: 'white', border: '1.5px solid rgba(201,76,99,0.25)' }}
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#7A6670] mb-1 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(TYPE_META) as CalEvent['type'][]).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className="py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: form.type === t ? TYPE_META[t].color : TYPE_META[t].bg,
                        color: form.type === t ? 'white' : TYPE_META[t].color,
                        border: `1.5px solid ${TYPE_META[t].color}40`,
                      }}
                    >
                      {TYPE_META[t].emoji} {TYPE_META[t].label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                className="w-full px-4 py-2.5 rounded-2xl text-sm text-[#3A2A2F] focus:outline-none resize-none"
                style={{ background: 'white', border: '1.5px solid rgba(201,76,99,0.25)' }}
                placeholder="Notes (optional)…"
                rows={2}
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-2xl text-sm text-[#7A6670] transition-all"
                  style={{ background: 'rgba(248,200,220,0.2)', border: '1.5px solid rgba(248,200,220,0.4)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  disabled={!form.title.trim()}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, #9B111E, #C94C63)' }}
                >
                  {editId ? 'Save changes' : 'Add event'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
