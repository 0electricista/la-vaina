import { get } from './helpers/ApiRequestsHelper'

function getProductCategories() {
  return get('productCategories')
}

function getTopThreeProducts() {
  return get('products/popular')
}

export { getProductCategories, getTopThreeProducts }
