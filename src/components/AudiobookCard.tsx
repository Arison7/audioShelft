import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, audiobookCardStyles } from '../theme';
import { Typography, IconButton, CircularProgress } from './ui';
import CoverImage from './CoverImage';
import { getPlaybackState } from '../storage/playbackStorage';
import { usePlayback } from '../context/PlaybackContext';

interface AudiobookCardProps {
  title: string;
  subtitle?: string;
  timestamp: number;
  coverImageUri?: string;
  itemId: string;
  filePath: string;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditing?: boolean;
}

const AudiobookCard: React.FC<AudiobookCardProps> = ({
  title,
  subtitle,
  timestamp,
  coverImageUri,
  itemId,
  filePath,
  onPlay,
  onEdit,
  onDelete,
}) => {
  const [progress, setProgress] = useState(0);
  const { currentTrack, status } = usePlayback();
  const isCurrentlyPlaying = currentTrack?.filePath === filePath;

  // Update progress in real-time if this is the currently playing track
  useEffect(() => {
    if (isCurrentlyPlaying && status?.isLoaded) {
      const currentTime = status.currentTime ?? 0;
      const duration = status.duration ?? 0;
      
      if (duration > 0) {
        const calculatedProgress = currentTime / duration;
        setProgress(Math.min(1, Math.max(0, calculatedProgress)));
      } else if (currentTime > 0) {
        setProgress(0.01);
      } else {
        setProgress(0);
      }
    }
  }, [isCurrentlyPlaying, status?.currentTime, status?.duration, status?.isLoaded]);

  // Load saved progress when not currently playing
  useEffect(() => {
    if (!isCurrentlyPlaying) {
      const loadProgress = async () => {
        const state = await getPlaybackState(filePath);
        if (state && state.position > 0) {
          if (state.duration && state.duration > 0) {
            const calculatedProgress = state.position / state.duration;
            setProgress(Math.min(1, Math.max(0, calculatedProgress)));
          } else {
            // If we have position but no duration, show minimal progress (1%) to indicate it's been started
            setProgress(0.01);
          }
        } else {
          setProgress(0);
        }
      };
      loadProgress();
    }
  }, [filePath, isCurrentlyPlaying]);

  const formattedDate = new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={audiobookCardStyles.container} onPress={onPlay} activeOpacity={0.85}>
      {/* Album art */}
      <View style={audiobookCardStyles.artworkContainer}>
        <CoverImage uri={coverImageUri} itemId={itemId} size={52} />
      </View>

      {/* Content */}
      <View style={audiobookCardStyles.content}>
        <Typography variant="body" weight="semiBold" numberOfLines={1}>
          {title}
        </Typography>
        <View style={audiobookCardStyles.meta}>
          <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
          <Typography variant="caption" color="muted" style={audiobookCardStyles.date}>
            {formattedDate}
          </Typography>
        </View>
      </View>

      {/* Actions */}
      <View style={audiobookCardStyles.actions}>
        <IconButton
          icon="create-outline"
          onPress={onEdit}
          variant="ghost"
          size="sm"
        />
        <IconButton
          icon="trash-outline"
          onPress={onDelete}
          variant="ghost"
          size="sm"
        />
        <View style={audiobookCardStyles.playButton}>
          <CircularProgress progress={progress} size={36} strokeWidth={3} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AudiobookCard;

