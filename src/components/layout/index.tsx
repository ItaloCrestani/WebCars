import { Outlet } from "react-router"
import { Header } from "../heaer"

export function Layout() {
  return (
    <>
      <Header/>
      <Outlet/>    
    </>
  )
}