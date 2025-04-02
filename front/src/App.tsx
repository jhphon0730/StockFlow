import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { Layout } from "@/components/layout/layout"

import Login from "@/pages/login"

const App = () => {
  return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />

				<Route path="/" element={<Layout />}>
					<Route index element={<div>Home</div>} />
					<Route path="/products" element={<div>Products</div>} />
					<Route path="/warehouses" element={<div>Warehouses</div>} />
					<Route path="/inventory" element={<div>Inventory</div>} />
					<Route path="/reports" element={<div>Reports</div>} />
					<Route path="/users" element={<div>Users</div>} />
				</Route>
			</Routes>
		</Router>
  )
}

export default App
