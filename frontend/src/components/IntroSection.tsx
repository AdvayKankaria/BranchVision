import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const IntroSection = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
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
    <section className="intro-section">
      {/* ...existing code... */}
      <div className="video-container relative">
        <video ref={videoRef} width="100%" src="/videos/BranchVision.mp4" />
        <button
          onClick={togglePlayPause}
          className="absolute bottom-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-gray-700" />
          ) : (
            <Play className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>
      {/* ...existing code... */}
    </section>
  );
};

export default IntroSection;
