'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, MapPin, ToggleLeft, ToggleRight, QrCode, X, Save, Clock, Compass, HelpCircle, ShieldAlert } from 'lucide-react'
import AdminNavbar from '@/components/AdminNavbar'
import { saveDestinationAction, deleteDestinationAction, regenerateQRAction } from '@/app/actions/destinationActions'
import * as Icons from 'lucide-react'
import QRCode from 'qrcode'

interface Destination {
  id: string
  title: string
  description: string
  instructions: string
  representative: string
  stamp_image_url: string
  destination_color: string
  icon: string
  status: string
  gate_number: string
  estimated_duration: string
}

interface Props {
  initialDestinations: Destination[]
}

export default function DestinationsClient({ initialDestinations }: Props) {
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations)
  const [editingDest, setEditingDest] = useState<Partial<Destination> | null>(null)

  // QR Code Modal states
  const [showQRModal, setShowQRModal] = useState<boolean>(false)
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [qrModalTitle, setQrModalTitle] = useState<string>('')

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formInstructions, setFormInstructions] = useState('')
  const [formRep, setFormRep] = useState('')
  const [formColor, setFormColor] = useState('#2563EB')
  const [formIcon, setFormIcon] = useState('MapPin')
  const [formGate, setFormGate] = useState('')
  const [formDuration, setFormDuration] = useState('')
  const [formStatus, setFormStatus] = useState('active')
  const [saving, setSaving] = useState(false)

  // Open Drawer Form
  const openForm = (dest: Partial<Destination> | null) => {
    if (dest) {
      setEditingDest(dest)
      setFormTitle(dest.title || '')
      setFormDesc(dest.description || '')
      setFormInstructions(dest.instructions || '')
      setFormRep(dest.representative || '')
      setFormColor(dest.destination_color || '#2563EB')
      setFormIcon(dest.icon || 'MapPin')
      setFormGate(dest.gate_number || '')
      setFormDuration(dest.estimated_duration || '')
      setFormStatus(dest.status || 'active')
    } else {
      setEditingDest({})
      setFormTitle('')
      setFormDesc('')
      setFormInstructions('1. Arrive at the booth.\n2. Complete the activity.\n3. Present your passport to scan the QR.')
      setFormRep('')
      setFormColor('#2563EB')
      setFormIcon('MapPin')
      setFormGate('')
      setFormDuration('')
      setFormStatus('active')
    }
  }

  // Handle Save (Create/Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      id: editingDest?.id,
      title: formTitle,
      description: formDesc,
      instructions: formInstructions,
      representative: formRep,
      destinationColor: formColor,
      icon: formIcon,
      status: formStatus,
      gateNumber: formGate,
      estimatedDuration: formDuration,
    }

    try {
      const result = await saveDestinationAction(payload)
      if (result.error) {
        alert(result.error)
      } else {
        // Success
        if (result.rawToken) {
          // Newly created: show QR immediately!
          setQrToken(result.rawToken)
          setQrModalTitle(formTitle)
          const dataUrl = await QRCode.toDataURL(result.rawToken, { width: 300, margin: 2 })
          setQrCodeUrl(dataUrl)
          setShowQRModal(true)
        }

        // Reload list client side (simplified by page refresh trigger)
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
      setEditingDest(null)
    }
  }

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gate destination? This action is permanent and clears completions records.')) return

    const result = await deleteDestinationAction(id)
    if (result.error) {
      alert(result.error)
    } else {
      setDestinations(prev => prev.filter(d => d.id !== id))
    }
  }

  // Handle QR Regeneration
  const handleRegenerateQR = async (dest: Destination) => {
    if (!confirm(`Regenerating QR code for ${dest.title} invalidates the previous QR. Representatives must print the new QR immediately. Proceed?`)) return

    try {
      const result = await regenerateQRAction(dest.id)
      if (result.error) {
        alert(result.error)
      } else if (result.rawToken) {
        setQrToken(result.rawToken)
        setQrModalTitle(dest.title)
        const dataUrl = await QRCode.toDataURL(result.rawToken, { width: 300, margin: 2 })
        setQrCodeUrl(dataUrl)
        setShowQRModal(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const renderIcon = (iconName: string, color: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.MapPin
    return <IconComponent className="h-5 w-5" style={{ color }} />
  }

  return (
    <div className="min-h-screen bg-[#08111F] text-slate-100 flex flex-col pb-12">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex-1 w-full space-y-6">

        {/* Page Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5">
          <div>
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest inline-block">
              Gate Management Console
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              FLIGHT GATES CONTROL
            </h2>
            <p className="text-xs text-slate-400">
              Create and edit flight gate destinations, configure stamp parameters, and manage security QR tokens.
            </p>
          </div>

          <button
            onClick={() => openForm(null)}
            className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-widest py-3 px-5 rounded-xl shadow-lg shadow-[#2563EB]/25 border border-[#60A5FA]/25 cursor-pointer transition-all duration-300"
          >
            <Plus className="h-4.5 w-4.5" /> Add New Gate
          </button>
        </section>

        {/* DESTINATIONS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <motion.div
              key={dest.id}
              className="glass-panel-dark rounded-3xl p-6 shadow-xl relative flex flex-col justify-between space-y-5"
            >
              {/* Card header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#040912] rounded-xl border border-slate-800 shrink-0">
                    {renderIcon(dest.icon, dest.destination_color)}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wide truncate max-w-[150px]">
                      {dest.title}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5 block leading-none">
                      {dest.gate_number}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase rounded border ${dest.status === 'active'
                    ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}>
                  {dest.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {dest.description}
              </p>

              {/* Parameters */}
              <div className="bg-[#040912]/50 border border-slate-900 p-3 rounded-2xl grid grid-cols-2 gap-3 font-mono text-[9px] uppercase text-slate-400">
                <div className="space-y-1">
                  <span className="text-slate-550 block font-sans text-[8px]">Est Duration:</span>
                  <span className="font-bold text-white flex items-center gap-1"><Clock className="h-3 w-3" /> {dest.estimated_duration}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-550 block font-sans text-[8px]">Representative:</span>
                  <span className="font-bold text-white flex items-center gap-1"><Compass className="h-3 w-3" /> {dest.representative}</span>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-900">
                <button
                  onClick={() => openForm(dest)}
                  className="flex-1 inline-flex items-center justify-center gap-1 bg-[#0e1b30] hover:bg-slate-800 text-slate-350 font-mono text-[9px] uppercase tracking-widest py-2 px-2.5 rounded-lg border border-slate-800 cursor-pointer"
                  title="Modify Settings"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleRegenerateQR(dest)}
                  className="flex-1 inline-flex items-center justify-center gap-1 bg-[#0e1b30] hover:bg-slate-800 text-slate-350 font-mono text-[9px] uppercase tracking-widest py-2 px-2.5 rounded-lg border border-slate-800 cursor-pointer"
                  title="Issue New Code"
                >
                  <QrCode className="h-3.5 w-3.5 text-amber-500" /> Token
                </button>
                <button
                  onClick={() => handleDelete(dest.id)}
                  className="bg-[#0e1b30] hover:bg-red-950/20 text-slate-450 hover:text-red-400 p-2 rounded-lg border border-slate-800 hover:border-red-500/10 cursor-pointer transition-colors"
                  title="Delete gate"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}

          {destinations.length === 0 && (
            <div className="col-span-full text-center py-16 rounded-3xl border border-dashed border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              No flight gates assigned. Click "Add New Gate" to generate one.
            </div>
          )}
        </section>

      </main>

      {/* DRAWER DRAWER FOR ADDING/EDITING */}
      <AnimatePresence>
        {editingDest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#040912]/80 backdrop-blur-sm flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-lg bg-[#08111F] border-l border-slate-850 h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl relative"
            >

              {/* Drawer header */}
              <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-6">
                <div>
                  <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest block leading-none">
                    Operations Configuration
                  </span>
                  <h4 className="text-sm font-black text-white uppercase tracking-wide mt-1">
                    {editingDest.id ? 'Modify Flight Gate' : 'Assign New Gate'}
                  </h4>
                </div>
                <button
                  onClick={() => setEditingDest(null)}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-800 p-2 rounded-xl text-slate-400 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form elements scrolling wrapper */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto pr-1 space-y-4 pb-6">

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                    Destination Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Guidance Office, SSITE Booth"
                    className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] text-slate-100 rounded-xl py-3 px-4 outline-none text-xs"
                  />
                </div>

                {/* Gate & Duration row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Gate Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                      Gate Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formGate}
                      onChange={(e) => setFormGate(e.target.value)}
                      placeholder="e.g. GATE 1A"
                      className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] text-slate-100 rounded-xl py-3 px-4 outline-none text-xs"
                    />
                  </div>

                  {/* Estimated Duration */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                      Flight Est. Duration
                    </label>
                    <input
                      type="text"
                      required
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="e.g. 10 mins"
                      className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] text-slate-100 rounded-xl py-3 px-4 outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Representative */}
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                    Assigned Officer / Rep
                  </label>
                  <input
                    type="text"
                    required
                    value={formRep}
                    onChange={(e) => setFormRep(e.target.value)}
                    placeholder="Officer Name"
                    className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] text-slate-100 rounded-xl py-3 px-4 outline-none text-xs"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                    Description
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Explain what students must do here..."
                    className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] text-slate-100 rounded-xl py-3 px-4 outline-none text-xs resize-none"
                  />
                </div>

                {/* Step-by-step instructions */}
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                    Step-by-Step Boarding Instructions (One per line)
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder="Enter steps..."
                    className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] text-slate-100 rounded-xl py-3 px-4 outline-none text-xs font-mono"
                  />
                </div>

                {/* Color, Icon, Status row */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                      Stamp Color
                    </label>
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-full bg-transparent h-10 border border-slate-850 focus:border-[#2563EB] rounded-xl outline-none cursor-pointer p-0.5"
                    />
                  </div>

                  {/* Icon */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                      Icon Name
                    </label>
                    <select
                      value={formIcon}
                      onChange={(e) => setFormIcon(e.target.value)}
                      className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] text-slate-350 rounded-xl h-10 px-3 outline-none text-xs cursor-pointer appearance-none"
                    >
                      <option value="MapPin">MapPin</option>
                      <option value="BookOpen">BookOpen</option>
                      <option value="Compass">Compass</option>
                      <option value="Award">Award</option>
                      <option value="Plane">Plane</option>
                      <option value="ShieldCheck">ShieldCheck</option>
                      <option value="Clock">Clock</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                      Gate State
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full bg-[#0E1B30] border border-slate-800 focus:border-[#2563EB] text-slate-350 rounded-xl h-10 px-3 outline-none text-xs cursor-pointer appearance-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

              </form>

              {/* Submit button footer */}
              <div className="border-t border-slate-850 pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditingDest(null)}
                  className="w-1/2 bg-[#0e1b30] hover:bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl border border-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-1/2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl border border-[#60A5FA]/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Gate'}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR CODE GENERATED DISPLAY MODAL */}
      <AnimatePresence>
        {showQRModal && qrCodeUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-[#040912]/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-sm w-full bg-[#08111F] border border-amber-500/25 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setShowQRModal(false)
                  setQrToken(null)
                  setQrCodeUrl(null)
                }}
                className="absolute top-4 right-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 p-2 rounded-xl text-slate-400 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-1 mb-6 text-center">
                <span className="text-[8px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-block leading-none">
                  Secure Scanner Token
                </span>
                <h4 className="text-sm font-extrabold text-white uppercase mt-1.5 truncate max-w-[200px] mx-auto">
                  {qrModalTitle}
                </h4>
              </div>

              {/* QR Image */}
              <div className="bg-white p-4 rounded-2xl mx-auto inline-block shadow-inner mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="Secure QR Code" className="w-48 h-48 mx-auto" />
              </div>

              <div className="space-y-4">
                <div className="text-[10px] text-slate-500 leading-normal max-w-xs mx-auto">
                  Representatives display this QR code at their activity booth. Freshmen scan this to stamp their passports.
                </div>

                {/* Security Token alert */}
                <div className="text-[9px] font-mono text-amber-500 border border-amber-500/15 bg-amber-950/20 py-2.5 px-3 rounded-xl break-all">
                  Token: {qrToken?.substring(0, 32)}...
                </div>

                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-amber-500" /> NOT STORED IN DATABASE UNENCRYPTED
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
