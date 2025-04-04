import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { Layout } from "@/components/layout/layout"

import SignIn from "@/pages/signin"
import SignUp from "@/pages/signup"
import Dashboard from "@/pages/dashboard"
import Warehouse from "@/pages/warehouse"

const App = () => {
  return (
		<Router>
			<Routes>
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />

				<Route path="/" element={<Layout />}>
					<Route index element={<Dashboard />} />
					<Route path="/products" element={<div>Products</div>} />
					<Route path="/warehouses" element={<Warehouse />} />
					<Route path="/inventory" element={<div>Inventory</div>} />
					<Route path="/reports" element={<div>Reports</div>} />
					<Route path="/users" element={<div>Users</div>} />
				</Route>
			</Routes>
		</Router>
  )
}

export default App
