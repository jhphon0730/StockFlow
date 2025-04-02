import React, { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { Layout } from "@/components/layout/layout"

const App = () => {
  return (
		<Router>
			<Layout>
				<Routes>
					<Route path="/" element={<div>Home</div>} />
					<Route path="/products" element={<div>Products</div>} />
					<Route path="/warehouses" element={<div>Warehouses</div>} />
					<Route path="/inventory" element={<div>Inventory</div>} />
					<Route path="/reports" element={<div>Reports</div>} />
					<Route path="/users" element={<div>Users</div>} />
				</Routes>
			</Layout>
		</Router>
  )
}

export default App
