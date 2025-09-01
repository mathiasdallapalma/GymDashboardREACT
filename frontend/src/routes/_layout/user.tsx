import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/user')({
  component: () => <Outlet />, // This will render the child routes like /user/$userId
})