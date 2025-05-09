import { cn } from '~/_lib/utils.ts'
import { DiscordLogo } from '../../../assets/discord-logo.tsx'
import { XLogo } from '../../../assets/x-logo.tsx'

type SocialMediaProps = {
  className?: string
}

export const SocialMedia = ({ className }: SocialMediaProps) => {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex gap-4 items-center">
        <div>
          <div className="flex items-center gap-4">
            <a href="https://x.com/AbstractSDK" target="_blank" rel="noopener noreferrer">
              <XLogo className="h-6" />
            </a>
            <a href="https://discord.com/invite/burnt" target="_blank" rel="noopener noreferrer">
              <DiscordLogo className="h-6" />
            </a>
          </div>
          <a href={'https://burnt.com'} target="_blank" rel="noopener noreferrer">
            <p className={'text-[--gray-500] text-xs'}>Disclaimer</p>
          </a>
        </div>
      </div>
    </div>
  )
}
