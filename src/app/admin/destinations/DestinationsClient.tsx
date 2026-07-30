'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, MapPin, QrCode, X, Clock, Compass, Search, ShieldAlert, AlertTriangle, CheckCircle2, Upload, ImageIcon } from 'lucide-react'
import AdminNavbar from '@/components/AdminNavbar'
import { saveDestinationAction, deleteDestinationAction, regenerateQRAction } from '@/app/actions/destinationActions'
import QRCode from 'qrcode'

interface Destination {
  id: string
  title: string
  description: string
  instructions: string
  representative: string
  stamp_image_url?: string
  destination_color?: string
  stamp_color?: string
  icon?: string
  status?: string
  gate_number: string
  estimated_duration: string
  location_name?: string
}

interface Props {
  initialDestinations: Destination[]
}

export default function DestinationsClient({ initialDestinations }: Props) {
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations)
  const [editingDest, setEditingDest] = useState<Partial<Destination> | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Custom Modal States (Replaces native browser alert/confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: 'regenerate_qr' | 'delete_gate'
    dest: Destination | null
  }>({ isOpen: false, type: 'regenerate_qr', dest: null })

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    isError?: boolean
  }>({ isOpen: false, title: '', message: '' })

  // QR Code Modal states
  const [showQRModal, setShowQRModal] = useState<boolean>(false)
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [qrModalTitle, setQrModalTitle] = useState<string>('')
  const [qrGateNumber, setQrGateNumber] = useState<string>('')

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formInstructions, setFormInstructions] = useState('')
  const [formRep, setFormRep] = useState('')
  const [formColor, setFormColor] = useState('#052856')
  const [formIcon, setFormIcon] = useState('MapPin')
  const [formGate, setFormGate] = useState('')
  const [formDuration, setFormDuration] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formStatus, setFormStatus] = useState('active')
  const [formStampImage, setFormStampImage] = useState('')
  const [saving, setSaving] = useState(false)

  const compressImageFile = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(e.target?.result as string)
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedDataUrl)
        }
        img.onerror = () => reject(new Error('Failed to load image for compression'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read image file'))
      reader.readAsDataURL(file)
    })
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setAlertModal({
          isOpen: true,
          title: 'File Too Large',
          message: 'Please select an image smaller than 10MB.',
          isError: true,
        })
        return
      }
      try {
        const compressed = await compressImageFile(file)
        setFormStampImage(compressed)
      } catch (err) {
        console.error('Compression failed, falling back to raw data URL:', err)
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormStampImage(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // Open Drawer Form
  const openForm = (dest: Partial<Destination> | null) => {
    if (dest) {
      setEditingDest(dest)
      setFormTitle(dest.title || '')
      setFormDesc(dest.description || '')
      setFormInstructions(dest.instructions || '')
      setFormRep(dest.representative || '')
      setFormColor(dest.destination_color || dest.stamp_color || '#052856')
      setFormIcon(dest.icon || 'MapPin')
      setFormGate(dest.gate_number || '')
      setFormDuration(dest.estimated_duration || '')
      setFormLocation(dest.location_name || '')
      setFormStatus(dest.status || 'active')
      setFormStampImage(dest.stamp_image_url || '')
    } else {
      setEditingDest({})
      setFormTitle('')
      setFormDesc('')
      setFormInstructions('1. Arrive at the booth.\n2. Complete the activity.\n3. Present your passport to scan the QR.')
      setFormRep('')
      setFormColor('#052856')
      setFormIcon('MapPin')
      setFormGate('')
      setFormDuration('')
      setFormLocation('')
      setFormStatus('active')
      setFormStampImage('')
    }
    setIsFormOpen(true)
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
      locationName: formLocation,
      stampImageUrl: formStampImage,
    }

    try {
      const result = await saveDestinationAction(payload)
      if (result.error) {
        setAlertModal({
          isOpen: true,
          title: 'Gate Save Error',
          message: result.error,
          isError: true,
        })
      } else {
        if (result.rawToken) {
          setQrToken(result.rawToken)
          setQrModalTitle(formTitle)
          setQrGateNumber(formGate)
          const dataUrl = await QRCode.toDataURL(result.rawToken, { width: 320, margin: 2 })
          setQrCodeUrl(dataUrl)
          setShowQRModal(true)
        } else {
          setAlertModal({
            isOpen: true,
            title: 'Flight Gate Saved',
            message: `Successfully saved ${formTitle} (Gate ${formGate}).`,
          })
        }
        window.location.reload()
      }
    } catch (err: any) {
      setAlertModal({
        isOpen: true,
        title: 'Unexpected Error',
        message: err?.message || 'An unexpected error occurred while saving the gate.',
        isError: true,
      })
    } finally {
      setSaving(false)
      setIsFormOpen(false)
      setEditingDest(null)
    }
  }

  // Trigger Confirmation Modal for QR Regeneration
  const promptRegenerateQR = (dest: Destination) => {
    setConfirmModal({
      isOpen: true,
      type: 'regenerate_qr',
      dest,
    })
  }

  // Trigger Confirmation Modal for Delete
  const promptDeleteGate = (dest: Destination) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete_gate',
      dest,
    })
  }

  // Execute confirmed action
  const handleConfirmAction = async () => {
    const { type, dest } = confirmModal
    if (!dest) return

    setConfirmModal({ isOpen: false, type: 'regenerate_qr', dest: null })

    if (type === 'regenerate_qr') {
      try {
        const result = await regenerateQRAction(dest.id, dest.gate_number)
        if (result.error) {
          setAlertModal({
            isOpen: true,
            title: 'QR Generation Failed',
            message: result.error,
            isError: true,
          })
        } else if (result.rawToken) {
          setQrToken(result.rawToken)
          setQrModalTitle(dest.title)
          setQrGateNumber(dest.gate_number)
          const dataUrl = await QRCode.toDataURL(result.rawToken, { width: 320, margin: 2 })
          setQrCodeUrl(dataUrl)
          setShowQRModal(true)
        }
      } catch (err: any) {
        setAlertModal({
          isOpen: true,
          title: 'QR Error',
          message: err?.message || 'Failed to generate QR token.',
          isError: true,
        })
      }
    } else if (type === 'delete_gate') {
      try {
        const result = await deleteDestinationAction(dest.id)
        if (result.error) {
          setAlertModal({
            isOpen: true,
            title: 'Delete Failed',
            message: result.error,
            isError: true,
          })
        } else {
          setDestinations(prev => prev.filter(d => d.id !== dest.id))
          setAlertModal({
            isOpen: true,
            title: 'Gate Deleted',
            message: `${dest.title} has been permanently removed from operations directory.`,
          })
        }
      } catch (err: any) {
        setAlertModal({
          isOpen: true,
          title: 'Delete Error',
          message: err?.message || 'Failed to delete destination.',
          isError: true,
        })
      }
    }
  }

  const filtered = destinations.filter((d) => {
    const term = searchTerm.toLowerCase()
    return (
      d.title.toLowerCase().includes(term) ||
      d.gate_number.toLowerCase().includes(term) ||
      (d.location_name && d.location_name.toLowerCase().includes(term)) ||
      (d.representative && d.representative.toLowerCase().includes(term))
    )
  })

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F1D36] flex flex-col pb-12">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex-1 w-full space-y-8">

        {/* Page Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E2E8F0] pb-5">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#0A3A78] uppercase flex items-center gap-1.5 mb-1">
              <Compass className="h-4 w-4 text-[#0A3A78]" /> Gate Directory & Stamp Dispatch
            </span>
            <h2 className="text-3xl font-black text-[#052856] tracking-tight">
              FLIGHT GATES MANAGEMENT
            </h2>
            <p className="text-xs text-[#475569] font-medium mt-1">
              Create and manage Pamuklat booth stops, generate gate clearance tokens, and configure QR verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openForm(null)}
              className="flex items-center gap-2 bg-[#052856] hover:bg-[#031D40] text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-[#052856]/20 border border-[#0A3A78] cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Flight Gate
            </button>
          </div>
        </section>

        {/* SEARCH & FILTERS BAR */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Gate Title, Number, Location..."
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] focus:ring-1 focus:ring-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-semibold transition-all"
            />
          </div>

          <div className="text-xs font-mono text-[#64748B] font-bold uppercase">
            Showing <strong className="text-[#052856]">{filtered.length}</strong> active flight gates
          </div>
        </section>

        {/* DESTINATIONS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest) => (
            <motion.div
              layout
              key={dest.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-[#E2E8F0] flex flex-col justify-between group"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-44 w-full bg-[#E2E8F0] overflow-hidden">
                  {dest.stamp_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dest.stamp_image_url}
                      alt={dest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#052856]/10 to-[#1E4FCC]/10 text-[#052856]">
                      <MapPin className="h-10 w-10 opacity-40" />
                    </div>
                  )}

                  {/* Gate Number Badge */}
                  <div className="absolute top-3 left-3 bg-[#052856] text-white font-mono text-[10px] font-black uppercase px-3 py-1 rounded-xl shadow-md border border-[#0A3A78]">
                    {dest.gate_number}
                  </div>

                  {/* Stamp Color Dot */}
                  <div
                    className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: dest.destination_color || dest.stamp_color || '#052856' }}
                    title={`Stamp Color: ${dest.destination_color || dest.stamp_color}`}
                  />
                </div>

                {/* Content info */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-[#0F1D36] tracking-tight">
                      {dest.title}
                    </h3>
                    {dest.location_name && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#475569] font-bold mt-1">
                        <MapPin className="h-3.5 w-3.5 text-[#052856] shrink-0" />
                        <span>{dest.location_name}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#334155] line-clamp-2 leading-relaxed font-medium">
                    {dest.description}
                  </p>

                  <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-[10px] font-mono text-[#64748B] font-bold uppercase">
                    <div>
                      <span className="block text-[8px] text-[#94A3B8]">Est Duration</span>
                      <span className="text-[#0F1D36] font-extrabold flex items-center gap-1"><Clock className="h-3 w-3 text-amber-600" /> {dest.estimated_duration}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-[#94A3B8]">Representative</span>
                      <span className="text-[#0F1D36] font-extrabold truncate block">{dest.representative}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                <button
                  onClick={() => promptRegenerateQR(dest)}
                  className="flex items-center gap-1.5 bg-[#052856] hover:bg-[#031D40] text-white text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <QrCode className="h-3.5 w-3.5" /> Stamp Token QR
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openForm(dest)}
                    className="p-2 text-[#475569] hover:text-[#052856] hover:bg-white rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#E2E8F0]"
                    title="Edit Gate Details"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => promptDeleteGate(dest)}
                    className="p-2 text-[#475569] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                    title="Delete Gate"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-[#E2E8F0] space-y-3">
              <Compass className="h-12 w-12 text-[#64748B] mx-auto opacity-40" />
              <p className="text-xs text-[#64748B] font-bold uppercase tracking-wider">No matching flight gates found in directory.</p>
            </div>
          )}
        </section>

        {/* CUSTOM REGENERATE / DELETE CONFIRMATION MODAL */}
        <AnimatePresence>
          {confirmModal.isOpen && confirmModal.dest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-[#E2E8F0] shadow-2xl space-y-6 relative text-[#0F1D36]"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${confirmModal.type === 'delete_gate' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-[#052856] border border-blue-200'}`}>
                    {confirmModal.type === 'delete_gate' ? <Trash2 className="h-6 w-6" /> : <QrCode className="h-6 w-6" />}
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-[#0A3A78] font-black uppercase tracking-widest block">
                      {confirmModal.type === 'delete_gate' ? 'Permanent Removal' : 'QR Token Refresh'}
                    </span>
                    <h3 className="text-lg font-black text-[#052856] uppercase mt-0.5">
                      {confirmModal.type === 'delete_gate' ? 'Delete Flight Gate?' : 'Regenerate QR Token?'}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#475569] font-medium leading-relaxed bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                  {confirmModal.type === 'delete_gate' ? (
                    <>Are you sure you want to delete <strong>{confirmModal.dest.title}</strong>? This action is permanent and clears student completion records for this stop.</>
                  ) : (
                    <>Regenerating the QR clearance token for <strong>{confirmModal.dest.title}</strong> invalidates the previous QR. Booth representatives must display the newly generated QR code immediately.</>
                  )}
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setConfirmModal({ isOpen: false, type: 'regenerate_qr', dest: null })}
                    className="px-5 py-3 bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569] font-extrabold text-xs uppercase rounded-xl hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className={`px-5 py-3 text-white font-extrabold text-xs uppercase rounded-xl shadow-md transition-colors cursor-pointer ${
                      confirmModal.type === 'delete_gate'
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                        : 'bg-[#052856] hover:bg-[#031D40] shadow-[#052856]/20'
                    }`}
                  >
                    {confirmModal.type === 'delete_gate' ? 'Confirm Delete' : 'Generate New QR'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CUSTOM ALERT MODAL */}
        <AnimatePresence>
          {alertModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-[#E2E8F0] shadow-2xl text-center space-y-5 relative text-[#0F1D36]"
              >
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${alertModal.isError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                  {alertModal.isError ? <AlertTriangle className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
                </div>

                <div>
                  <h3 className="text-base font-black text-[#052856] uppercase">
                    {alertModal.title}
                  </h3>
                  <p className="text-xs text-[#475569] font-medium leading-relaxed mt-2">
                    {alertModal.message}
                  </p>
                </div>

                <button
                  onClick={() => setAlertModal({ isOpen: false, title: '', message: '' })}
                  className="w-full bg-[#052856] text-white font-extrabold text-xs uppercase py-3 rounded-xl hover:bg-[#031D40] transition-colors shadow-md"
                >
                  Understand
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* QR CODE TOKEN DISPLAY MODAL */}
        <AnimatePresence>
          {showQRModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-[#E2E8F0] shadow-2xl text-center space-y-5 relative text-[#0F1D36]"
              >
                <button
                  onClick={() => setShowQRModal(false)}
                  className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F1D36] p-1.5 rounded-full hover:bg-[#F1F5F9] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div>
                  <span className="text-[9px] font-mono text-[#0A3A78] font-black uppercase tracking-widest block">
                    Official Clearance Stamp Token
                  </span>
                  <h3 className="text-lg font-black text-[#052856] uppercase mt-1">
                    {qrModalTitle}
                  </h3>
                  {qrGateNumber && (
                    <span className="inline-block bg-[#052856] text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md mt-1">
                      {qrGateNumber}
                    </span>
                  )}
                </div>

                {/* QR Image Box */}
                {qrCodeUrl && (
                  <div className="bg-[#F8FAFC] p-4 rounded-2xl border-2 border-dashed border-[#CBD5E1] inline-block shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeUrl} alt="Secure QR Code" className="w-52 h-52 mx-auto" />
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-[10px] text-[#475569] font-medium leading-relaxed">
                    Display this QR code at your activity booth. Freshmen scan this token with their mobile camera to collect their stamp.
                  </p>

                  {qrToken && (
                    <div className="text-[9px] font-mono text-amber-600 border border-amber-500/20 bg-amber-50 py-2 px-3 rounded-xl break-all">
                      Token: {qrToken.substring(0, 32)}...
                    </div>
                  )}

                  <div className="text-[8px] font-mono text-[#64748B] uppercase tracking-widest flex items-center justify-center gap-1">
                    <ShieldAlert className="h-3 w-3 text-amber-600" /> NOT STORED UNENCRYPTED
                  </div>
                </div>

                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full bg-[#052856] text-white font-extrabold text-xs uppercase py-3 rounded-xl hover:bg-[#031D40] transition-colors shadow-md"
                >
                  Close Window
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CREATE / EDIT GATE DRAWER SLIDE-OVER */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 md:p-8 border-l border-[#E2E8F0] shadow-2xl flex flex-col justify-between text-[#0F1D36]"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-6">
                    <div>
                      <span className="text-[9px] font-mono text-[#0A3A78] font-black uppercase tracking-widest block">
                        Control Tower Form
                      </span>
                      <h3 className="text-xl font-black text-[#052856] uppercase">
                        {editingDest?.id ? 'Modify Flight Gate' : 'New Flight Gate Stop'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsFormOpen(false)}
                      className="text-[#64748B] hover:text-[#0F1D36] p-2 rounded-xl hover:bg-[#F1F5F9] transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form id="gateForm" onSubmit={handleSave} className="space-y-4 text-xs">
                    {/* Flight Gate Image / Banner Upload */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-1.5 flex items-center justify-between">
                        <span>Flight Gate Cover / Banner Image</span>
                        <span className="text-[10px] text-[#64748B] font-normal normal-case">(Upload image file or URL)</span>
                      </label>
                      
                      {formStampImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-[#CBD5E1] h-36 w-full group mb-2 shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formStampImage} alt="Gate cover preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="bg-white hover:bg-slate-100 text-[#052856] text-[11px] font-extrabold px-3 py-1.5 rounded-xl cursor-pointer shadow-md transition-all">
                              Change Image
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                            </label>
                            <button
                              type="button"
                              onClick={() => setFormStampImage('')}
                              className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-md transition-all"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-[#CBD5E1] hover:border-[#052856] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#F8FAFC] hover:bg-[#F1F5F9] mb-2 group">
                          <Upload className="h-6 w-6 text-[#052856] mb-1.5 opacity-70 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-black text-[#052856]">Click to upload gate image</span>
                          <span className="text-[10px] font-medium text-[#64748B] mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                        </label>
                      )}

                      <input
                        type="text"
                        value={formStampImage.startsWith('data:') ? '' : formStampImage}
                        onChange={(e) => setFormStampImage(e.target.value)}
                        placeholder="Or paste image URL (e.g. https://...)"
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2 px-3 outline-none text-[11px] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-1.5">
                        Gate Title / Station Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. IT Innovation Hub & Robotics Lab"
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2.5 px-3.5 outline-none font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-1.5">
                          Gate Number Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={formGate}
                          onChange={(e) => setFormGate(e.target.value)}
                          placeholder="e.g. GATE 01"
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2.5 px-3.5 outline-none font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-1.5">
                          Stamp Color (Hex Code) *
                        </label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={formColor}
                            onChange={(e) => setFormColor(e.target.value)}
                            className="h-9 w-9 rounded-lg bg-transparent border-0 cursor-pointer"
                          />
                          <input
                            type="text"
                            required
                            value={formColor}
                            onChange={(e) => setFormColor(e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2.5 px-3.5 outline-none font-mono font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-1.5">
                        Campus Physical Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="e.g. St. Thomas Aquinas Building Room 302"
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2.5 px-3.5 outline-none font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-1.5">
                          Est Duration *
                        </label>
                        <input
                          type="text"
                          required
                          value={formDuration}
                          onChange={(e) => setFormDuration(e.target.value)}
                          placeholder="e.g. 15 mins"
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2.5 px-3.5 outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-1.5">
                          Booth Representative *
                        </label>
                        <input
                          type="text"
                          required
                          value={formRep}
                          onChange={(e) => setFormRep(e.target.value)}
                          placeholder="e.g. Prof. Dela Pena"
                          className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2.5 px-3.5 outline-none font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-1.5">
                        Brief Station Description *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        placeholder="Overview of booth activities..."
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2.5 px-3.5 outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[#334155] font-extrabold mb-1.5">
                        Clearance & Stamp Instructions *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formInstructions}
                        onChange={(e) => setFormInstructions(e.target.value)}
                        placeholder="Steps for student to earn stamp..."
                        className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2.5 px-3.5 outline-none font-semibold"
                      />
                    </div>
                  </form>
                </div>

                <div className="pt-6 border-t border-[#E2E8F0] flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="w-1/3 bg-[#F1F5F9] border border-[#CBD5E1] text-[#475569] font-bold text-xs uppercase py-3 rounded-xl hover:bg-[#E2E8F0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="gateForm"
                    disabled={saving}
                    className="w-2/3 bg-[#052856] text-white font-extrabold text-xs uppercase py-3 rounded-xl hover:bg-[#031D40] disabled:opacity-50 transition-colors shadow-md"
                  >
                    {saving ? 'Saving Flight Gate...' : editingDest?.id ? 'Update Gate' : 'Create Flight Gate'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  )
}
