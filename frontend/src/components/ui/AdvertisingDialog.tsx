import React, { useState, useRef } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload'

interface AdvertisingDialogProps {
  visible: boolean
  onHide: () => void
  onSave: (data: AdvertisingFormData) => Promise<void>
}

export interface AdvertisingFormData {
  title: string
  description: string
  photos?: File[]
}

const AdvertisingDialog: React.FC<AdvertisingDialogProps> = ({ visible, onHide, onSave }) => {
  const [formData, setFormData] = useState<Partial<AdvertisingFormData>>({
    title: '',
    description: ''
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const fileUploadRef = useRef<FileUpload>(null)

  const handleInputChange = (field: keyof AdvertisingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (event: FileUploadHandlerEvent) => {
    const files = event.files as File[]
    setPhotos(files)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Validate required fields
      if (!formData.title || !formData.description) {
        alert('Please fill in all required fields')
        return
      }

      const dataToSave: AdvertisingFormData = {
        title: formData.title,
        description: formData.description,
        photos: photos.length > 0 ? photos : undefined
      }

      await onSave(dataToSave)
      
      // Reset form
      setFormData({
        title: '',
        description: ''
      })
      setPhotos([])
      if (fileUploadRef.current) {
        fileUploadRef.current.clear()
      }
      onHide()
    } catch (error) {
      console.error('Error saving advertising:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDialogHide = () => {
    // Reset form on close
    setFormData({
      title: '',
      description: ''
    })
    setPhotos([])
    if (fileUploadRef.current) {
      fileUploadRef.current.clear()
    }
    onHide()
  }

  const dialogFooter = (
    <div className="form-actions">
      <Button 
        label="Save" 
        onClick={handleSubmit} 
        loading={loading}
        className="btn btn-secondary save-btn"
      />
    </div>
  )

  const headerTemplate = (
    <div className="modal-header-actions">
      <h2>Create Announcement</h2>
    </div>
  )

  return (
    <Dialog
      header={headerTemplate}
      visible={visible}
      onHide={handleDialogHide}
      footer={dialogFooter}
      style={{ width: '600px' }}
      modal
      dismissableMask={false}
    >
      <div className="modal-form">
        <form className="project-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          
          <div className="form-group">
            <label htmlFor="advertising-title">Title *</label>
            <InputText
              id="advertising-title"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="advertising-description">Description *</label>
            <InputTextarea
              id="advertising-description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="advertising-photos">Photos</label>
            <FileUpload
              ref={fileUploadRef}
              name="photos"
              multiple
              accept="image/*"
              customUpload
              uploadHandler={handleFileSelect}
              auto={false}
              chooseLabel="Select Photos"
              uploadLabel="Upload"
              cancelLabel="Clear"
              emptyTemplate={
                <div className="drop-zone" style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  border: '2px dashed #ccc',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <p style={{ margin: 0, color: '#666' }}>
                    Drop files here or click to upload
                  </p>
                </div>
              }
            />
          </div>

        </form>
      </div>
    </Dialog>
  )
}

export default AdvertisingDialog

