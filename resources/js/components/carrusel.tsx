import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductImageCarouselProps {
  images: string[] | null;
  productName: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images, productName }) => {
  // Añadir estilos para las flechas negras
  useEffect(() => {
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
    .swiper-pagination-bullet-active{
        opacity: var(--swiper-pagination-bullet-opacity, 1);
        background: var(--swiper-pagination-color, #008fff);
    }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  try {
    // Intentar parsear si es una cadena JSON
    const imageArray = typeof images === 'string' 
      ? JSON.parse(images) 
      : images;
    
    if (Array.isArray(imageArray) && imageArray.length > 0) {
      return (
        <div style={{ width: '160px', height: '160px', marginBottom: '16px' }}>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            loop={true}
            className="h-full rounded-md"
          >
            {imageArray.map((image, index) => (
              <SwiperSlide key={index}>
                <div style={{ 
                  width: '160px', 
                  height: '160px', 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img 
                    src={`/storage/${image}`}
                    alt={`${productName} - imagen ${index + 1}`}
                    style={{ 
                      width: '160px', 
                      height: '160px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      console.error("Error loading image:", e);
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://via.placeholder.com/160x160?text=No+Image";
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      );
    } else {
      return (
        <div className="w-40 h-40 bg-gray-600 flex items-center justify-center rounded-md mb-4"
            style={{ width: '160px', height: '160px' }}>
            <span className="text-gray-300">Sin imagen</span>
        </div>
      );
    }
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    return (
      <div className="w-40 h-40 bg-gray-600 flex items-center justify-center rounded-md mb-4"
          style={{ width: '160px', height: '160px' }}>
          <span className="text-gray-300">Error</span>
      </div>
    );
  }
};

export default ProductImageCarousel;