'use client';

import React from 'react';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon
} from 'react-share';
import { useTranslations } from 'next-intl';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title, description }) => {
  const t = useTranslations('post');

  return (
    <div className="flex flex-col space-y-3">
      <h3 className="text-sm font-medium text-gray-700">{t('share')}</h3>
      <div className="flex space-x-2">
        <FacebookShareButton
          url={url}
          hashtag="#ViralPeek"
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>

        <TwitterShareButton
          url={url}
          title={title}
          hashtags={['ViralPeek', 'TikTok', 'Trending']}
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>

        <WhatsappShareButton
          url={url}
          title={`${title}${description ? ` - ${description}` : ''}`}
          separator=" - "
        >
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>

        <TelegramShareButton
          url={url}
          title={title}
        >
          <TelegramIcon size={32} round />
        </TelegramShareButton>
      </div>
    </div>
  );
};

export default SocialShare;