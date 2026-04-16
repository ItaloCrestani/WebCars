import { useEffect, useState, useContext } from "react"
import { Container } from "../../components/container"
import { DashboardHeader } from "../../components/panelheader"
import { FiTrash2 } from "react-icons/fi"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css";

import { collection, getDocs, where, query, doc, deleteDoc } from "firebase/firestore"
import { db } from "../../services/firebaseConnection"
import { AuthContext } from "../../context/AuthContext"

interface CarProps {
  id: string;
  name: string;
  year: string;
  price: string | number;
  city: string;
  km: string;
  uid: string;
  images: string[];
}


export function Dashboard() {
  const [ cars, setCars ] = useState<CarProps[]>([])
  const [ loaded, setLoaded ] = useState(false)
  const { user } = useContext(AuthContext)

  useEffect(() => {

    function loadCars() {
      if(!user?.uid) return;

      const carsRef = collection(db, "cars")
      const queryRef = query(carsRef, where("uid", "==", user.uid))

      getDocs(queryRef)
      .then((snapshot) => {
        let listCars = [] as CarProps[];

        snapshot.forEach( doc => {
          listCars.push({
            id: doc.id,
            name: doc.data().name,
            year: doc.data().year,
            km: doc.data().km,
            city: doc.data().city,
            price: doc.data().price,
            images: doc.data().images,
            uid: doc.data().uid
          })
        })

        setCars(listCars)
        setLoaded(true)
      })
    }

    loadCars()
  }, [user])

  async function handleDeleteCar(id: string) {
    const docRef = doc(db, "cars", id)
    await deleteDoc(docRef)
    setCars(cars.filter(car => car.id !== id))
  }


  return (
    <Container>
      <DashboardHeader/>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {loaded ? cars.map(car => (
          <section className="w-full bg-white rounded-lg relative" key={car.id}>
            <button 
            onClick={() => handleDeleteCar(car.id)}
            className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow cursor-pointer hover:bg-white/60 hover:drop-shadow-md duration-300">
              <FiTrash2 size={26} color="#000"/>
            </button>

            <img
            className="w-full rounded-lg mb-2 max-h-70"
            src={car.images[0]}
            />
            <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>

            <div className="flex flex-col px-2">
              <span className="text-zinc-700">
                Ano {car.year} | {car.km} km
              </span>
              <strong className="text-black font-bold mt-4">
                R$ {car.price}
              </strong>
            </div>

            <div className="w-full h-px bg-slate-200 my-2"></div>
            <div className="px-2 pb-2">
              <span className="text-black">{car.city}</span>
            </div>

          </section>
          )) : (
            Array.from({length: 3}).map((_, index) => (
              <section className="w-full h-112" key={index}>
                <Skeleton className="w-full h-full rounded-lg"/>
              </section>
          ))
        )}

      </main>
    </Container>
  )
}