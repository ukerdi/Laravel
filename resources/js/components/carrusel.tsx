import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductImageCarouselProps {
  images: string[] | string | null;
  productName: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images, productName }) => {
  const [imageArray, setImageArray] = useState<string[]>([]);

  useEffect(() => {
    // Añadir estilos para las flechas negras
    const style = document.createElement('style');
    style.innerHTML = `
      .swiper-button-next, .swiper-button-prev {
        color: black !important;
        background-color: rgba(255, 255, 255, 0.7);
        width: 30px !important;
        height: 30px !important;
        border-radius: 50%;
      }
      .swiper-button-next:after, .swiper-button-prev:after {
        font-size: 15px !important;
        font-weight: bold;
      }
      .swiper-pagination-bullet-active {
        opacity: var(--swiper-pagination-bullet-opacity, 1);
        background: var(--swiper-pagination-color, #008fff);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Procesar las imágenes cuando cambia el prop
  useEffect(() => {
    if (!images) {
      setImageArray([]);
      return;
    }

    // Si es un string, intentar parsearlo como JSON
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) {
          setImageArray(parsed);
        } else {
          // Si no es un array después de parsear, lo tratamos como una sola imagen
          setImageArray([images]);
        }
      } catch (e) {
        // Si no se puede parsear como JSON, asumimos que es una ruta de imagen directa
        setImageArray([images]);
      }
    } else if (Array.isArray(images)) {
      // Si ya es un array, lo usamos directamente
      setImageArray(images);
    }
  }, [images]);

  // Función para construir la URL correcta de la imagen
  const getImageUrl = (image: string): string => {
    // Si la imagen empieza con http o https o data:, ya es una URL completa
    if (image.startsWith('http') || image.startsWith('https') || image.startsWith('data:')) {
      return image;
    }
    
    // Si la imagen ya incluye /storage/, no lo añadimos de nuevo
    if (image.startsWith('/storage/')) {
      return image;
    }
    
    // Por defecto, añadimos el prefijo /storage/
    return `/storage/${image}`;
  };

  // Si no hay imágenes
  if (imageArray.length === 0) {
    return (
      <div className="w-40 h-40 bg-gray-600 flex items-center justify-center rounded-md mb-4">
        <span className="text-gray-300">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className="w-40 h-40 mb-4">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        loop={imageArray.length > 1}
        className="h-full rounded-md"
      >
        {imageArray.map((image, index) => {
          const imageUrl = getImageUrl(image);
          
          return (
            <SwiperSlide key={index}>
              <div className="w-40 h-40 flex justify-center items-center">
                <img 
                  src={imageUrl}
                  alt={`${productName} - imagen ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    console.error(`Error cargando imagen: ${imageUrl}`);
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://via.placeholder.com/160x160?text=No+Image";
                  }}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default ProductImageCarousel;