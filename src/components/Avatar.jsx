import { ROLES } from '../data/roles'

export default function Avatar({ player, size = 44, style = {}, className = '' }) {
  const role = ROLES[player?.roleIndex % ROLES.length] || ROLES[0]

  if (player?.photo) {
    return (
      <div
        className={className}
        style={{
          width: size, height: size, borderRadius: '50%',
          overflow: 'hidden', flexShrink: 0,
          display: 'inline-block',
          ...style,
        }}
      >
        <img
          src={player.photo}
          alt={player.name || ''}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF3CAC, #FF6B00)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.42), flexShrink: 0,
        ...style,
      }}
    >
      {role.e}
    </div>
  )
}
