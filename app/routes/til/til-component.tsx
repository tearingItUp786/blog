import { ContentCard } from './content-card'
import { useCardReveal } from '~/hooks/use-above-fold'
import { type TilMdxPage } from '~/schemas/github'
import { useMdxComponent } from '~/utils/mdx-utils'

export function TilComponent({ til }: { til: TilMdxPage }) {
	const Component = useMdxComponent(String(til.code))
	const scope = useCardReveal()

	if (!til?.frontmatter) return null

	return (
		<div ref={scope} className="mb-24 last-of-type:mb-0">
			<ContentCard
				id={til.slug}
				titleTo={`/til?offset=${til.offset}#${til.slug}`}
				title={til.frontmatter.title}
				date={til.frontmatter.date}
				tag={til.frontmatter.tag}
			>
				<Component />
			</ContentCard>
		</div>
	)
}
