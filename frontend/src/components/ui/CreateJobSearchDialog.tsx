import React, { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { DjangoTask } from '../../api/taskApi'

interface CreateJobSearchDialogProps {
  visible: boolean
  onHide: () => void
  onSave: (jobSearchData: JobSearchFormData) => Promise<void>
  mode?: 'create' | 'edit'
  editData?: DjangoTask | null
}

export interface JobSearchFormData {
  id?: number
  title: string
}

const CreateJobSearchDialog: React.FC<CreateJobSearchDialogProps> = ({
  visible,
  onHide,
  onSave,
  mode = 'create',
  editData = null
}) => {
  const [formData, setFormData] = useState<JobSearchFormData>({
    title: ''
  })
  
  const [loading, setLoading] = useState(false)

  // Reset or populate form when dialog opens
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && editData) {
        setFormData({
          id: editData.id,
          title: editData.title
        })
      } else {
        setFormData({
          title: ''
        })
      }
    }
  }, [visible, mode, editData])

  const handleSave = async () => {
    try {
      setLoading(true)
      await onSave(formData)
      onHide()
    } catch (error) {
      console.error('Error saving job search:', error)
    } finally {
      setLoading(false)
    }
  }

  const headerContent = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
        {mode === 'edit' ? 'Edit Job Search' : 'Create Job Search'}
      </h2>
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={headerContent}
      style={{ width: '500px', maxWidth: '90vw' }}
      modal
      draggable={false}
      resizable={false}
      dismissableMask={false}
      className="edit-task-dialog"
    >
      <div className="edit-task-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="jobsearch-title" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Title
          </label>
          <InputText
            id="jobsearch-title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full"
            placeholder="Enter job search title"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button
            label="Cancel"
            onClick={onHide}
            className="p-button-text"
            disabled={loading}
          />
          <Button
            label="Save"
            onClick={handleSave}
            loading={loading}
            disabled={!formData.title.trim()}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default CreateJobSearchDialog

