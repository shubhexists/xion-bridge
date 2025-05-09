import { cn } from '~/_lib/utils.ts'
import { XionLogo } from '../../../assets/xion-logo.tsx'

type PoweredByProps = {
  className?: string
}

export const PoweredBy = ({ className = '' }: PoweredByProps) => {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="text-[--gray-500] text-xs">Powered by</div>
      <a href="https://x.com/AbstractSDK" target="_blank" rel="noopener noreferrer">
        <span className="flex font-bold items-end">
          <span className="text-2xl text-[--beige]">Abstra</span>
          <XionLogo className="w-16 h-9 text-[--beige]" />
        </span>
      </a>
    </div>
  )
}
