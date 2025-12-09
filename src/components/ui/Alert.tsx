import React from 'react';
import {
	View,
	Modal,
	TouchableWithoutFeedback,
	StyleSheet,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import Typography from './Typography';
import Button from './Button';

export interface AlertButton {
	text: string;
	onPress?: () => void;
	style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
	title?: string;
	message?: string;
	buttons: AlertButton[];
}

interface AlertProps {
	visible: boolean;
	title?: string;
	message?: string;
	buttons: AlertButton[];
	onDismiss: () => void;
}

const Alert: React.FC<AlertProps> = ({
	visible,
	title,
	message,
	buttons,
	onDismiss,
}) => {
	const handleButtonPress = (button: AlertButton) => {
		onDismiss();
		button.onPress?.();
	};

	// Separate buttons by style
	const cancelButtons = buttons.filter((b) => b.style === 'cancel');
	const destructiveButtons = buttons.filter((b) => b.style === 'destructive');
	const defaultButtons = buttons.filter(
		(b) => !b.style || b.style === 'default'
	);

	// Order: default buttons, then destructive, then cancel
	const orderedButtons = [...defaultButtons, ...destructiveButtons, ...cancelButtons];

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onDismiss}
		>
			<TouchableWithoutFeedback onPress={onDismiss}>
				<View style={styles.overlay}>
					<TouchableWithoutFeedback>
						<View style={styles.container}>
							{title && (
								<View style={styles.header}>
									<Typography variant="h3" style={styles.title}>
										{title}
									</Typography>
								</View>
							)}

							{message && (
								<View style={styles.messageContainer}>
									<Typography variant="body" color="secondary" style={styles.message}>
										{message}
									</Typography>
								</View>
							)}

							<View style={styles.buttonsContainer}>
								{orderedButtons.map((button, index) => {
									const isCancel = button.style === 'cancel';
									const isDestructive = button.style === 'destructive';
									const isLast = index === orderedButtons.length - 1;

									// Map button styles to Button variants
									// default -> ghost (transparent, primary text) - matches original
									// cancel -> ghost (transparent, primary text) - matches original  
									// destructive -> danger (error styling) - rounded with error colors
									let variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'ghost';
									if (isDestructive) {
										variant = 'danger';
									} else if (isCancel) {
										variant = 'ghost';
									} else {
										variant = 'primary';
									}

									return (
										<View key={index} style={[styles.buttonWrapper, !isLast && styles.buttonSpacing]}>
											<Button
												title={button.text}
												onPress={() => handleButtonPress(button)}
												variant={variant}
												size="md"
												fullWidth={true}
											/>
										</View>
									);
								})}
							</View>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: colors.overlay,
		justifyContent: 'center',
		alignItems: 'center',
		padding: spacing.xl,
	},
	container: {
		backgroundColor: colors.surfaceElevated,
		borderRadius: borderRadius.xl,
		width: '100%',
		maxWidth: 400,
		overflow: 'visible',
		...shadows.lg,
	},
	header: {
		paddingHorizontal: spacing.xl,
		paddingTop: spacing.xl,
		paddingBottom: spacing.md,
	},
	title: {
		textAlign: 'center',
	},
	messageContainer: {
		paddingHorizontal: spacing.xl,
		paddingBottom: spacing.lg,
	},
	message: {
		textAlign: 'center',
		lineHeight: 22,
	},
	buttonsContainer: {
		padding: spacing.lg,
		paddingTop: spacing.md,
		gap: spacing.sm,
	},
	buttonWrapper: {
		width: '100%',
	},

	buttonSpacing: {
		marginBottom: 0, // Spacing handled by gap in container
	},
});

export default Alert;

