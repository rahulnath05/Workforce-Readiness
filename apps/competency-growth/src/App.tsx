import { RouterProvider } from "react-router-dom"

import { router } from "@/app/router"
import { WorkspaceProvider } from "@/app/WorkspaceProvider"

export default function App() {
  return (
    <WorkspaceProvider>
      <RouterProvider router={router} />
    </WorkspaceProvider>
  )
}
