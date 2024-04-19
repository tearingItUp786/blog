import {getMDXComponent} from 'mdx-bundler/client'
import * as myTypo from '~/components/typography'

import {CloudinaryHeroImage} from '~/components/hero-image'
import {LazyGiphy} from '~/components/lazy-iframe'
import {Callout} from '~/components/callout'
import {useMemo} from 'react'

/**
 * These get passed to the MDX components
 * So we can reference them as we write content
 */
const mdxComponents = {
  ...myTypo,
  Callout,
  LazyGiphy,
  CloudinaryHeroImage,
}

/**
 * This should be rendered within a useMemo
 * @param code the code to get the component from
 * @returns the component
 */
function getMdxComponent(code: string) {
  const Component = getMDXComponent(code)
  function KCDMdxComponent({
    components,
    ...rest
  }: Parameters<typeof Component>['0']) {
    return (
      <Component components={{...mdxComponents, ...components}} {...rest} />
    )
  }
  // thanks kent
  return KCDMdxComponent
}

function useMdxComponent(code: string) {
  return useMemo(() => getMdxComponent(code), [code])
}

export {getMdxComponent, useMdxComponent}
