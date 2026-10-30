import { Fragment } from "react"
import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { Home } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

export function SettingsBreadcrumbs({
  segments: providedSegments,
  className,
  interactive = true,
}: {
  segments?: string[]
  className?: string
  interactive?: boolean
} = {}) {
  const { pathname } = useLocation()
  const segments = providedSegments ?? pathname.split("/").filter(Boolean)

  return (
    <Breadcrumb className={cn("mb-6", className)}>
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem>
          {interactive ? (
            <BreadcrumbLink asChild><Link to="/" aria-label="Home"><Home className="size-3.5" /></Link></BreadcrumbLink>
          ) : (
            <BreadcrumbLink aria-label="Home"><Home className="size-3.5" /></BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`
          const isLast = index === segments.length - 1
          const label = ({ account: "Account & Security", projects: "Project Settings", "api-keys": "Workspace API Keys" } as Record<string, string>)[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : !interactive ? (
                  <BreadcrumbLink>{label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
