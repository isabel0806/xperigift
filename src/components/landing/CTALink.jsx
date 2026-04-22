import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CTALink({ to, children, size = 'md', variant = 'solid', withArrow = true, className = '' }) {
  const base = 'inline-flex items-center gap-2 rounded-sm font-medium transition-colors';
  const sizes = {
    md: 'h-10 px-5 text-[14px]',
    lg: 'h-12 px-7 text-[15px]',
  };
  const variants = {
    solid: 'bg-ink text-paper hover:bg-ink-soft',
    outline: 'border border-hairline-strong text-ink hover:border-ink',
    ghost: 'text-ink-soft hover:text-ink',
  };

  return (
    <Link to={to} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
      {withArrow && variant !== 'ghost' && <ArrowRight className="h-4 w-4" />}
    </Link>
  );
}
