import { Spinner } from './ui/spinner'

type Props = {
  show: boolean
  children: React.ReactNode
}

/**
 * A component that conditionally renders its children based on the `show` prop.
 *
 * @param {Props} props - The component properties.
 * @param {boolean} props.show - Whether to show the children.
 * @param {ReactNode} props.children - The child elements to render.
 * @returns {React.ReactNode} - The rendered component.
 */
const Show: React.FC<Props> = ({ show, children }: Props): React.ReactNode => {
  return show ? (
    children
  ) : (
    <div className='w-full h-full flex items-center justify-center'>
      <Spinner />
    </div>
  )
}
export default Show
