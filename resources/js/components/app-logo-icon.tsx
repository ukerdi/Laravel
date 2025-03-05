import { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AppLogoIconProps extends ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  withContainer?: boolean;
}

export default function AppLogoIcon({
  className,
  containerClassName,
  withContainer = false,
  alt = "App Logo",
  ...props
}: AppLogoIconProps) {
  // La ruta correcta para imágenes en Laravel cuando están en el storage público
  const logoSrc = '/storage/images/logo.png';
  
  // Si se solicita con contenedor
  if (withContainer) {
    return (
      <div className={cn(
        "bg-indigo-600/20 rounded-full flex items-center justify-center",
        containerClassName
      )}>
        <img 
          src={logoSrc} 
          alt={alt} 
          className={cn("object-contain", className)} 
          {...props} 
        />
      </div>
    );
  }
  
  // Sin contenedor
  return (
    <img 
      src={logoSrc} 
      alt={alt} 
      className={className} 
      {...props} 
    />
  );
}