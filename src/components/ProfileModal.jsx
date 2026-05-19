import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { initials, avatarColor } from '../data'

export default function ProfileModal({
  player,
  isOwn,
  bio,      // override bio from app state (own profile edits)
  pic,      // uploaded profile pic (base64)
  onSaveBio,
  onSavePic,
  onClose,
}) {
  const [editBio, setEditBio] = useState(bio ?? player.bio ?? '')
  const [preview, setPreview] = useState(pic ?? null)
  const [editing, setEditing]  = useState(false)
  const fileRef = useRef(null)

  const displayBio = editing ? editBio : (bio ?? player.bio ?? '')
  const hasBio = displayBio.trim().length > 0

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target.result)
      onSavePic?.(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    onSaveBio?.(editBio)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditBio(bio ?? player.bio ?? '')
    setEditing(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal profile-modal" onClick={e => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose}><X size={18} /></button>

        {/* Avatar + name */}
        <div className="profile-hdr">
          <div className="profile-pic-wrap">
            {preview
              ? <img src={preview} alt="Profile" className="profile-pic-img" />
              : (
                <div className="profile-av-lg" style={{ background: avatarColor(player.id) }}>
                  {initials(player.name)}
                </div>
              )
            }
            {isOwn && (
              <>
                <button
                  className="profile-cam-btn"
                  onClick={() => fileRef.current.click()}
                  title="Upload photo"
                >
                  <Camera size={13} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>

          <div className="profile-name-block">
            <h2>{player.name}{isOwn ? ' (you)' : ''}</h2>
            <div className="profile-sub">
              <span className="pos-badge">{player.position}</span>
              <span>{player.neighborhood}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <strong>{player.rating}</strong>
            <span>Rating</span>
          </div>
          <div className="profile-stat">
            <strong>{player.goals}</strong>
            <span>Goals</span>
          </div>
          <div className="profile-stat">
            <strong>{player.assists}</strong>
            <span>Assists</span>
          </div>
          <div className="profile-stat">
            <strong>{player.gamesPlayed}</strong>
            <span>Games</span>
          </div>
          {player.position === 'GK' && (
            <div className="profile-stat">
              <strong>{player.cleanSheets}</strong>
              <span>Clean Sheets</span>
            </div>
          )}
        </div>

        {/* Bio section */}
        <div className="profile-bio-section">
          {isOwn ? (
            editing ? (
              <>
                <textarea
                  className="profile-textarea"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Write something about yourself…"
                  maxLength={280}
                  autoFocus
                  rows={4}
                />
                <div className="profile-bio-actions">
                  <button className="btn btn-ghost btn-sm" onClick={handleCancel}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
                </div>
              </>
            ) : (
              <>
                {hasBio && <p className="profile-bio-text">{displayBio}</p>}
                <button
                  className="profile-bio-edit-btn"
                  onClick={() => setEditing(true)}
                >
                  {hasBio ? 'Edit bio' : '+ Add bio'}
                </button>
              </>
            )
          ) : (
            hasBio && <p className="profile-bio-text">{displayBio}</p>
          )}
        </div>

      </div>
    </div>
  )
}
