import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GuideGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideGallery({ isOpen, onClose }: GuideGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Guide images
  const guideImages = [
    "/guide/rtfm-1.png",
    "/guide/rtfm-2.png",
    "/guide/rtfm-3.png",
    "/guide/rtfm-4.png",
    "/guide/rtfm-5.png",
    "/guide/rtfm-6.png"
  ];

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % guideImages.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + guideImages.length) % guideImages.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
          aria-label="Close guide"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image container */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden rounded-lg bg-transparent">
          <img
            src={guideImages[currentIndex]}
            alt={`Game guide step ${currentIndex + 1}`}
            className="max-h-[95%] max-w-[98%] object-contain"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.src = "/placeholder.png"; // placeholder for error case
              e.currentTarget.alt = "Guide image not available";
            }}
          />
          
          {/* Navigation buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 bg-red-600 hover:bg-red-500 text-white p-3 rounded-full transition-colors"
            aria-label="Previous guide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 bg-red-600 hover:bg-red-500 text-white p-3 rounded-full transition-colors"
            aria-label="Next guide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Image counter and navigation */}
        <div className="flex flex-col items-center mt-4 px-4">
          <div className="flex space-x-2 mb-2">
            {guideImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-4 h-4 rounded-full ${
                  index === currentIndex ? "bg-red-500" : "bg-gray-600"
                } transition-all duration-300 hover:scale-125`}
                aria-label={`Go to guide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation hint */}
          <div className="text-center text-gray-300 text-sm py-2">
            {currentIndex + 1} of {guideImages.length} • Use arrow keys to navigate • Press ESC to close
          </div>
        </div>
      </div>
    </div>
  );
}