import React from 'react'
import Carousel from "../components/Carousel.jsx";
import { Link } from 'react-router-dom';
import { ImFire } from 'react-icons/im';
import { useEffect,useState } from 'react';

const Backend = () => {
    const heading="Backend"
    const topics = [
        { path: "/python", label: "PYTHON" },
        { path: "/node-js", label: "NODE.JS" },
        { path: "/next-js", label: "NEXT.JS" }
      ];
    
      const progress = [
        { label: "PYTHON", value: 10 },
        { label: "NODE.JS", value: 100 },
        { label: "NEXT.JS", value: 70 }
      ];
    
      const badges = [
        { id: 1 ,count:5 },
        { id: 2 ,count:6 },
        { id: 3 ,count:7 }
      ];

      const [animatedProgress, setAnimatedProgress] = useState(
        progress.map(() => 0) 
      );
    
      useEffect(() => {
        
        const timeoutId = setTimeout(() => {
          setAnimatedProgress(progress.map(item => item.value));
        }, 500); 
    
        return () => clearTimeout(timeoutId); 
      }, [progress]);
    
    return (
        <div>
          <h1 className='text-4xl font-bold text-center my-10'>{heading}</h1>
          <div className="lg:grid lg:grid-cols-2 gap-4 p-10 flex flex-col max-h-2/3">
            <div className="bg-[#ebe7de5b] w-8/12 mx-auto rounded-md border shadow-lg p-2">
              <div className='grid grid-cols-2'>
                <div className='w-11/12 mx-auto'>
                  <p className='bg-[#e4e2e2] text-2xl text-center rounded-md my-2'>Topics</p>
                  <div className='flex flex-col md:space-y-12 space-y-8 mt-2'>
                    {topics.map((topic) => (
                      <Link 
                        key={topic.path}
                        to={topic.path} 
                        className='text-xl text-center'
                      >
                        {topic.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className='w-11/12 mx-auto'>
                  <p className='bg-[#e4e2e2] text-2xl text-center rounded-md my-2'>Badges</p>
                  <div className='flex flex-col md:space-y-12 space-y-8 mt-2'>
                    {badges.map((badge) => (
                      <div key={badge.id} className='pl-16 flex '>
                        <p className='text-xl'>{badge.count}</p>
                        <ImFire className='text-xl text-orange-500 ml-2'/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#ebe7de5b] w-11/12 mx-auto rounded-md border shadow-lg p-2">
              <p className='text-2xl text-center m-2 p-2 bg-[#e4e2e2] rounded-md'>Progress</p>
              {/* Carousel for small and medium screens */}
              <div className="md:hidden flex flex-col justify-center mt-8 md:mt-24">
                  <div className="overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4" style={{ scrollBehavior: 'smooth' }}>
                    <div className="flex space-x-4 justify-start items-center">
                      <Carousel progress={progress} /> {/* Pass progress as props */}
                    </div>
                  </div>
                </div>
                {/* Grid layout for large screens */}
                <div className={`hidden md:grid md:grid-cols-${animatedProgress.length} md:gap-8 md:mt-8 lg:mt-24`}>
              {progress.map((item, index) => (
                <div key={index} className="text-center">
                  <div
                    className="radial-progress bg-[#e4e2e2] text-primary-content border-[#e4e2e2] border-4 mx-auto"
                    style={{ 
                      "--value": animatedProgress[index], 
                      "transition": "var(--value) 2s ease" 
                    }}
                    role="progressbar"
                  >
                    {animatedProgress[index]}%
                  </div>
                  <p className='text-xl mt-4'>{item.label}</p>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      );
    }

export default Backend;
