interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-semibold transition-colors'
  const variantStyles = variant === 'primary' 
    ? 'bg-gray-900 text-white hover:bg-gray-800'
    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${className}`} 
      {...props}
    >
      {children}
    </button>
  )
}