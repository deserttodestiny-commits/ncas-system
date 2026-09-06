export default function Avatar({ src, sizePx = 96, className = '', borderClass = 'border-4 border-ncas-gold' }) {
  const style = { width: sizePx, height: sizePx, fontSize: sizePx * 0.5 }
  if (src) {
    return <img src={src} alt="" style={style} className={`rounded-full object-cover ${borderClass} ${className}`} />
  }
  return (
    <div style={style} className={`rounded-full bg-gray-200 ${borderClass} flex items-center justify-center text-gray-400 ${className}`}>
      👤
    </div>
  )
}
