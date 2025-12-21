import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, folderCardStyles } from '../theme';
import { Typography, IconButton } from './ui';

interface FolderCardProps {
  title: string;
  itemCount: number;
  sortType: 'name' | 'date';
  onOpen: () => void;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const FolderCard: React.FC<FolderCardProps> = ({
  title,
  itemCount,
  sortType,
  onOpen,
  onPlay,
  onEdit,
  onDelete,
}) => {
  return (
    <TouchableOpacity style={folderCardStyles.container} onPress={onOpen} activeOpacity={0.85}>
      {/* Folder icon */}
      <View style={folderCardStyles.artwork}>
        <Ionicons name="folder" size={28} color={colors.warning} />
      </View>

      {/* Content */}
      <View style={folderCardStyles.content}>
        <Typography variant="body" weight="semiBold" numberOfLines={1}>
          {title}
        </Typography>
        <View style={folderCardStyles.meta}>
          <Ionicons name="musical-notes-outline" size={12} color={colors.textMuted} />
          <Typography variant="caption" color="muted" style={folderCardStyles.metaText}>
            {itemCount} items
          </Typography>
          <View style={folderCardStyles.dot} />
          <Typography variant="caption" color="muted">
            by {sortType}
          </Typography>
        </View>
      </View>

      {/* Actions */}
      <View style={folderCardStyles.actions}>
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
        <IconButton
          icon="play"
          onPress={onPlay}
          variant="primary"
          size="md"
        />
      </View>
    </TouchableOpacity>
  );
};

export default FolderCard;

