"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, VolumeX, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  open: boolean;
  onVideoComplete: () => void;
}

export default function VideoModal({ open, onVideoComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setHasStarted(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsCompleted(true);
    };

    const handleError = () => {
      setVideoError(true);
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    // Disable seeking by preventing certain events
    const preventSeeking = (e: Event) => {
      e.preventDefault();
    };

    video.addEventListener('seeking', preventSeeking);
    video.addEventListener('seeked', preventSeeking);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('seeking', preventSeeking);
      video.removeEventListener('seeked', preventSeeking);
    };
  }, [open]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video || isCompleted) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((error) => {
        console.error('Error playing video:', error);
        setVideoError(true);
      });
    }
  };

  const handleContinue = () => {
    onVideoComplete();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-hidden={!open}
    >
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
        className="relative max-w-4xl w-full z-[110] transform rounded-lg shadow-xl"
      >
        <CardHeader className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 rounded-full p-2">
              <Play className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle id="video-modal-title" className="text-xl font-bold">
                Level 32 - Observation Video
              </CardTitle>
              <div className="text-sm text-gray-600">
                Watch carefully - this video can only be played once
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Silent Video
          </Badge>
        </CardHeader>

        <CardContent className="px-6 pb-6 space-y-4">
          {/* Video Container */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {videoError ? (
              <div className="aspect-video flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 font-medium">Video failed to load</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Please ensure the video file exists in the public directory
                  </p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full aspect-video"
                  muted
                  playsInline
                  controlsList="nodownload nofullscreen noremoteplayback"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <source src="/level32-video.mp4" type="video/mp4" />
                  <source src="/level32-video.webm" type="video/webm" />
                  Your browser does not support the video tag.
                </video>

                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Loading video...</p>
                    </div>
                  </div>
                )}

                {/* Custom Controls Overlay */}
                {!isLoading && !videoError && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={togglePlayPause}
                          disabled={isCompleted}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                        
                        <div className="flex items-center space-x-2">
                          <VolumeX className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-400">Silent</span>
                        </div>
                      </div>

                      <div className="text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                      <div
                        className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Instructions */}
          {!hasStarted && !videoError && !isLoading && (
            <Alert className="bg-blue-50 border-blue-200">
              <Play className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Instructions:</strong> Click the play button to start the video. 
                Pay close attention to all details as you can only watch it once.
              </AlertDescription>
            </Alert>
          )}

          {/* Completion Message */}
          {isCompleted && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Video Complete!</strong> You can now proceed to answer questions based on what you observed.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            {isCompleted ? (
              <Button 
                onClick={handleContinue}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Continue to Questions
              </Button>
            ) : videoError ? (
              <Button 
                onClick={handleContinue}
                variant="outline"
                className="text-gray-600"
              >
                Skip Video (Error)
              </Button>
            ) : (
              <div className="text-sm text-gray-500">
                {!hasStarted ? "Click play to start the video" : "Video is playing..."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
