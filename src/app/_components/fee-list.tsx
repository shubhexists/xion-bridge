import { RouteResponse } from '@skip-go/client'
import GenericLogo from 'cryptocurrency-icons/svg/color/generic.svg'
import { adjustDecimals } from '~/_lib/utils.ts'

const FeeList: React.FC<{ fees: RouteResponse['estimatedFees'] }> = ({ fees }) => (
  <div className="bg-card w-full p-5 flex flex-col gap-3 items-start justify-center rounded-2">
    {fees.map((fee) => (
      <div key={fee.originAsset.denom} className="flex justify-between w-full">
        <div className={'flex gap-2 items-center'}>
          <img
            src={fee.originAsset.logoURI || GenericLogo}
            alt={fee.originAsset.denom}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-[#9B9B9B]">
            {fee.originAsset.symbol} ({fee.feeType})
          </span>
        </div>
        <span className="text-sm flex items-center">
          {adjustDecimals(fee.amount, fee.originAsset.decimals ?? 18, 6)} {fee.originAsset.symbol}
          {fee.usdAmount && (
            <span className="text-[#9B9B9B] ml-2">(${adjustDecimals(fee.usdAmount, 0, 2)})</span>
          )}
        </span>
      </div>
    ))}
  </div>
)

export default FeeList
