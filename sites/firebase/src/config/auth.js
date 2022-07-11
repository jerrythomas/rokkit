import { adapter } from '@jerrythomas/sentry/firebase'
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

export const config = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: `${projectId}.firebaseapp.com`,
	databaseURL: `https://${projectId}.firebaseio.com`,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: `${projectId}.appspot.com`,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

export const firebase = adapter(config)
