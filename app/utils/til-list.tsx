import type {MdxPageAndSlug} from 'types'
import {getMdxComponent} from './mdx'

export function tilMapper(til: MdxPageAndSlug) {
  let component = getMdxComponent(String(til.code))

  if (til.code) {
    return {
      ...til,
      component,
    }
  }
}
