import React, { createContext, useContext, useState, ReactNode } from 'react';
import Alert, { AlertOptions } from './Alert';

interface AlertContextType {
	showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);
	const [visible, setVisible] = useState(false);

	const showAlert = (options: AlertOptions) => {
		setAlertOptions(options);
		setVisible(true);
	};

	const hideAlert = () => {
		setVisible(false);
		// Clear options after animation
		setTimeout(() => {
			setAlertOptions(null);
		}, 200);
	};

	return (
		<AlertContext.Provider value={{ showAlert }}>
			{children}
			{alertOptions && (
				<Alert
					visible={visible}
					title={alertOptions.title}
					message={alertOptions.message}
					buttons={alertOptions.buttons}
					onDismiss={hideAlert}
				/>
			)}
		</AlertContext.Provider>
	);
};

export const useAlert = () => {
	const context = useContext(AlertContext);
	if (!context) {
		throw new Error('useAlert must be used within an AlertProvider');
	}
	return context;
};

