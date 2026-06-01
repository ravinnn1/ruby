import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Distraction content has been merged into Soft Games (/games)
export function Distraction() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/games', { replace: true }) }, [navigate])
  return null
}
