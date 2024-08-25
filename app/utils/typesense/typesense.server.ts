import * as Typesense from 'typesense'
import {CollectionFieldSchema} from 'typesense/lib/Typesense/Collection'

declare global {
  var typeClient: Typesense.Client | undefined
}

function getTypesenseClient() {
  let typesenseClient = global.typeClient
  if (!typesenseClient) {
    typesenseClient = new Typesense.Client({
      nodes: [
        {
          host: 'localhost', // For Typesense Cloud use xxx.a1.typesense.net
          port: 8108, // For Typesense Cloud use 443
          protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http', // For Typesense Cloud use https
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 2,
    })
    global.typeClient = typesenseClient
  }
  return typesenseClient
}

/**
 *
    type: string;
    objectID: string;
    content: string;
    data?: {
        title?: string | undefined;
        date?: string | undefined;
        tag?: string | undefined;
    } | undefined;
 */
let searchItemSchema: CollectionFieldSchema = {
  name: 'search_items',
  enable_nested_fields: true,
  type: 'object',
  fields: [
    {name: 'type', type: 'string'},
    {name: 'objectID', type: 'string'},
    {name: 'content', type: 'string', optional: true},
    {name: 'data', type: 'object', optional: true},
    {name: 'data.title', type: 'string', optional: true},
    {name: 'data.date', type: 'string', optional: true},
    {name: 'data.tag', type: 'string', optional: true},
  ],
}

export async function initTypesenseCollection() {
  const collections = await typesenseClient.collections().retrieve()
  if (!collections.find(c => c.name === 'search_items')) {
    typesenseClient
      .collections()
      .create(searchItemSchema)
      .then(function (data) {
        console.log('👍 created collection', data)
      })
  }
}

let typesenseClient = getTypesenseClient()
initTypesenseCollection()

export {typesenseClient}
