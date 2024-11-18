'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons'

/**
 * Props for the Input component.
 */
export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'children' | 'prefix' | 'suffix'
  > {
  /**
   * Additional class names to apply to the outer container.
   */
  className?: string
  /**
   * Additional class names to apply to the input element.
   */
  iclassName?: string
  /**
   * Node or string to render as prefix inside the input container.
   */
  prefix?: React.ReactNode | string
  /**
   * Node or string to render as suffix inside the input container.
   */
  suffix?: React.ReactNode | string
  /**
   * Flag to apply styling to the prefix.
   */
  prefixStyling?: boolean
  /**
   * Label for the input element.
   */
  label?: string
  /**
   * Flag to apply styling to the suffix.
   */
  suffixStyling?: boolean
  /**
   * error - Error message to display below the input.
   */
  error?: string
}
/**
 * Input component with optional prefix and suffix.
 *
 * @param className - Additional class names for the container.
 * @param iclassName - Additional class names for the input element.
 * @param prefix - Element or string to render as prefix.
 * @param suffix - Element or string to render as suffix.
 * @param prefixStyling - Whether to apply styling to the prefix.
 * @param suffixStyling - Whether to apply styling to the suffix.
 * @param label - Label for the input element.
 * @param type - The type of the input element.
 * @param error - Error message to display below the input.
 * @param props - Other props to be applied to the input element.
 * @param ref - Ref to the input element.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      iclassName,
      prefix,
      suffix,
      prefixStyling = true,
      suffixStyling = true,
      label,
      type,
      error,
      ...props
    },
    ref
  ) => {
    /**
     * Refs for the prefix and suffix elements.
     */
    const prefixRef = React.useRef<HTMLDivElement>(null)
    const suffixRef = React.useRef<HTMLDivElement>(null)
    /**
     * State to store the width of the prefix and suffix elements.
     */
    const [prefixWidth, setPrefixWidth] = React.useState(0)
    const [suffixWidth, setSuffixWidth] = React.useState(0)
    // Update the width of the prefix and suffix elements when they change
    React.useEffect(() => {
      if (prefixRef.current) {
        setPrefixWidth(prefixRef.current.offsetWidth)
      }
      if (suffixRef.current) {
        setSuffixWidth(suffixRef.current.offsetWidth)
      }
    }, [prefix, suffix])

    return (
      <div className={cn('relative', className)}>
        {label && (
          <label
            className={`text-sm ${error ? 'text-[#ff6166]' : 'text-muted-foreground'} `}
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        {prefix && (
          <div
            ref={prefixRef}
            className={cn(
              'absolute top-0 left-0 h-full flex items-center justify-center pl-2 text-muted-foreground',
              `${prefixStyling ? 'rounded-l-md' : ''}`
            )}
          >
            {prefix}
            {prefixStyling && <div className="h-[94%] w-px ml-2 bg-border " />}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-shadow file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:border-primary/75 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50',
            iclassName,
            `${error ? 'outline-none ring-2 ring-[#ffe6e6] border-[#ff6166] dark:ring-[#561a1e] focus-visible:dark:ring-primary/35 dark:hover:ring-[#832126] hover:ring-[#f8b9b9]' : ''}`
          )}
          style={{
            paddingLeft: prefix ? `${prefixWidth + 12}px` : '0.75rem',
            paddingRight: suffix ? `${suffixWidth + 12}px` : '0.75rem',
          }}
          ref={ref}
          {...props}
        />
        {suffix && (
          <div
            ref={suffixRef}
            className={cn(
              'absolute top-0 right-0 h-full flex items-center justify-center pr-2 text-muted-foreground',
              `${suffixStyling ? 'rounded-r-md' : ''}`
            )}
          >
            {suffixStyling && (
              <div className="h-[94%] w-[1px] mr-2 bg-border " />
            )}
            {suffix}
          </div>
        )}
        {error && (
          <div
            className="flex items-center text-sm text-[#ff6166] mt-1"
            role="alert"
          >
            <svg
              data-testid="geist-icon"
              height="16"
              strokeLinejoin="round"
              viewBox="0 0 16 16"
              width="16"
              style={{ color: 'currentcolor' }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.30761 1.5L1.5 5.30761L1.5 10.6924L5.30761 14.5H10.6924L14.5 10.6924V5.30761L10.6924 1.5H5.30761ZM5.10051 0C4.83529 0 4.58094 0.105357 4.3934 0.292893L0.292893 4.3934C0.105357 4.58094 0 4.83529 0 5.10051V10.8995C0 11.1647 0.105357 11.4191 0.292894 11.6066L4.3934 15.7071C4.58094 15.8946 4.83529 16 5.10051 16H10.8995C11.1647 16 11.4191 15.8946 11.6066 15.7071L15.7071 11.6066C15.8946 11.4191 16 11.1647 16 10.8995V5.10051C16 4.83529 15.8946 4.58093 15.7071 4.3934L11.6066 0.292893C11.4191 0.105357 11.1647 0 10.8995 0H5.10051ZM8.75 3.75V4.5V8L8.75 8.75H7.25V8V4.5V3.75H8.75ZM8 12C8.55229 12 9 11.5523 9 11C9 10.4477 8.55229 10 8 10C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12Z"
                fill="currentColor"
              ></path>
            </svg>
            <label className="ml-1" htmlFor="error">
              {error}
            </label>
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

const HideApiKey = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'label' | 'error'>
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        iclassName="hide-password-toggle"
        className={className}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        className={
          'absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
        }
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={props.disabled}
      >
        <div className='flex'>
          <div className="bg-background w-4 h-4" />
          {showPassword ? (
            <EyeOpenIcon className="h-4 w-4 bg-background" aria-hidden="true" />
          ) : (
            <EyeClosedIcon
              className="h-4 w-4 bg-background"
              aria-hidden="true"
            />
          )}
        </div>
        <span className="sr-only">
          {showPassword ? 'Hide password' : 'Show password'}
        </span>
      </button>

      {/* hides browsers password toggles */}
      <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
    </div>
  )
})
HideApiKey.displayName = 'HideApiKey'

export { Input, HideApiKey }
