'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'
import { motion } from 'framer-motion'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm shadow-black/[0.04] hover:bg-primary/90',
        outline:
          'border border-input bg-background shadow-sm shadow-black/[0.04] hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm shadow-black/[0.04] hover:bg-secondary/80',
        tertiary: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        error: 'bg-[#d93036] hover:bg-[#ff6166]',
        warning: 'bg-[#ff990a] text-primary-foreground hover:bg-[#d27504]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        small: 'h-8 rounded-lg px-3 text-xs',
        large: 'h-10 rounded-lg px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'prefix' | 'suffix'
    >,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  disabled?: boolean
  loading?: boolean
}

/**
 * A customizable button component with different variants and sizes.
 *
 * @param {string} className - Additional class names for the button.
 * @param {"default" | "secondary" | "tertiary" | "error" | "warning"} variant - Button style variant.
 * @param {"default" | "small" | "large" | "icon"} size - Button size variant.
 * @param {boolean} asChild - Render as child component.
 * @param {React.ReactNode} prefix - Element to render before the button text.
 * @param {React.ReactNode} suffix - Element to render after the button text.
 * @param {boolean} disabled - Disable the button.
 * @param {boolean} loading - Show loading spinner inside the button.
 * @param {React.Ref<HTMLButtonElement>} ref - Forwarded ref.
 *
 * @example
 * ```tsx
 * <Button variant="secondary" size="large" prefix={<ArrowLeftIcon />} suffix={<ArrowRightIcon />}>
 *   Click Me
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      prefix,
      suffix,
      disabled = false,
      loading = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    const buttonContent = (
      <Comp
        className={cn(
          buttonVariants({
            variant: loading ? 'secondary' : variant,
            size,
          }),
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {loading ? <Spinner className="mr-2" /> : null}
        {prefix ? (
          <span className="mr-2 flex items-center justify-center">
            {prefix}
          </span>
        ) : null}
        {props.children}
        {suffix ? (
          <span className="ml-2 flex items-center justify-center">
            {suffix}
          </span>
        ) : null}
      </Comp>
    )

    return (
      <div className={cn(className, disabled && 'cursor-not-allowed ')}>
        <motion.div whileTap={{ scale: 0.93 }}>{buttonContent}</motion.div>
      </div>
    )
  }
)

Button.displayName = 'Button'
