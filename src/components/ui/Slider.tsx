import React, { useState, useRef, useEffect } from 'react';
import {
	View,
	PanResponder,
	ViewStyle,
} from 'react-native';
import { colors, sliderStyles, sliderConstants } from '../../theme';

interface Note {
	id: string;
	timestamp: number;
}

interface SliderProps {
	value: number; // 0 to 1
	onValueChange?: (value: number) => void;
	onSlidingComplete?: (value: number) => void;
	minimumTrackTintColor?: string;
	maximumTrackTintColor?: string;
	thumbColor?: string;
	disabled?: boolean;
	style?: ViewStyle;
	notes?: Note[];
	duration?: number;
}

const Slider: React.FC<SliderProps> = ({
	value,
	onValueChange,
	onSlidingComplete,
	minimumTrackTintColor = colors.primary,
	maximumTrackTintColor = colors.surfaceHighlight,
	thumbColor = colors.primary,
	disabled = false,
	style,
	notes = [],
	duration = 0,
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [dragValue, setDragValue] = useState(value);
	const containerRef = useRef<View>(null);
	const containerLayout = useRef({ x: 0, width: 0 });
	const isDraggingRef = useRef(false);
	const dragValueRef = useRef(value);

	const clampedValue = Math.min(Math.max(value, 0), 1);
	
	// Update drag value when external value changes (but not while dragging)
	useEffect(() => {
		if (!isDraggingRef.current) {
			setDragValue(clampedValue);
			dragValueRef.current = clampedValue;
		}
	}, [clampedValue]);
	
	// Use dragValue while dragging, otherwise use the clamped value from props
	const displayValue = isDragging ? dragValue : clampedValue;

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => !disabled,
			onMoveShouldSetPanResponder: () => !disabled,
			onPanResponderGrant: (evt) => {
				if (disabled) return;
				containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
					containerLayout.current = { x: pageX, width };
					isDraggingRef.current = true;
					setIsDragging(true);
					const touchX = evt.nativeEvent.pageX - pageX;
					const newValue = Math.max(0, Math.min(1, touchX / width));
					setDragValue(newValue);
					dragValueRef.current = newValue;
					onValueChange?.(newValue);
				});
			},
			onPanResponderMove: (evt) => {
				if (disabled || !isDraggingRef.current) return;
				if (!containerLayout.current.width) {
					containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
						containerLayout.current = { x: pageX, width };
						const touchX = evt.nativeEvent.pageX - pageX;
						const newValue = Math.max(0, Math.min(1, touchX / width));
						setDragValue(newValue);
						dragValueRef.current = newValue;
						onValueChange?.(newValue);
					});
				} else {
					const touchX = evt.nativeEvent.pageX - containerLayout.current.x;
					const newValue = Math.max(0, Math.min(1, touchX / containerLayout.current.width));
					setDragValue(newValue);
					dragValueRef.current = newValue;
					onValueChange?.(newValue);
				}
			},
			onPanResponderRelease: () => {
				if (disabled || !isDraggingRef.current) return;
				// Use ref to get the most current value, not the stale closure value
				const finalValue = dragValueRef.current;
				isDraggingRef.current = false;
				setIsDragging(false);
				console.log("Slider onPanResponderRelease", finalValue);
				onSlidingComplete?.(finalValue);
			},
			onPanResponderTerminate: () => {
				if (disabled || !isDraggingRef.current) return;
				// Use ref to get the most current value, not the stale closure value
				const finalValue = dragValueRef.current;
				isDraggingRef.current = false;
				setIsDragging(false);
				console.log("Slider onPanResponderTerminate", finalValue);
				onSlidingComplete?.(finalValue);
			},
		})
	).current;

	// Calculate note marker positions
	const noteMarkers = notes
		.filter((note) => duration > 0 && note.timestamp >= 0 && note.timestamp <= duration)
		.map((note) => ({
			id: note.id,
			position: note.timestamp / duration,
		}));

	return (
		<View
			ref={containerRef}
			style={[sliderStyles.container, style]}
			onLayout={() => {
				containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
					containerLayout.current = { x: pageX, width };
				});
			}}
			{...panResponder.panHandlers}
		>
			{/* Track */}
			<View
				style={[
					sliderStyles.track,
					{ height: sliderConstants.TRACK_HEIGHT, backgroundColor: maximumTrackTintColor },
				]}
			>
				{/* Progress */}
				<View
					style={[
						sliderStyles.progress,
						{
							width: `${displayValue * 100}%`,
							backgroundColor: minimumTrackTintColor,
							height: sliderConstants.TRACK_HEIGHT,
						},
					]}
				/>

				{/* Note Markers */}
				{noteMarkers.map((marker) => (
					<View
						key={marker.id}
						style={[
							sliderStyles.noteMarker,
							{
								left: `${marker.position * 100}%`,
								backgroundColor: colors.primary,
							},
						]}
						pointerEvents="none"
					/>
				))}
			</View>

			{/* Thumb */}
			<View
				style={[
					sliderStyles.thumb,
					{
						left: `${displayValue * 100}%`,
						width: sliderConstants.THUMB_SIZE,
						height: sliderConstants.THUMB_SIZE,
						backgroundColor: thumbColor,
						opacity: disabled ? 0.5 : 1,
						transform: [{ scale: isDragging ? 1.2 : 1 }],
					},
				]}
				pointerEvents="none"
			/>
		</View>
	);
};

export default Slider;
