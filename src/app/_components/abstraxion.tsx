import { Abstraxion, useModal } from '@burnt-labs/abstraxion'

export const AbtsraxionModalCloser = () => {
  const [, setShowModal] = useModal()

  return <Abstraxion onClose={() => setShowModal(false)} />
}
