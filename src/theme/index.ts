import { Dimensions, StyleSheet } from 'react-native';

// ============================================
// AUDIO SHELF - DESIGN SYSTEM
// ============================================
// A warm, cozy dark theme perfect for audiobook listening
// Edit these values to change the entire app's appearance

export const colors = {
  // Primary palette - softer amber/honey tones for cozy feel
  primary: '#E7A24B',
  primaryLight: '#F3C478',
  primaryDark: '#C5872C',
  primaryMuted: 'rgba(231, 162, 75, 0.18)',

  // Background layers (warmer charcoal to cocoa)
  background: '#0B0A0D',
  surface: '#141118',
  surfaceElevated: '#1B1720',
  surfaceHighlight: '#24202A',

  // Text hierarchy
  textPrimary: '#F8F5F0',
  textSecondary: '#B8B2C2',
  textMuted: '#7D7688',
  textOnPrimary: '#0B0A0D',

  // Semantic colors
  success: '#4ADE80',
  successMuted: 'rgba(74, 222, 128, 0.15)',
  error: '#F87171',
  errorMuted: 'rgba(248, 113, 113, 0.15)',
  warning: '#F2C94C',

  // Borders & dividers
  border: '#2C2733',
  borderLight: '#373141',
  divider: '#1A1520',

  // Overlay (slightly softer)
  overlay: 'rgba(5, 4, 6, 0.68)',
};

export const typography = {
  // Font families - cozy, rounded-friendly stacks with fallbacks
  fontFamily: {
    regular: 'Avenir-Book',
    medium: 'Avenir-Medium',
    semiBold: 'Avenir-Heavy',
    bold: 'Avenir-Black',
    serif: 'Times New Roman', // Elegant serif font for book covers
  },

  // Font sizes
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },

  // Font weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 17,
  lg: 22,
  xl: 26,
  xxl: 34,
  xxxl: 50,
};

export const borderRadius = {
  sm: 8,
  base: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Common layout styles
export const layout = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

// Animation durations
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// ============================================
// COMPONENT STYLES
// ============================================

// Slider
export const sliderConstants = {
  THUMB_SIZE: 20,
  TRACK_HEIGHT: 6,
};

export const sliderStyles = StyleSheet.create({
  container: {
    height: sliderConstants.THUMB_SIZE + 10,
    justifyContent: 'center',
    paddingVertical: 5,
  },
  track: {
    width: '100%',
    borderRadius: sliderConstants.TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: sliderConstants.TRACK_HEIGHT / 2,
  },
  thumb: {
    position: 'absolute',
    marginLeft: -sliderConstants.THUMB_SIZE / 2,
    borderRadius: sliderConstants.THUMB_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  noteMarker: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
    top: '50%',
    marginTop: -3,
    zIndex: 2,
    borderWidth: 1,
    borderColor: colors.background,
  },
});

// Button
export const buttonStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  variant_primary: {
    backgroundColor: colors.primary,
  },
  variant_secondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: colors.errorMuted,
    borderWidth: 1,
    borderColor: colors.error,
  },
  size_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  size_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  size_lg: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: typography.weight.semiBold,
  },
  text_primary: {
    color: colors.textOnPrimary,
  },
  text_secondary: {
    color: colors.textPrimary,
  },
  text_ghost: {
    color: colors.primary,
  },
  text_danger: {
    color: colors.error,
  },
  textSize_sm: {
    fontSize: typography.size.sm,
  },
  textSize_md: {
    fontSize: typography.size.base,
  },
  textSize_lg: {
    fontSize: typography.size.md,
  },
  textDisabled: {
    opacity: 0.7,
  },
});

// Card
export const cardStyles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  variant_default: {
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  variant_elevated: {
    backgroundColor: colors.surfaceElevated,
    ...shadows.md,
  },
  variant_outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padding_sm: {
    padding: spacing.sm,
  },
  padding_md: {
    padding: spacing.base,
  },
  padding_lg: {
    padding: spacing.xl,
  },
});

// IconButton
export const iconButtonStyles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  variant_primary: {
    backgroundColor: colors.primary,
  },
  variant_secondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: colors.errorMuted,
  },
  disabled: {
    opacity: 0.5,
  },
});

// Typography
export const typographyStyles = StyleSheet.create({
  h1: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    letterSpacing: -0.5,
    lineHeight: typography.size.xxl * typography.lineHeight.tight,
    fontFamily: typography.fontFamily.bold,
  },
  h2: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    letterSpacing: -0.3,
    lineHeight: typography.size.xl * typography.lineHeight.tight,
    fontFamily: typography.fontFamily.bold,
  },
  h3: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semiBold,
    lineHeight: typography.size.lg * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.semiBold,
  },
  body: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.base * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.regular,
  },
  bodySmall: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.regular,
  },
  caption: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    letterSpacing: 0.3,
    lineHeight: typography.size.xs * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.medium,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semiBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: typography.fontFamily.semiBold,
  },
  color_primary: {
    color: colors.textPrimary,
  },
  color_secondary: {
    color: colors.textSecondary,
  },
  color_muted: {
    color: colors.textMuted,
  },
  color_accent: {
    color: colors.primary,
  },
  color_error: {
    color: colors.error,
  },
  color_success: {
    color: colors.success,
  },
});

