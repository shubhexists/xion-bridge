import { SVGProps } from 'react'
const BaseMainnetIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    fill="none"
    viewBox="0 0 32 32"
    aria-label="base"
    role="img"
    {...props}
  >
    <path
      fill="#0052FF"
      d="M16 32c8.837 0 16-7.163 16-16S24.837 0 16 0C7.56 0 .683 6.44 0 14.634h21.152v2.687H0C.683 25.515 7.56 32 16 32Z"
    />
  </svg>
)
export default BaseMainnetIcon
