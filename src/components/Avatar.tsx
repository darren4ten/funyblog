'use client'

interface AvatarProps {
  name: string
  size?: number
}

export default function Avatar({ name, size = 32 }: AvatarProps) {
  // 从名字生成背景色
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.floor(Math.abs(Math.sin(hash) * 16777215));
    return '#' + color.toString(16).padStart(6, '0');
  }

  // 获取名字的首字母
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  const bgColor = stringToColor(name);
  const initials = getInitials(name);

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-medium"
      style={{
        backgroundColor: bgColor,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  )
} 