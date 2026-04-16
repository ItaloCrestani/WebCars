import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Container } from "../../components/container"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css";

import { collection, query, getDocs, orderBy, where } from "firebase/firestore"
import { db } from "../../services/firebaseConnection"

interface CarsProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  images: string[];
}

export function Home() {
  const [ cars, setCars ] = useState<CarsProps[]>([])
  const [ loadImages, setLoadImages ] = useState<string[]>([])
  const [ loaded, setLoaded ] = useState(false)
  const [ input, setInput ] = useState("")

  useEffect(() => {
    loadCars()
  }, [])

  function loadCars() {
      const carsRef = collection(db, "cars")
      const queryRef = query(carsRef, orderBy("created", "desc"))

      getDocs(queryRef)
      .then((snapshot) => {
        let listCars = [] as CarsProps[];

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

  function handleImageLoad(id: string) {
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
  }

  async function handleSearchCar() {
    if(input.trim() === "") {
      loadCars();
      return;
    }

    setCars([])
    setLoadImages([])

    const q = query(collection(db, 'cars'), 
    where("name", ">=", input.toUpperCase()),
    where("name", "<=", input.toUpperCase() + "\uf8ff")
    )
    
    const querySnapshot = await getDocs(q)

    let listCars = [] as CarsProps[];

    querySnapshot.forEach((doc) => {
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
  }

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input
        className="w-full border-2 border-gray-300 rounded-lg h-9 px-3 outline-none"
        placeholder="Digite o nome do carro..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if(e.key === 'Enter') handleSearchCar() 
        }}
        />
        <button
        onClick={handleSearchCar}
        className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg">
          Buscar
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Carros novos e usados em todo o Brasil
      </h1>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        
        {loaded ? cars.map(car => (
          <Link to={`/car/${car.id}`} key={car.id}>
            <section className="w-full bg-white rounded-lg">
              <div
              className="w-full h-72 rounded-lg bg-slate-200"
              style={{display: loadImages.includes(car.id) ? "none" : "block"}}
              ></div>
              <img
              className="w-full rounded-lg mb-2 max-h-72 object-cover hover:scale-105 transition duration-300"
              src={car.images[0]}
              alt="Carro"
              onLoad={() => handleImageLoad(car.id)}
              style={{display: loadImages.includes(car.id) ? "block" : "none"}}
              />
              <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>
              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-6">Ano {car.year} | {car.km} km</span>
                <strong className="text-black font-medium text-xl">R$ {car.price}</strong>
              </div>
              <div className="w-full h-px bg-slate-200 my-2"></div>
              <div className="px-2 pb-2">
                <span className="text-black">
                  {car.city}
                </span>
              </div>
            </section>
          </Link>
        )) : (
          Array.from({length: 2}).map((_, index) => (
            <section className="w-full h-112" key={index}>
              <Skeleton className="w-full h-full rounded-lg"/>
            </section>
          ))
      )}

      </main>
    </Container>
  )
}