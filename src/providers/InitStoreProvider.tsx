import useInitStore from 'src/hooks/useInitStore'

interface InitStoreProps {
  children: React.ReactElement[]
}
export default function InitStoreProvider({ children }: InitStoreProps) {
  useInitStore()

  return <>{children}</>
}
