'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Download, HelpCircle, User, Compass, Calendar, ChevronRight, X, FileSpreadsheet, FileText, FileDown, CheckCircle } from 'lucide-react'
import AdminNavbar from '@/components/AdminNavbar'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'

interface StampDetails {
  destination_id: string
  completion_date: string
  title: string
  gate_number: string
  color: string
}

interface Student {
  id: string
  email: string
  full_name: string
  avatar_url: string
  student_id: string
  course: string
  section: string
  year_level: string
  stampsCount: number
  registration_date: string
  clearedStamps: StampDetails[]
}

interface Props {
  students: Student[]
  totalGates: number
}

export default function StudentsClient({ students, totalGates }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('All')
  const [yearFilter, setYearFilter] = useState('All')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Filter students based on search term and selectors
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.student_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.section.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCourse = courseFilter === 'All' || s.course.includes(courseFilter)
    const matchesYear = yearFilter === 'All' || s.year_level === yearFilter

    return matchesSearch && matchesCourse && matchesYear
  })

  // EXPORT EXCEL ACTION
  const handleExportExcel = () => {
    const data = filteredStudents.map((s) => ({
      'Full Name': s.full_name.toUpperCase(),
      'Email Address': s.email,
      'Student ID': s.student_id || 'PENDING',
      'Course': s.course,
      'Section': s.section,
      'Year Level': s.year_level,
      'Stamps Collected': `${s.stampsCount}/${totalGates}`,
      'Registration Date': new Date(s.registration_date).toLocaleDateString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Passenger Manifest')
    XLSX.writeFile(workbook, 'cit_passengers_manifest.xlsx')
  }

  // EXPORT CSV ACTION
  const handleExportCSV = () => {
    const headers = ['Full Name', 'Email', 'Student ID', 'Course', 'Section', 'Year Level', 'Stamps', 'Registration Date']
    const rows = filteredStudents.map((s) => [
      `"${s.full_name.toUpperCase()}"`,
      `"${s.email}"`,
      `"${s.student_id || 'PENDING'}"`,
      `"${s.course}"`,
      `"${s.section}"`,
      `"${s.year_level}"`,
      `"${s.stampsCount}/${totalGates}"`,
      `"${new Date(s.registration_date).toLocaleDateString()}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'cit_passengers_manifest.csv')
    link.click()
  }

  // EXPORT PDF ACTION
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('CIT PASSPORT PASSENGER IMMIGRATION MANIFEST', 14, 15)

    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Total Records: ${filteredStudents.length} | Generated: ${new Date().toLocaleString()}`, 14, 21)

    let y = 32
    doc.setFont('Helvetica', 'bold')
    doc.text('Passenger Name', 14, y)
    doc.text('Student ID', 75, y)
    doc.text('Course & Sec', 115, y)
    doc.text('Stamps', 165, y)
    doc.line(14, y + 2, 195, y + 2)

    doc.setFont('Helvetica', 'normal')
    y += 10

    filteredStudents.forEach((s) => {
      if (y > 275) {
        doc.addPage()
        y = 20
      }
      doc.text(s.full_name.toUpperCase().substring(0, 28), 14, y)
      doc.text(s.student_id || 'PENDING', 75, y)

      const courseShort = s.course.split(' ').map(w => w[0]).join('').toUpperCase()
      doc.text(`${courseShort} ${s.section}`, 115, y)
      doc.text(`${s.stampsCount}/${totalGates}`, 165, y)
      y += 8
    })

    doc.save('cit_passenger_manifest.pdf')
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F1D36] flex flex-col pb-12">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex-1 w-full space-y-6">

        {/* Page Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E2E8F0] pb-5">
          <div>
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-700 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest inline-block">
              Passenger Database
            </span>
            <h2 className="text-3xl font-black text-[#052856] tracking-tight mt-1">
              IMMIGRATION ROSTER
            </h2>
            <p className="text-xs text-[#475569] font-medium">
              Browse registered freshmen passengers, audit stamp timeline records, and download reports.
            </p>
          </div>

          {/* Export tools */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleExportExcel}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-[#F1F5F9] text-[#0F1D36] font-mono text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl border border-[#CBD5E1] shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-white hover:bg-[#F1F5F9] text-[#0F1D36] font-mono text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl border border-[#CBD5E1] shadow-sm cursor-pointer"
            >
              <FileText className="h-4 w-4 text-[#1E4FCC]" /> CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-[#052856] hover:bg-[#031D40] text-white font-mono text-[10px] font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl border border-[#0A3A78] shadow-md shadow-[#052856]/20 cursor-pointer"
            >
              <FileDown className="h-4 w-4 text-white" /> PDF
            </button>
          </div>
        </section>

        {/* SEARCH & FILTERS PANEL */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-4 gap-4 items-center">

          {/* Search box */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Passenger (Name, Email, Student ID...)"
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] focus:ring-1 focus:ring-[#052856] text-[#0F1D36] placeholder:text-[#94A3B8] rounded-xl py-2.5 pl-10 pr-4 outline-none text-xs font-semibold transition-all"
            />
          </div>

          {/* Course filter */}
          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] focus:ring-1 focus:ring-[#052856] text-[#0F1D36] font-semibold rounded-xl py-2.5 px-4 outline-none text-xs cursor-pointer appearance-none"
            >
              <option value="All">All Programs</option>
              <option value="Information Technology">Information Technology (BSIT)</option>
              <option value="Computer Science">Computer Science (BSCS)</option>
              <option value="Computer Engineering">Computer Engineering (BSCpE)</option>
              <option value="Associate in Computer">Associate (ACT)</option>
            </select>
          </div>

          {/* Year filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CBD5E1] focus:border-[#052856] focus:ring-1 focus:ring-[#052856] text-[#0F1D36] font-semibold rounded-xl py-2.5 px-4 outline-none text-xs cursor-pointer appearance-none"
            >
              <option value="All">All Years</option>
              <option value="1st Year">1st Year (Freshmen)</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

        </section>

        {/* PASSENGER TABLE */}
        <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E2E8F0]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] font-mono text-[9.5px] uppercase tracking-widest text-[#475569] font-extrabold">
                  <th className="py-4 px-6">Passenger Details</th>
                  <th className="py-4 px-6">Student ID</th>
                  <th className="py-4 px-6">Course & Sec</th>
                  <th className="py-4 px-6 text-center">Stamps Collected</th>
                  <th className="py-4 px-6">Registered Date</th>
                  <th className="py-4 px-6 text-right">Clearance Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredStudents.map((stud) => (
                  <tr key={stud.id} className="hover:bg-[#F8FAFC] transition-colors">

                    {/* Passenger details */}
                    <td className="py-4 px-6 flex items-center gap-3">
                      {stud.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={stud.avatar_url} alt="" className="h-8.5 w-8.5 rounded-full object-cover border border-[#CBD5E1]" />
                      ) : (
                        <div className="h-8.5 w-8.5 rounded-full bg-[#052856]/10 text-[#052856] flex items-center justify-center font-bold text-xs uppercase border border-[#052856]/20">
                          {stud.full_name[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-[#0F1D36] uppercase tracking-wide">{stud.full_name}</div>
                        <div className="text-[10px] text-[#64748B] font-mono font-bold mt-0.5">{stud.email}</div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-4 px-6 font-mono text-[#475569] font-extrabold">
                      {stud.student_id || 'PENDING'}
                    </td>

                    {/* Course */}
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-[#0F1D36] uppercase">{stud.course.split(' ').map(w => w[0]).join('').toUpperCase()}</div>
                      <div className="text-[10px] text-[#64748B] uppercase font-mono font-bold mt-0.5">Section {stud.section}</div>
                    </td>

                    {/* Stamp Count */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg font-mono tracking-wider ${stud.stampsCount === totalGates
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-[#F1F5F9] text-[#1E4FCC] border border-[#CBD5E1]'
                        }`}>
                        {stud.stampsCount} / {totalGates} GATES
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 font-mono text-[#475569] font-bold">
                      {new Date(stud.registration_date).toLocaleDateString()}
                    </td>

                    {/* Action audit */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedStudent(stud)}
                        className="inline-flex items-center gap-1 bg-[#F1F5F9] hover:bg-[#052856] hover:text-white text-[#0F1D36] font-mono text-[9px] uppercase tracking-widest py-2 px-3 rounded-lg border border-[#CBD5E1] transition-all cursor-pointer font-bold"
                      >
                        Inspect Stamps <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>

                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#64748B] font-bold uppercase tracking-wider">
                      No passengers match search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* STUDENT PASS DEPT DETAILS MODAL */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="max-w-lg w-full bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-2xl relative text-[#0F1D36]"
            >

              {/* Modal header */}
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-6 py-4 flex justify-between items-center">
                <div>
                  <span className="text-[8px] font-mono text-[#0A3A78] font-black uppercase tracking-widest block leading-none">
                    Passenger Entry Ledger
                  </span>
                  <h4 className="text-sm font-black text-[#052856] tracking-wide uppercase mt-1">
                    {selectedStudent.full_name}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] p-2 rounded-xl text-[#475569] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-6 space-y-6 max-h-[450px] overflow-y-auto">
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] p-4 rounded-2xl grid grid-cols-2 gap-4 font-mono text-[10px] uppercase text-[#334155]">
                  <div>
                    <span className="text-[#64748B] block text-[9px] font-sans font-bold">Student ID:</span>
                    <span className="font-bold text-[#052856] block mt-0.5">{selectedStudent.student_id || 'PENDING'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[9px] font-sans font-bold">Year & Sec:</span>
                    <span className="font-bold text-[#052856] block mt-0.5">{selectedStudent.year_level} / {selectedStudent.section}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#64748B] block text-[9px] font-sans font-bold">Program:</span>
                    <span className="font-bold text-[#1E4FCC] block mt-0.5 truncate">{selectedStudent.course}</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <h5 className="text-xs font-extrabold uppercase tracking-widest text-[#052856]">
                    Completed Gate Audits ({selectedStudent.stampsCount} Cleared)
                  </h5>

                  <div className="space-y-3">
                    {selectedStudent.clearedStamps.map((stamp) => (
                      <div
                        key={stamp.destination_id}
                        className="flex justify-between items-center p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" style={{ color: stamp.color }} />
                          <div>
                            <span className="font-bold text-[#0F1D36] uppercase tracking-wide block">{stamp.title}</span>
                            <span className="text-[9px] font-mono text-[#64748B] font-bold uppercase">Gate: {stamp.gate_number}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-[#475569] font-bold">
                          {new Date(stamp.completion_date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}

                    {selectedStudent.clearedStamps.length === 0 && (
                      <div className="text-center py-6 text-[#64748B] text-xs font-bold uppercase tracking-wider">
                        No gates cleared yet.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
