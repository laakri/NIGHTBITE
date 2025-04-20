import { useEffect, useState } from 'react'

interface ErrorMessageProps {
  message: string
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [message])
  
  if (!isVisible) return null
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center px-4 py-3 bg-red-900/90 border border-red-700 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.3)]">
        <div className="mr-3 text-red-500">⚠️</div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  )
}

export default ErrorMessage 