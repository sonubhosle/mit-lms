"use client"

import { useState } from 'react'
import MemberTable from '@/components/members/MemberTable'
import MemberModal from '@/components/members/MemberModal'
import { Plus, UserPlus } from 'lucide-react'
import { mutate } from 'swr'
import { useRouter } from 'next/navigation'

import { toast } from 'react-hot-toast'

export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const router = useRouter()

  const handleAdd = () => {
    setSelectedMember(null)
    setIsModalOpen(true)
  }

  const handleEdit = (member) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  const handleDelete = async (member) => {
    if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
      const loadingToast = toast.loading(`Deleting ${member.name}...`)
      try {
        const res = await fetch(`/api/members/${member._id}`, { method: 'DELETE' })
        if (res.ok) {
          mutate((key) => typeof key === 'string' && key.startsWith('/api/members'))
          toast.success("Member removed successfully!", { id: loadingToast })
        } else {
          toast.error("Failed to delete member.", { id: loadingToast })
        }
      } catch (err) {
        toast.error("A network error occurred.", { id: loadingToast })
      }
    }
  }

  const handleView = (member) => {
    router.push(`/members/${member._id}`)
  }

  const handleSave = () => {
    mutate((key) => typeof key === 'string' && key.startsWith('/api/members'))
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-in space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Member Directory</h1>
            <p className="text-slate-500 font-medium">Manage library memberships, subscriptions, and profiles</p>
          </div>
          <button onClick={handleAdd} className="cursor-pointer flex items-center gap-2 bg-linear-to-r from-violet-500 to-violet-700 text-white rounded-2xl px-5 py-3 hover:from-violet-700 hover:to-violet-500 transition ease-in duration-300 hover:shadow-2xl">
            <UserPlus size={20} />
            <span>Add New Member</span>
          </button>
        </div>

        <MemberTable onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
      </div>

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        onSave={handleSave}
      />
    </div>
  )
}
