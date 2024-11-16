type Props = {
  show: boolean
  children: React.ReactNode
}
const Show: React.FC<Props> = ({ show, children }) => {
  return show ? children : null
}
export default Show
