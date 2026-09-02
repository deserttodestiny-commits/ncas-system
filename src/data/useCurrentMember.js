import { useAuth } from '../context/AuthContext'
import { useCollection } from './useCollection'

export function useCurrentMember() {
  const { session } = useAuth()
  const { items: members, updateItem } = useCollection('members')
  const member = members.find((m) => m.membershipId === session?.membershipId) || null
  return { member, members, updateItem }
}
