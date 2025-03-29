import { useEffect, useState } from 'react'

const OverdriveEffect = () => {
  const [animationClass, setAnimationClass] = useState('')
  
  useEffect(() => {
    setAnimationClass('animate-fade-in')
    
    const timer = setTimeout(() => {
      setAnimationClass('animate-fade-out')
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center ${animationClass} bg-red-900/30`}>
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-600 to-red-900 shadow-[0_0_30px_rgba(220,38,38,0.7)] animate-pulse-fast">
          <div className="absolute inset-0 flex items-center justify-center text-5xl">
            ⚡
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-red-500">
          OVERDRIVE ACTIVATED!
        </h2>
        
        <p className="mt-2 text-white">
          Cards cost 1 less, but you take more damage!
        </p>
      </div>
    </div>
  )
}

export default OverdriveEffect 