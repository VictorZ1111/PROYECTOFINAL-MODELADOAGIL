
'use client'
import React from 'react'
import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  url: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  return (
    <div className="aspect-video">
      <ReactPlayer url={url} width="100%" height="100%" controls />
    </div>
  )
}

export default VideoPlayer
