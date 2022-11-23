import axios from 'axios'

// variável com url do servidor
export const webServiceURL = 'http://localhost:3001/'

// cria uma instance Axios com a URL base do Web Service 
// a ser acessado pelo app
export const inAxios=axios.create({baseURL: webServiceURL})