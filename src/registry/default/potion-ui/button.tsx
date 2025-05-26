'use client';

import type { ComponentProps } from 'react';
import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cn, withProps } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';
import Link from 'next/link';

import { Spinner } from './spinner';
import { withTooltip } from './tooltip';

export const buttonVariants = cva(
  'focus-ring ring-offset-background inline-flex w-fit cursor-pointer select-none items-center justify-center gap-2 rounded-md text-sm transition-bg-ease disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    defaultVariants: {
      size: 'default',
      truncate: true,
      variant: 'default',
    },
    variants: {
      active: {
        false: '',
        true: 'border-primary border-2',
      },
      disabled: {
        true: 'pointer-events-none opacity-50',
      },
      focused: {
        true: 'ring-ring ring-2 ring-offset-2',
      },
      isMenu: {
        true: 'h-auto w-full cursor-pointer justify-start',
      },
      size: {
        blockAction: 'size-[26px] gap-1 px-1.5 text-xs',
        default: 'h-[28px] gap-1.5 px-2',
        icon: 'size-[28px] w-[33px] [&_svg]:size-5',
        iconSm: 'size-[28px]',
        lg: 'h-11 px-4 text-lg',
        md: 'h-8 px-3',
        menuAction: 'size-6',
        navAction: 'size-5',
        none: '',
        xs: 'h-[26px] px-1.5 py-1 text-xs',
      },
      truncate: {
        true: 'truncate whitespace-nowrap',
      },
      variant: {
        blockAction:
          'hover:bg-primary/[.06] [&_svg]:text-muted-foreground rounded-sm',
        blockActionSecondary:
          'bg-primary/[.06] [&_svg]:text-muted-foreground rounded-sm',
        brand:
          'bg-brand hover:bg-brand/80 active:bg-brand-active font-medium text-white',
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 [&_svg]:text-primary-foreground font-medium',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 [&_svg]:text-destructive-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        ghost2: 'text-muted-foreground hover:bg-accent',
        ghost3: 'text-muted-foreground/80 hover:bg-accent',
        ghostActive: 'bg-accent hover:bg-accent hover:text-accent-foreground',
        menuAction: 'text-muted-foreground/80 hover:bg-primary/[.06]',
        nav: 'text-muted-foreground hover:bg-primary/[.04] rounded-sm transition',
        navAction:
          'text-muted-foreground/80 hover:bg-primary/[.06] rounded-sm opacity-0 transition group-hover:opacity-100',
        none: '',
        outline:
          'border-input bg-background hover:bg-accent hover:text-accent-foreground border',
        primaryOutline:
          'border-primary-foreground text-primary-foreground hover:bg-accent/15 [&_svg]:text-primary-foreground border',
        radio: 'border-input hover:border-primary border-2',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
    },
  }
);

export type ButtonExtendedProps = {
  active?: boolean;
  asChild?: boolean;
  icon?: React.ReactNode;
  iconPlacement?: 'left' | 'right';
  isPending?: boolean;
  loading?: boolean;
  loadingClassName?: string;
  onToggleClick?: () => void;
} & {
  children?: React.ReactNode;
  label?: string;
} & VariantProps<typeof buttonVariants>;

export type ButtonProps = ComponentProps<typeof Button>;

const ButtonComp = React.forwardRef<
  HTMLButtonElement,
  ButtonExtendedProps & React.ComponentProps<'button'>
>(function ButtonComp(
  {
    active,
    asChild = false,
    children,
    className,
    focused,
    icon,
    iconPlacement = 'left',
    isMenu,
    isPending,
    label,
    loading,
    loadingClassName,
    size,
    truncate,
    variant,
    onToggleClick,
    ...props
  },
  forwardedRef
) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      // If asChild === true, <Slot> doesn’t forward refs by default,
      // so we typically omit the ref in that case to avoid new warnings:
      ref={!asChild ? forwardedRef : undefined}
      className={cn(
        buttonVariants({
          disabled: props.disabled,
          focused,
          isMenu,
          size,
          truncate,
          variant,
        }),
        active && 'border-2 border-primary',
        className
      )}
      aria-label={label && label.length > 0 ? label : undefined}
      type={Comp === 'button' ? 'button' : undefined}
      {...props}
    >
      {icon && iconPlacement === 'left' && icon}

      {loading && <Spinner className={loadingClassName} />}

      {children}

      {icon && iconPlacement === 'right' && icon}
    </Comp>
  );
});

export const Button = withTooltip(ButtonComp);

export type LinkButtonProps = ComponentProps<typeof LinkButton>;

export const LinkButton = withTooltip(
  withProps(
    function LinkButton({
      active,
      children,
      className,
      focused,
      icon,
      iconPlacement = 'left',
      isMenu,
      label,
      loading,
      loadingClassName,
      size,
      truncate,
      variant,
      ...props
    }: ButtonExtendedProps & React.ComponentProps<typeof Link>) {
      return (
        <Link
          className={cn(
            buttonVariants({
              disabled: props.disabled,
              focused,
              isMenu,
              size,
              truncate,
              variant,
            }),
            active && 'border-2 border-primary',
            className
          )}
          aria-label={label && label.length > 0 ? label : undefined}
          prefetch={false}
          role="button"
          {...props}
        >
          {icon && iconPlacement === 'left' && (
            <div className="shrink-0">{icon}</div>
          )}

          {loading && <Spinner className={loadingClassName} />}

          {children}

          {icon && iconPlacement === 'right' && icon}
        </Link>
      );
    },
    {
      variant: 'ghost',
    }
  )
);
