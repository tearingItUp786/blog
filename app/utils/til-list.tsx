import type {MdxPageAndSlug} from 'types'
import {getMdxComponent} from './mdx'

export function tilMapper(til: MdxPageAndSlug) {
  let component = getMdxComponent(String(til.code))

  // returns the component
  // and the rest of the props
  return {
    ...til,
    component,
  }
}
