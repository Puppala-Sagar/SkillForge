// import React, { useState } from 'react';

// const Carousel = () => {
//   const [currentSlide, setCurrentSlide] = useState(0);

//   const slides = [
//     { id: 1, title: 'Languages', value: 75 },
//     { id: 2, title: 'Frontend', value: 80 },
//     { id: 3, title: 'Backend', value: 70 },
//     { id: 4, title: 'Machine Learning', value: 60 },
//     { id: 5, title: 'Aptitude', value: 55 }
//   ];

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
//   };

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
//   };

//   return (
//     <div className="relative w-full max-w-lg mx-auto overflow-hidden">
//       <div
//         className="flex transition-transform duration-500"
//         style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//       >
//         {slides.map((slide, index) => (
//           <div key={index} className="min-w-full flex justify-center items-center p-4">
//             <div className="text-center">
//               <div
//                 className="radial-progress bg-[#e4e2e2] text-primary-content border-[#e4e2e2] border-4 mx-auto"
//                 style={{ "--value": slide.value }}
//                 role="progressbar"
//               >
//                 {slide.value}%
//               </div>
//               <p className="text-xl mt-4">{slide.title}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Left Arrow */}
//       <button
//         className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
//         onClick={prevSlide}
//       >
//         &#8249;
//       </button>

//       {/* Right Arrow */}
//       <button
//         className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
//         onClick={nextSlide}
//       >
//         &#8250;
//       </button>
//     </div>
//   );
// };

// export default Carousel;
import React, { useState } from 'react';

const Carousel = ({progress}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Function for the previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? progress.length - 1 : prev - 1));
  };

  // Function for the next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === progress.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full max-w-lg mx-auto overflow-hidden">
      <div
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {progress.map((item, index) => (
          <div key={index} className="min-w-full flex justify-center items-center p-4">
            <div className="text-center">
              <div
                className="radial-progress bg-[#e4e2e2] text-primary-content border-[#e4e2e2] border-4 mx-auto"
                style={{ "--value": item.value }}
                role="progressbar"
              >
                {item.value}%
              </div>
              <p className="text-xl mt-4">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
        onClick={prevSlide}
      >
        &#8249;
      </button>

      {/* Right Arrow */}
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
        onClick={nextSlide}
      >
        &#8250;
      </button>
    </div>
  );
};

export default Carousel;
