import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Cplusplus = () => {
  const heading = "C++";

  const [showVideo, setShowVideo] = useState(false);

  const handleWatchVideoClick = () => {
    setShowVideo(true);
  };

  return (
    <>
      <div>
        <h1 className='text-4xl font-bold text-center my-10'>{heading}</h1>

        <div className="lg:grid lg:grid-cols-4 gap-8 p-10 flex flex-col lg:flex-row max-h-2/3">

          {/* Sidebar */}
          <div className="bg-[#ebe7de5b] lg:col-span-1 w-full mx-auto rounded-md border shadow-lg p-4">
            <div className='w-full mx-auto'>
              <div className='flex flex-col md:space-y-12 space-y-8 mt-2'>
                <Link to="readContent" className="text-xl text-center">
                  ReadContent
                </Link>

                <Link to="readContent" className="text-xl text-center">
                  ReadContent
                </Link>
                <button
                  onClick={handleWatchVideoClick}
                  className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                >
                  Watch Video
                </button>
              </div>
            </div>
          </div>

          {/* Content  */}
          <div className="bg-[#ebe7de5b] lg:col-span-3 w-full mx-auto rounded-md border shadow-lg p-4">
            <div className='grid grid-cols-3 gap-4'>
              {showVideo && (
                <iframe 
                  className="col-span-3 w-full h-96 mx-auto"
                  src="https://www.youtube.com/embed/s0g4ty29Xgg?si=NAvNdgDyFJQFqSsG" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Cplusplus;
