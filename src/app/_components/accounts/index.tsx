import { usePortfolioValue } from '../../_hooks/use-portfolio-value.ts'
import { UserAccount } from './user-account'
import { XionAccount } from './xion-account'

export const Accounts: React.FC = () => {
  const { totalValue } = usePortfolioValue()
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 py-3 md:py-4 px-4 md:px-6 pb-4 md:pb-6 border border-gray-800 rounded-lg w-full max-w-[920px]">
      <div className="w-full md:flex-1">
        <UserAccount connectedWalletNetWorth={totalValue} />
      </div>

      <div className="bg-card h-10 w-10 md:min-h-12 md:min-w-12 flex items-center justify-center rounded transform rotate-90 md:rotate-0 shrink-0">
        <svg
          role="img"
          aria-label="Switch Wallets"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          className="w-3 md:w-4 h-3 md:h-4"
        >
          <path
            d="M-3.34361e-07 4.00373C-2.83421e-07 3.39941 0.538629 2.90968 1.20329 2.90968L8.08568 2.90968L7.18518 2.00911C6.73474 1.55867 6.63584 0.774199 7.07106 0.338976C7.53672 -0.126769 8.30771 -0.0208015 8.7614 0.432929L11.6288 3.3004C12.17 3.84156 12.1067 4.31037 11.5218 4.89528L8.7202 7.6167C8.27299 8.06391 7.56146 8.0809 7.12371 7.64315C6.65234 7.17179 6.64261 6.54185 7.14398 6.04048L8.08568 5.09878L1.20329 5.09878C0.538628 5.09878 -3.85302e-07 4.60805 -3.34361e-07 4.00373Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="w-full md:flex-1">
        <XionAccount />
      </div>
    </div>
  )
}

export default Accounts
