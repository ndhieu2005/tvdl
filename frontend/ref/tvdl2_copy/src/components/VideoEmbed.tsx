import React from 'react';

interface VideoEmbedProps {
  url: string;
  platform: 'tiktok' | 'youtube';
  title?: string;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({ url, platform, title }) => {
  const renderTikTokEmbed = () => {
    // Extract TikTok video ID from URL
    const videoId = url.split('/').pop()?.split('?')[0];
    
    return (
      <div className="relative w-full max-w-md mx-auto">
        <blockquote 
          className="tiktok-embed" 
          cite={url}
          data-video-id={videoId}
          style={{ maxWidth: '605px', minWidth: '325px' }}
        >
          <section>
            <a 
              target="_blank" 
              title={title || 'TikTok Video'}
              href={url}
              rel="noopener noreferrer"
            >
              {title || 'TikTok Video'}
            </a>
          </section>
        </blockquote>
        <script async src="https://www.tiktok.com/embed.js"></script>
      </div>
    );
  };

  const renderYouTubeEmbed = () => {
    // Extract YouTube video ID from URL
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('shorts/')[1].split('?')[0];
    }

    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title || 'YouTube Video'}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  };

  return (
    <div className="my-6">
      {platform === 'tiktok' ? renderTikTokEmbed() : renderYouTubeEmbed()}
    </div>
  );
};

export default VideoEmbed;