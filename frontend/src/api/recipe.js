/**
 * @param {import('axios').AxiosInstance} httpClient
 */
function create(httpClient) {

  async function all() {
    const response = await httpClient.get('/recipes')
    return response.data
  }

  async function retrieve(id) {
    const response = await httpClient.get('/recipes/' + encodeURI(id))
    return response.data
  }

  return { all, retrieve }
}

export { create }