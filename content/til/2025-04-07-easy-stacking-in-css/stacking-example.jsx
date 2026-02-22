import React from 'react'
import { twJoin } from 'tailwind-merge'

export const PILL_CLASS_NAME = `
  group
  flex w-fit items-center
  rounded-md border-[1.5px] border-solid border-accent bg-transparent px-4 py-1 
  font-medium 
  leading-5
  no-underline	
`
export const PILL_CLASS_NAME_ACTIVE =
	'transition-colors hover:bg-accent hover:text-charcoal-gray group-hover:text-charcoal-gray'

const CardStack = () => {
	const [revealCode, setRevealCode] = React.useState(false)

	const toggleCode = () => setRevealCode((prev) => !prev)

	const codeExample = `
<pre style="background-color:#292D3E;border:1px solid #292D3E;border-radius:8px;color:#ffffff;overflow:auto;padding:24px">
<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span>div className<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">=</span><span class="token string" style="color: rgb(255, 213, 128); font-size: 14px;">"group relative grid h-48 w-72"</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span>
  <span class="token punctuation" style="color: rgb(255, 255, 255); font-size: 14px;">{</span><span class="token comment" style="color: rgb(92, 99, 112); font-size: 14px;">/* Base Card */</span><span class="token punctuation" style="color: rgb(255, 255, 255); font-size: 14px;">}</span>
  <span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span>div className<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">=</span><span class="token string" style="color: rgb(255, 213, 128); font-size: 14px;">"col-start-1 col-end-2 row-start-1 row-end-2 rounded-lg bg-alert p-5 shadow-md"</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">/</span>div<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span>

  <span class="token punctuation" style="color: rgb(255, 255, 255); font-size: 14px;">{</span><span class="token comment" style="color: rgb(92, 99, 112); font-size: 14px;">/* Middle Card */</span><span class="token punctuation" style="color: rgb(255, 255, 255); font-size: 14px;">}</span>
  <span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span>div className<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">=</span><span class="token string" style="color: rgb(255, 213, 128); font-size: 14px;">"col-start-1 col-end-2 row-start-1 row-end-2 translate-x-4 translate-y-4 rounded-lg bg-info p-5 shadow-md transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1"</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">/</span>div<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span>

  <span class="token punctuation" style="color: rgb(255, 255, 255); font-size: 14px;">{</span><span class="token comment" style="color: rgb(92, 99, 112); font-size: 14px;">/* Top Card */</span><span class="token punctuation" style="color: rgb(255, 255, 255); font-size: 14px;">}</span>
  <span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span>div className<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">=</span><span class="token string" style="color: rgb(255, 213, 128); font-size: 14px;">"col-start-1 col-end-2 row-start-1 row-end-2 translate-x-8 translate-y-8 rounded-lg bg-medium-gray p-5 shadow-md transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2"</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span>
    <span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span>h3 className<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">=</span><span class="token string" style="color: rgb(255, 213, 128); font-size: 14px;">"text-lg font-bold text-white"</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span>Top Card<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">/</span>h3<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span>
    <span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span>p className<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">=</span><span class="token string" style="color: rgb(255, 213, 128); font-size: 14px;">"text-white"</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span>This card is on top<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">...</span> hover me<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">!</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">/</span>p<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span>
  <span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">/</span>div<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span>
<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&lt;</span><span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">/</span>div<span class="token operator" style="color: rgb(120, 220, 232); font-size: 14px;">&gt;</span><span class="token punctuation" style="color: rgb(255, 255, 255); font-size: 14px;"></span></code>
</pre>
  `

	return (
		<div className="mt-6">
			<button
				onClick={toggleCode}
				className={twJoin(
					PILL_CLASS_NAME,
					PILL_CLASS_NAME_ACTIVE,
					'text-accent mb-6 py-[6px] text-lg leading-6',
				)}
			>
				{revealCode ? 'Hide Code' : 'Reveal Code'}
			</button>

			{revealCode && (
				<div className="mb-6">
					<div dangerouslySetInnerHTML={{ __html: codeExample }} />
				</div>
			)}

			<div className="group relative grid h-48 w-72">
				{/* Base Card */}
				<div className="bg-alert col-start-1 col-end-2 row-start-1 row-end-2 rounded-lg p-5 shadow-md"></div>

				{/* Middle Card */}
				<div className="bg-info col-start-1 col-end-2 row-start-1 row-end-2 translate-x-4 translate-y-4 rounded-lg p-5 shadow-md transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1"></div>

				{/* Top Card */}
				<div className="bg-medium-gray col-start-1 col-end-2 row-start-1 row-end-2 translate-x-8 translate-y-8 rounded-lg p-5 shadow-md transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2">
					<h3 className="text-lg font-bold text-white">Top Card</h3>
					<p className="text-white">This card is on top... hover me!</p>
				</div>
			</div>
		</div>
	)
}

export default CardStack
