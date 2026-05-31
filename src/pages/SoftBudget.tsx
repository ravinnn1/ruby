import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import type { BudgetEntry, WishlistItem } from '../lib/types'
import { RubyCard } from '../components/ui/RubyCard'
import { SoftButton } from '../components/ui/SoftButton'
import { EmptyState } from '../components/ui/EmptyState'
import { GentleModal, ConfirmModal } from '../components/ui/GentleModal'
import { formatDate, formatMonthYear } from '../lib/dateUtils'
import toast from 'react-hot-toast'

const budgetCategories = ['self-care','clothes','beauty','coffee/drinks','gifts','wellness','subscriptions','savings','fun','emergency cushion','little treats']

const pauseQuestions = [
  'Do I really want this?',
  'Will I still want this tomorrow?',
  'Is this comfort, impulse, or necessity?',
  'Can I wait 24 hours?',
]

export function SoftBudget() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<BudgetEntry[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [tab, setTab] = useState<'spending' | 'wishlist'>('spending')
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [showAddWish, setShowAddWish] = useState(false)
  const [showPause, setShowPause] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{id: string; type: 'entry'|'wish'} | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [entryCategory, setEntryCategory] = useState(budgetCategories[0])
  const [entryAmount, setEntryAmount] = useState('')
  const [entryNote, setEntryNote] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [savingEntry, setSavingEntry] = useState(false)

  const [wishTitle, setWishTitle] = useState('')
  const [wishPrice, setWishPrice] = useState('')
  const [wishUrl, setWishUrl] = useState('')
  const [wishReason, setWishReason] = useState('')
  const [savingWish, setSavingWish] = useState(false)

  useEffect(() => { if (user) { loadEntries(); loadWishlist() } }, [user])

  const loadEntries = async () => {
    if (!user) return
    const { data } = await supabase.from('budget_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: false })
    setEntries(data || [])
  }

  const loadWishlist = async () => {
    if (!user) return
    const { data } = await supabase.from('wishlist_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setWishlist(data || [])
  }

  const saveEntry = async () => {
    if (!user || !entryAmount) return
    setSavingEntry(true)
    const { error } = await supabase.from('budget_entries').insert({ user_id: user.id, category: entryCategory, amount: parseFloat(entryAmount), note: entryNote || null, entry_date: entryDate })
    setSavingEntry(false)
    if (!error) { toast.success('Added. 🌷', { style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' } }); setShowAddEntry(false); setEntryAmount(''); setEntryNote(''); loadEntries() }
  }

  const saveWish = async () => {
    if (!user || !wishTitle) return
    setSavingWish(true)
    const { error } = await supabase.from('wishlist_items').insert({ user_id: user.id, title: wishTitle, price: wishPrice ? parseFloat(wishPrice) : null, url: wishUrl || null, reason: wishReason || null })
    setSavingWish(false)
    if (!error) { toast.success('Added to wishlist. 🌷', { style: { background: '#FFF7EF', color: '#3A2A2F', border: '1px solid #F8C8DC' } }); setShowAddWish(false); setWishTitle(''); setWishPrice(''); setWishUrl(''); setWishReason(''); loadWishlist() }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    if (deleteTarget.type === 'entry') await supabase.from('budget_entries').delete().eq('id', deleteTarget.id)
    else await supabase.from('wishlist_items').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    loadEntries(); loadWishlist()
  }

  const togglePurchased = async (item: WishlistItem) => {
    await supabase.from('wishlist_items').update({ purchased: !item.purchased }).eq('id', item.id)
    loadWishlist()
  }

  const monthTotal = entries.filter(e => e.entry_date?.startsWith(new Date().toISOString().slice(0,7))).reduce((sum, e) => sum + e.amount, 0)
  const categoryTotals = entries.reduce<Record<string, number>>((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc }, {})

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-[#3A2A2F]">🌷 Soft Budget</h1>
        <p className="text-[#7A6670] text-sm mt-0.5">Gentle money tracking, no shame attached.</p>
      </div>

      <div className="flex rounded-2xl bg-[#F8C8DC]/30 p-1">
        {(['spending', 'wishlist'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-sm rounded-xl transition-all capitalize ${tab === t ? 'bg-white text-[#3A2A2F] shadow-sm font-medium' : 'text-[#7A6670]'}`}>{t}</button>
        ))}
      </div>

      {tab === 'spending' && (
        <>
          <RubyCard variant="gem">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#7A6670] text-xs">This month</p>
                <p className="font-display text-2xl text-[#3A2A2F]">${monthTotal.toFixed(2)}</p>
              </div>
              <SoftButton variant="ruby" size="sm" onClick={() => setShowAddEntry(true)}><Plus size={14} /> Add</SoftButton>
            </div>
          </RubyCard>

          {Object.keys(categoryTotals).length > 0 && (
            <RubyCard variant="matcha">
              <h3 className="font-display text-sm text-[#3A2A2F] mb-3">By category</h3>
              <div className="space-y-2">
                {Object.entries(categoryTotals).sort(([,a],[,b]) => b-a).map(([cat, total]) => (
                  <div key={cat} className="flex items-center justify-between text-sm">
                    <span className="text-[#7A6670] capitalize">{cat}</span>
                    <span className="text-[#3A2A2F] font-medium">${total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </RubyCard>
          )}

          {entries.length === 0 ? (
            <EmptyState icon="🌷" title="No spending logged yet." message="Track your spending gently, without judgment." action={<SoftButton variant="ruby" size="sm" onClick={() => setShowAddEntry(true)}>Add first entry</SoftButton>} />
          ) : (
            <div className="space-y-2">
              {entries.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <RubyCard variant="soft" className="!p-4 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-[#F8C8DC]/50 text-[#C94C63] px-2 py-0.5 rounded-full capitalize">{entry.category}</span>
                          <span className="font-medium text-[#3A2A2F]">${entry.amount.toFixed(2)}</span>
                        </div>
                        {entry.note && <p className="text-[#7A6670] text-xs mt-0.5">{entry.note}</p>}
                        <p className="text-[#B8A0A8] text-xs">{formatDate(entry.entry_date)}</p>
                      </div>
                      <button onClick={() => setDeleteTarget({id: entry.id, type: 'entry'})} className="p-1.5 rounded-xl text-[#7A6670] opacity-0 group-hover:opacity-100 hover:text-[#9B111E] transition-all"><Trash2 size={13} /></button>
                    </div>
                  </RubyCard>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'wishlist' && (
        <>
          <div className="flex gap-2">
            <SoftButton variant="ruby" size="sm" onClick={() => setShowAddWish(true)}><Plus size={14} /> Add to wishlist</SoftButton>
            <button onClick={() => setShowPause(true)} className="px-4 py-2 rounded-2xl bg-[#F8C8DC]/50 border border-[#F8C8DC] text-[#C94C63] text-sm hover:scale-105 transition-all">Purchase pause ⏸</button>
          </div>

          {wishlist.length === 0 ? (
            <EmptyState icon="🌷" title="Wishlist is empty." message="Add things you're dreaming about. No pressure to buy." action={<SoftButton variant="ruby" size="sm" onClick={() => setShowAddWish(true)}>Add first wish</SoftButton>} />
          ) : (
            <div className="space-y-2">
              {wishlist.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <RubyCard variant="soft" className="!p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <button onClick={() => togglePurchased(item)} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${item.purchased ? 'border-[#6F8F5F] bg-[#6F8F5F]' : 'border-[#E8A3B8]'}`}>
                            {item.purchased && <span className="text-white text-[8px]">✓</span>}
                          </button>
                          <span className={`font-display text-sm text-[#3A2A2F] ${item.purchased ? 'line-through opacity-50' : ''}`}>{item.title}</span>
                          {item.price && <span className="text-[#7A6670] text-xs">${item.price.toFixed(2)}</span>}
                        </div>
                        {item.reason && <p className="text-[#7A6670] text-xs mt-0.5 ml-6">{item.reason}</p>}
                        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#C94C63] text-xs ml-6 hover:underline">View →</a>}
                      </div>
                      <button onClick={() => setDeleteTarget({id: item.id, type: 'wish'})} className="p-1.5 rounded-xl text-[#7A6670] opacity-0 group-hover:opacity-100 hover:text-[#9B111E] transition-all"><Trash2 size={13} /></button>
                    </div>
                  </RubyCard>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      <GentleModal isOpen={showAddEntry} onClose={() => setShowAddEntry(false)} title="Add spending">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {budgetCategories.map(cat => (
              <button key={cat} onClick={() => setEntryCategory(cat)} className={`px-2.5 py-1 rounded-full text-xs capitalize transition-all ${entryCategory === cat ? 'bg-[#C94C63] text-white' : 'bg-white/70 border border-[#F8C8DC] text-[#7A6670]'}`}>{cat}</button>
            ))}
          </div>
          <input type="number" value={entryAmount} onChange={e => setEntryAmount(e.target.value)} placeholder="Amount ($)" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
          <input type="text" value={entryNote} onChange={e => setEntryNote(e.target.value)} placeholder="Note (optional)" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
          <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
          <SoftButton variant="ruby" onClick={saveEntry} loading={savingEntry} disabled={!entryAmount} className="w-full">Save 🌷</SoftButton>
        </div>
      </GentleModal>

      <GentleModal isOpen={showAddWish} onClose={() => setShowAddWish(false)} title="Add to wishlist">
        <div className="space-y-4">
          <input type="text" value={wishTitle} onChange={e => setWishTitle(e.target.value)} placeholder="What do you want?" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
          <input type="number" value={wishPrice} onChange={e => setWishPrice(e.target.value)} placeholder="Price (optional)" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
          <input type="url" value={wishUrl} onChange={e => setWishUrl(e.target.value)} placeholder="Link (optional)" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
          <input type="text" value={wishReason} onChange={e => setWishReason(e.target.value)} placeholder="Why do you want it? (optional)" className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-[#F8C8DC] text-[#3A2A2F] placeholder-[#B8A0A8] text-sm focus:outline-none focus:border-[#C94C63] transition-all" />
          <SoftButton variant="ruby" onClick={saveWish} loading={savingWish} disabled={!wishTitle} className="w-full">Add to wishlist 🌷</SoftButton>
        </div>
      </GentleModal>

      <GentleModal isOpen={showPause} onClose={() => setShowPause(false)} title="Purchase pause ⏸">
        <div className="space-y-4">
          <p className="text-[#7A6670] text-sm">Before you buy, take a breath and ask yourself:</p>
          {pauseQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8C8DC]/20">
              <span className="text-[#C94C63] font-bold text-sm shrink-0">{i+1}.</span>
              <p className="text-[#3A2A2F] text-sm">{q}</p>
            </div>
          ))}
          <p className="text-[#7A6670] text-xs italic text-center">You don't have to decide right now. It's okay to wait.</p>
        </div>
      </GentleModal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Remove this?" message="This entry will be deleted." loading={deleting} />
    </div>
  )
}
