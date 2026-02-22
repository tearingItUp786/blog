export const ValidationDemo = () => {
	return (
		<div className="max-w-md space-y-6 py-2">
			<style>
				{`
        /* Base look */
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 0.25rem solid #d1d5db; /* gray-300 */
          padding: 0.5rem;
          font-size: 14px;
        }

        /* Show only AFTER user interaction */
        .input--user:user-valid { border-color: #16a34a; } /* green-600 */
        .input--user:user-invalid { border-color: #dc2626; } /* red-600 */

        /* Show IMMEDIATELY based on validity */
        .input--immediate:valid { border-color: #16a34a; }
        .input--immediate:invalid { border-color: #dc2626; }
        `}
			</style>

			<h2 className="mt-0 mb-4 text-xl font-bold">
				Input Validation States Demo
			</h2>

			{/* Success after interaction (letters) */}
			<div className="mb-4">
				<input
					type="text"
					required
					className="input input--user"
					placeholder=":user-valid and :user-invalid"
				/>
			</div>

			{/* Success immediately (letters) */}
			<div className="mb-4">
				<input
					type="text"
					pattern="^[a-zA-Z]+$"
					className="input input--immediate"
					placeholder=":valid if letters"
				/>
			</div>

			{/* Error immediately (digits only) */}
			<div className="mb-4">
				<input
					type="text"
					required
					className="input input--immediate"
					placeholder=":invalid"
				/>
			</div>
		</div>
	)
}

export default ValidationDemo
