import React from 'react'
import ReactDOM from 'react-dom/client'
import Demo from './Demo'
import './index.css'
import "@react-sigma/core/lib/react-sigma.min.css"
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([{
  path: "/",
  loader: () => new Response("", {
    status: 302,
    headers: {
      Location: "/demo"
    }
  })
},
  {
    path: "/demo",
    element: <Demo />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
