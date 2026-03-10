import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive bg-destructive/10",
        success:
          "border-green-500/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10",
        warning:
          "border-yellow-500/50 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      ref={ref}
      role="alert"
      {...props}
    />
  ),
)
Alert.displayName = "Alert"

type AlertTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      data-slot="alert-title"
      ref={ref}
      {...props}
    />
  ),
)
AlertTitle.displayName = "AlertTitle"

type AlertDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => (
  <div
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    data-slot="alert-description"
    ref={ref}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
