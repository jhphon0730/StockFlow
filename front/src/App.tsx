import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { Layout } from "@/components/layout/layout"

import Dashboard from "@/pages/dashboard"
import NotFound from "@/pages/not-found"

import SignIn from "@/pages/auth/signin"
import SignUp from "@/pages/auth/signup"
import Warehouse from "@/pages/warehouse/warehouse"


const App = () => {
  return (
		<Router>
			<Routes>
				<Route path="/signin" element={<SignIn />} />
				<Route path="/signup" element={<SignUp />} />

				<Route path="/" element={<Layout />}>
					<Route index element={<Dashboard />} />
					<Route path="/warehouses" element={<Warehouse />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</Router>
  )
}

export default App
