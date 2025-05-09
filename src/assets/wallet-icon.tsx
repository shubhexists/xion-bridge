import { SVGProps } from 'react'

export const WalletIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      role="img"
      aria-label="Wallet"
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="27"
      viewBox="0 0 30 27"
      fill="none"
      {...props}
    >
      <path
        d="M27 5.83333V2.91667C27 1.30812 25.6545 0 24 0H4.5C2.019 0 0 1.96292 0 4.375V21.875C0 25.0848 2.691 26.25 4.5 26.25H27C28.6545 26.25 30 24.9419 30 23.3333V8.75C30 7.14146 28.6545 5.83333 27 5.83333ZM24 18.9583H21V13.125H24V18.9583ZM4.5 5.83333C4.11378 5.81654 3.74911 5.65555 3.48191 5.3839C3.21472 5.11225 3.0656 4.75087 3.0656 4.375C3.0656 3.99913 3.21472 3.63775 3.48191 3.3661C3.74911 3.09445 4.11378 2.93346 4.5 2.91667H24V5.83333H4.5Z"
        fill="inherit"
      />
    </svg>
  )
}
