import React, { useRef, useEffect } from 'react';
import { Button } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

interface AudioPlayerProps {
  url: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ url }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);

  useEffect(() => {
    // Auto-play when a new URL is set
    if (audioRef.current && url) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <div
      style={{
        background: '#f6f6f6',
        borderRadius: 8,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setPlaying(false)}
        style={{ width: '100%' }}
        controls
      />
      <Button
        type="primary"
        shape="round"
        icon={playing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={togglePlay}
        size="large"
      >
        {playing ? '暂停' : '播放播客'}
      </Button>
    </div>
  );
};

export default AudioPlayer;