// Input
export const inputStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

// Progress bar
export const progressBarStyles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});

// Empty state
export const emptyStateStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  description: {
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.xl,
  },
});

// Loading screen
export const loadingScreenStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: spacing.base,
  },
});

// Audiobook card
export const audiobookCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  artworkContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  date: {
    marginLeft: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
    ...shadows.glow,
  },
});

// Audiobook grid card
const SCREEN_WIDTH = Dimensions.get('window').width;
export const audiobookGridCardWidth =
  (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2;

export const audiobookGridCardStyles = StyleSheet.create({
  container: {
    width: audiobookGridCardWidth,
    marginBottom: spacing.lg,
  },
  bookCover: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    marginBottom: spacing.sm,
  },
  coverBackground: {
    flex: 1,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    ...shadows.md,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  playOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  info: {
    paddingHorizontal: spacing.xs,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  date: {
    textAlign: 'center',
  },
});

// Folder card
export const folderCardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  artwork: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaText: {
    marginLeft: spacing.xs,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

// Cover image
export const coverImageStyles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: colors.primaryMuted,
  },
});

// Player screen
export const playerScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  resumeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  resumeText: {
    marginLeft: spacing.xs / 2,
  },
  returnButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notesHeaderContainer: {
    paddingTop: spacing.sm,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    opacity: 0.5,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  notesHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chevronIcon: {
    marginLeft: spacing.xs,
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesTitle: {
    marginLeft: spacing.sm,
  },
  notesLoading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyNotes: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    maxWidth: 240,
  },
  notesList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  noteCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  timestampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  timestampText: {
    marginLeft: spacing.xs,
  },
  noteActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  noteActionBtn: {
    padding: spacing.xs,
  },
  noteText: {
    marginBottom: spacing.sm,
  },
  noteMeta: {
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  noteInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});

// Shelf screen
export const shelfScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120, // Reduced since FAB buttons are removed (only need space for mini player)
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: spacing.xl,
  },
  modalTitle: {
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  coverImageSection: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  coverLabel: {
    marginBottom: spacing.sm,
  },
  coverImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  coverImagePreview: {
    width: '100%',
    height: '100%',
  },
  coverImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImageText: {
    marginTop: spacing.xs,
  },
  removeCoverButton: {
    marginTop: spacing.sm,
    padding: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  searchInput: {
    paddingLeft: spacing.xl + spacing.md,
    paddingRight: spacing.xl + spacing.md,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 1,
    padding: spacing.xs,
  },
});

// Settings screen
export const settingsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.base,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  settingDesc: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 68,
  },
  layoutOptions: {
    flexDirection: 'row',
    padding: spacing.base,
    paddingTop: 0,
    gap: spacing.sm,
  },
  layoutOption: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  layoutOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  layoutIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.base,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  layoutIconContainerSelected: {
    backgroundColor: colors.background,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
});

// Audio player
export const audioPlayerStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  artworkContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
  },
  artwork: {
    width: 180,
    height: 180,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  artworkInner: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
  },
  playingGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: borderRadius.xl + 10,
    backgroundColor: colors.primary,
    opacity: 0.15,
    zIndex: -1,
  },
  progressSection: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  seekButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  seekLabel: {
    position: 'absolute',
    bottom: 6,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  playButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  playIcon: {
    marginLeft: 4,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textOnPrimary,
  },
  status: {
    marginBottom: spacing.lg,
  },
  noteButtonContainer: {
    width: '100%',
  },
});

export const componentStyles = {
  slider: sliderStyles,
  button: buttonStyles,
  card: cardStyles,
  iconButton: iconButtonStyles,
  typography: typographyStyles,
  input: inputStyles,
  progressBar: progressBarStyles,
  emptyState: emptyStateStyles,
  loadingScreen: loadingScreenStyles,
  audiobookCard: audiobookCardStyles,
  audiobookGridCard: audiobookGridCardStyles,
  folderCard: folderCardStyles,
  coverImage: coverImageStyles,
  playerScreen: playerScreenStyles,
  shelfScreen: shelfScreenStyles,
  settingsScreen: settingsScreenStyles,
  audioPlayer: audioPlayerStyles,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animation,
  componentStyles,
};

