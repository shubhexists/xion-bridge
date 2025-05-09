import { PoweredBy } from './powered-by.tsx'
import { SocialMedia } from './social-media.tsx'

export const Footer: React.FC = () => {
  return (
    <div className="flex justify-between items-center w-full px-4 py-2 md:px-6">
      <SocialMedia />
      <PoweredBy />
    </div>
  )
}
