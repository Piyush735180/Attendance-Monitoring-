/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, RefreshCcw, UserPlus, X, Phone, Mail, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Student } from '../types';

interface StudentViewProps {
  token: string;
  triggerNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function StudentView({ token, triggerNotification }: StudentViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  
  // Modal configurations
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<Student>({
    student_id: '',
    name: '',
    roll_number: '',
    class: 'B.Tech CSE',
    section: 'A',
    email: '',
    contact: ''
  });

  // Modal Validation State
  const [formError, setFormError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/students', window.location.origin);
      if (search) url.searchParams.append('search', search);
      if (selectedClass) url.searchParams.append('class', selectedClass);

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        triggerNotification('error', 'Failed to retrieve student directory');
      }
    } catch (e) {
      triggerNotification('error', 'Network error connecting to administration server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedClass]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({
      student_id: `STU${Math.floor(100 + Math.random() * 900)}`, // auto seed suggestion but editable
      name: '',
      roll_number: '',
      class: 'B.Tech CSE',
      section: 'A',
      email: '',
      contact: ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setModalMode('edit');
    setFormData({ ...student });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (student_id: string, name: string) => {
    const doubleCheck = window.confirm(`Are you absolutely sure you want to delete ${name} (${student_id})? This will permanently delete all historic attendance registers for this student.`);
    if (!doubleCheck) return;

    try {
      const res = await fetch(`/api/students/${student_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        triggerNotification('success', `Student '${name}' deleted successfully.`);
        fetchStudents();
      } else {
        const err = await res.json();
        triggerNotification('error', err.error || 'Failed to complete deletion');
      }
    } catch (e) {
      triggerNotification('error', 'Failed to submit network request');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!formData.student_id.trim() || !formData.name.trim() || !formData.roll_number.trim() || !formData.email.trim() || !formData.contact.trim()) {
      setFormError('Please fill in all the required input fields.');
      return;
    }

    // Email pattern check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please input a valid email address.');
      return;
    }

    // Contact numeric check
    const contactRegex = /^[0-9+\s\-()]{8,15}$/;
    if (!contactRegex.test(formData.contact)) {
      setFormError('Please input a valid contact phone number.');
      return;
    }

    const endpoint = modalMode === 'add' ? '/api/students' : `/api/students/${formData.student_id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        triggerNotification('success', modalMode === 'add' ? 'Student registered successfully!' : 'Student records updated!');
        setShowModal(false);
        fetchStudents();
      } else {
        const err = await res.json();
        setFormError(err.error || 'Operation failed. Verify student credentials.');
      }
    } catch (e) {
      setFormError('Network communication error.');
    }
  };

  const availableClasses = ['B.Tech CSE', 'BCA', 'B.Tech IT'];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto" id="student-view-container">
      {/* Directory Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">Student Directory Listing</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage institutional profiles, search indexes, or update cohort levels.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          id="btn-add-student"
          className="flex items-center justify-center gap-2 bg-blue-650 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Student Record
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between" id="students-filter-toolbar">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, Name, Roll No, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="student-search-input"
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 hover:border-gray-300 transition"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Cohort Level</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            id="student-class-filter"
            className="bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Semesters</option>
            {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Students Listing Table Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden" id="students-table-section">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-2">
              <RefreshCcw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs text-slate-550 dark:text-slate-400">Querying database rows...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
              <GraduationCap className="w-12 h-12 text-slate-300" />
              <span>No matching student records found. Add entry to populate roster.</span>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-slate-800 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/40 dark:bg-slate-950/20">
                  <th className="py-3.5 px-6">System ID</th>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Roll Rank</th>
                  <th className="py-3.5 px-6">Class/Sec</th>
                  <th className="py-3.5 px-6">Contact Channels</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr 
                    key={student.student_id} 
                    className="border-b border-slate-50 dark:border-slate-850/40 text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                    id={`student-row-${student.student_id}`}
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-blue-650 dark:text-blue-400 select-all">
                      {student.student_id}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-850 dark:text-slate-200">
                      {student.name}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono text-xs font-medium">
                      #{student.roll_number}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/20 border border-blue-100/30 text-blue-850 dark:text-blue-300 font-medium text-xs">
                        {student.class} - Sec {student.section}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[140px]" title={student.email}>{student.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-450">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{student.contact}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-2 rounded bg-slate-50 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-950/30 dark:text-slate-450 dark:hover:text-blue-400 transition"
                          id={`btn-edit-${student.student_id}`}
                          title="Edit Student Record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.student_id, student.name)}
                          className="p-2 rounded bg-slate-50 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/30 dark:text-slate-450 dark:hover:text-rose-450 transition"
                          id={`btn-delete-${student.student_id}`}
                          title="Delete Student Permanent"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pop-up modal Form for CRUD (Add / Edit) with background blur */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="student-modal">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-500/10 text-blue-600 p-2 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {modalMode === 'add' ? 'Register New Student Profile' : 'Update Student Records'}
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Active Administration Ledger</span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-450 hover:text-slate-700 dark:hover:text-slate-300 transition"
                id="btn-close-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-750 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 rounded-lg text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* ID input */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Student ID *</label>
                  <input
                    type="text"
                    disabled={modalMode === 'edit'}
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value.toUpperCase() })}
                    placeholder="e.g. STU123"
                    className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                </div>

                {/* Roll number */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Roll Number *</label>
                  <input
                    type="text"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    placeholder="e.g. 101"
                    className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Full name */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Cohort class */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Cohort Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Class division section */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Division Section *</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Institutional Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@eduportal.ac.in"
                  className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Direct Contact */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Mobile Contact No *</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 dark:bg-slate-950 dark:text-white border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 dark:hover:text-slate-350 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-modal-submit"
                  className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 rounded-lg transition"
                >
                  {modalMode === 'add' ? 'Register Student' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
