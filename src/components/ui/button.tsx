import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { buttonClass, type ButtonVariant } from './button-class'

export function Button({
  variant,
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />
}

export function ButtonLink({
  variant,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant }) {
  return <a className={buttonClass(variant, className)} {...props} />
}
