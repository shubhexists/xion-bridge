import { SVGProps } from 'react'

export const EthMainnetIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      role="img"
      aria-label="Ethereum Mainnet Icon"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="none"
      viewBox="0 0 32 32"
      {...props}
    >
      <circle cx="16" cy="16" r="16" fill="#6680E3" />
      <path fill="#fff" d="m9 16.21 6.996 4.14V4.595z" />
      <path fill="#C2CCF4" d="M15.996 4.596v15.753L23 16.211z" opacity="0.8" />
      <path fill="#fff" d="m9 17.542 6.996 9.862v-5.732z" />
      <path fill="#C2CCF4" d="M15.996 21.672v5.732L23 17.542z" />
      <path fill="#8599E8" fillOpacity="0.47" d="M15.996 13.033 9 16.211l6.996 4.138L23 16.211z" />
    </svg>
  )
}
