export default function ({ $axios }) {
  $axios.onRequest(request => {
    console.log('Intercepted request:', request);
  })
  
  $axios.onResponse(response => {
    console.log('Intercepted response:', response);
  })
}