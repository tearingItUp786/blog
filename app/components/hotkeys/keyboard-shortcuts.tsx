import {
	HotkeysProvider,
	formatForDisplay,
	useAppHotkeyList,
	useCustomHotkeys,
	useHotkey,
	useHotkeyRecorder,
} from '@tanstack/react-hotkeys'
import { useEffect, useRef, useState } from 'react'
import { appHotkeys } from './registry'

const buttonClass =
	'focus-visible:outline-accent hover:text-accent min-h-11 px-2 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2'

export function KeyboardShortcuts() {
	const [isOpen, setIsOpen] = useState(false)
	const triggerRef = useRef<HTMLButtonElement>(null)
	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				className="text-body hover:text-accent focus-visible:outline-accent block cursor-pointer text-sm underline focus-visible:outline-2 focus-visible:outline-offset-4"
				onClick={() => setIsOpen(true)}
			>
				Keyboard shortcuts
			</button>
			{isOpen ? (
				<HotkeysProvider scope="shortcuts" exclusive>
					<ShortcutDialog
						onClose={() => {
							setIsOpen(false)
							triggerRef.current?.focus({ preventScroll: true })
						}}
					/>
				</HotkeysProvider>
			) : null}
		</>
	)
}

function ShortcutDialog({ onClose }: { onClose: () => void }) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const items = useAppHotkeyList()
	const { findConflicts, setCustomHotkey, resetCustomHotkey } =
		useCustomHotkeys()
	const [error, setError] = useState('')
	const [message, setMessage] = useState('')
	const recorder = useHotkeyRecorder({
		recordBy: 'key',
		detectConflicts: {
			exclude: (registration) =>
				registration.options.appHotkeyId === 'search.toggle',
		},
		validate: (hotkey) =>
			findConflicts('search.toggle', hotkey).length === 0 ||
			'That shortcut is already in use. Try another combination.',
		onReject: () =>
			setError(
				'That shortcut conflicts with another command. Try another combination, or press Escape to cancel.',
			),
		onCancel: () => {
			setError('')
			setMessage('Shortcut change cancelled.')
		},
		onRecord: (hotkey) => {
			const conflicts = setCustomHotkey('search.toggle', hotkey)
			if (conflicts.length) {
				setError('That shortcut is already in use. Try another combination.')
				return
			}
			setError('')
			setMessage('Search shortcut updated.')
		},
	})
	useHotkey(appHotkeys['shortcuts.close'], onClose, { ignoreInputs: false })
	useEffect(() => {
		dialogRef.current?.showModal()
	}, [])

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="shortcuts-title"
			onCancel={(event) => {
				event.preventDefault()
				if (recorder.isRecording) recorder.cancelRecording()
				else onClose()
			}}
			onClose={onClose}
			className="border-border-color bg-light-gray text-body dark:bg-dark-gray-100 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-sm border p-6 text-left backdrop:bg-black/60"
		>
			<div className="flex items-start justify-between gap-4">
				<h2 id="shortcuts-title" className="m-0 text-xl font-bold">
					Keyboard shortcuts
				</h2>
				<button type="button" className={buttonClass} onClick={onClose}>
					Close
				</button>
			</div>
			<p className="text-subheading-color mt-3 text-sm">
				Search from anywhere. Escape closes the active overlay.
			</p>
			<ul className="my-6 list-none divide-y divide-current/20 p-0">
				{items.map(({ appHotkey, status }) => (
					<li
						key={appHotkey.id}
						className="flex flex-wrap items-baseline justify-between gap-3 py-3 text-sm"
					>
						<span>
							{appHotkey.meta?.name}
							<span className="text-subheading-color mt-1 block text-xs">
								{status === 'active'
									? 'Available now'
									: status === 'suspended'
										? 'Paused while another overlay is open'
										: status === 'unbound'
											? 'Not assigned'
											: 'When this overlay is open'}
							</span>
						</span>
						<kbd className="font-inherit shrink-0">
							{appHotkey.hotkey
								? formatForDisplay(appHotkey.hotkey)
								: 'Unassigned'}
						</kbd>
					</li>
				))}
			</ul>
			<div className="flex flex-wrap gap-x-4 gap-y-2">
				<button
					type="button"
					className={buttonClass}
					onClick={() => {
						setError('')
						setMessage('')
						recorder.isRecording
							? recorder.cancelRecording()
							: recorder.startRecording()
					}}
				>
					{recorder.isRecording ? 'Cancel recording' : 'Change search shortcut'}
				</button>
				<button
					type="button"
					className={buttonClass}
					disabled={recorder.isRecording}
					onClick={() => {
						resetCustomHotkey('search.toggle')
						setError('')
						setMessage('Default search shortcut restored.')
					}}
				>
					Reset search shortcut
				</button>
			</div>
			<p role="status" className="text-subheading-color mt-3 text-sm">
				{recorder.isRecording
					? 'Press a new key combination. Escape cancels.'
					: message || 'Escape is fixed so you can always dismiss an overlay.'}
			</p>
			{error ? (
				<p role="alert" className="text-accent mt-3 text-sm">
					{error}
				</p>
			) : null}
		</dialog>
	)
}
