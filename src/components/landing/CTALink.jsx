import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CTALink({ to, children, size = 'md', variant = 'solid', withArrow = true, className = '' }) {
  const base = 'inline-flex items-center gap-2 rounded-sm font-medium transition-colors';
  const sizes = {
    md: 'h-10 px-5 text-[14px]',
    lg: 'h-12 px-7 text-[15px]',
  };
  const variants = {
    solid: 'bg-xg-terracotta text-white hover:bg-xg-terracotta-dark',
    outline: 'border border-xg-teal text-xg-teal hover:border-xg-teal-dark hover:text-xg-teal-dark',
    ghost: 'text-ink-soft hover:text-ink',
  };

  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  const arrow = withArrow && variant !== 'ghost' ? <ArrowRight className="h-4 w-4" /> : null;

  if (to.startsWith('http')) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}{arrow}
      </a>
    );
  }

  return (
    <Link to={to} className={cls}>
      {children}{arrow}
    </Link>
  );
}
