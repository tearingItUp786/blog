export async function sendNtfyNotification() {
	const topic = process.env.NOTIFY_TOPIC // Replace with your actual ntfy topic
	const url = `https://ntfy.sh/${topic}`

	try {
		const response = await fetch(url, {
			method: 'POST',
			body: 'done refreshing cache',
			headers: {
				'Content-Type': 'text/plain',
			},
		})

		if (!response.ok) {
			throw new Error(`Failed to send notification: ${response.statusText}`)
		}

		console.log('Notification sent successfully.')
	} catch (error) {
		console.error('Error sending notification:', JSON.stringify(error))
	}
}
