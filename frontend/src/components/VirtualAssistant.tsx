import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause } from 'lucide-react';

interface VirtualAssistantProps {
  question?: string;
  videoSrc?: string;
  className?: string;
  onComplete?: () => void;
}

const VirtualAssistant = ({
  question = "How can I help you with your loan application today?",
  videoSrc = "https://static.videezy.com/system/resources/previews/000/042/147/original/business-woman-talking-free-stock-footage.mp4",
  className,
  onComplete
}: VirtualAssistantProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setVideoEnded(true);
        if (onComplete) {
          onComplete();
        }
      });

      videoRef.current.addEventListener('error', () => {
        setVideoError(true);
        console.error("Video source is not supported or inaccessible:", videoSrc);
      });

      // Check if the video source is valid before attempting to play
      if (videoSrc && videoRef.current.canPlayType("video/mp4")) {
        videoRef.current.onloadeddata = () => {
          videoRef.current?.play().catch((err) => {
            console.error("Error playing video:", err);
            setVideoError(true);
          });
          setIsPlaying(true);
        };
      } else {
        setVideoError(true);
        console.error("Invalid or unsupported video source:", videoSrc);
      }
    }
  }, [onComplete, videoSrc]);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="glass rounded-2xl overflow-hidden transition-all duration-300 transform">
        <div className="relative">
          {!videoError ? (
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-auto rounded-t-2xl"
              muted={false}
              controls
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded-t-2xl">
              <p className="text-gray-500">Failed to load video. Please try again later.</p>
            </div>
          )}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              onClick={toggleVideo}
              className="bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full transition-colors duration-200"
              disabled={videoError}
            >
              {isPlaying ? <Pause className="w-5 h-5 text-gray-700" /> : <Play className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-medium mb-2">Virtual Loan Manager</h3>
          <p className="text-gray-700 mb-4">{question}</p>
          
          {videoEnded && (
            <p className="text-center mt-4 text-sm text-success">
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualAssistant;
