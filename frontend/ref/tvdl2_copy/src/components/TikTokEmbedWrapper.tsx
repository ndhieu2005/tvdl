import dynamic from 'next/dynamic';

// Dynamically import TikTokEmbed with no SSR
const TikTokEmbed = dynamic(() => import('./TikTokEmbed'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
      <div className="w-full h-64 bg-gray-200 rounded-lg"></div>
      <div className="mt-3 h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="mt-2 h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
});

interface TikTokEmbedWrapperProps {
  videoUrl: string;
  className?: string;
  compact?: boolean;
}

const TikTokEmbedWrapper: React.FC<TikTokEmbedWrapperProps> = (props) => {
  return <TikTokEmbed {...props} />;
};

export default TikTokEmbedWrapper;