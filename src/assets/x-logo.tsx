import { SVGProps } from 'react'

export const XLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      role="img"
      aria-label="X"
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g opacity="0.4">
        <path
          d="M18.8263 1.9043H22.1998L14.8297 10.3278L23.5 21.7903H16.7112L11.394 14.8383L5.30995 21.7903H1.93443L9.81743 12.7804L1.5 1.9043H8.46111L13.2674 8.25863L18.8263 1.9043ZM17.6423 19.7711H19.5116L7.44539 3.81743H5.43946L17.6423 19.7711Z"
          fill="white"
        />
      </g>
    </svg>
  )
}
