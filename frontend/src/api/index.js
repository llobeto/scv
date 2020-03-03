import { httpClient } from './http-client'
import { create } from './recipe'

const recipe = create(httpClient)

export { recipe }