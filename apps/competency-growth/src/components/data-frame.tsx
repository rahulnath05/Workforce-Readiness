import type { ReactNode } from "react"
import { TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type Preview = "ready" | "empty" | "loading" | "error"

export function DataFrame({
  preview,
  skeleton,
  emptyTitle,
  emptyBody,
  emptyAction,
  onEmptyAction,
  errorMessage,
  onRetry,
  children,
}: {
  preview: Preview
  skeleton: ReactNode
  emptyTitle: string
  emptyBody: string
  emptyAction: string
  onEmptyAction: () => void
  errorMessage: string
  onRetry: () => void
  children: ReactNode
}) {
  if (preview === "loading") {
    return <div className="flex flex-col gap-4 md:gap-6">{skeleton}</div>
  }

  if (preview === "error") {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>Couldn’t load this view</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
        <div className="col-start-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </Alert>
    )
  }

  if (preview === "empty") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{emptyTitle}</CardTitle>
          <CardDescription>{emptyBody}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={onEmptyAction}>
            {emptyAction}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return children
}
