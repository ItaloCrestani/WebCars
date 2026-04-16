import { useContext, useState, type ChangeEvent } from "react";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelheader";

import toast from "react-hot-toast";
import { FiUpload, FiTrash } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { Input } from "../../../components/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthContext } from "../../../context/AuthContext";
import { v4 as uuidV4 } from "uuid";

import { db } from "../../../services/firebaseConnection";
import { addDoc, collection } from "firebase/firestore";

const schema = z.object({
  name: z.string().min(1, "O campo nome é obrigatório"),
  model: z.string().min(1, "O modelo é obrigatório"),
  year: z.string().min(1, "O ano do carro é obrigatório"),
  km: z.string().min(1, "O km do carro obrigatório"),
  price: z.string().min(1, "O preço é obrigatório"),
  city: z.string().min(1, "A cidade é obrigatória"),
  whatsapp: z.string().min(1, "O telefone é obrigatório").refine((value) => /^(\d{11,12})$/.test(value), {
    message: "Número de telefone inválido"
  }),
  description: z.string().min(1, "A descrição é obrigatória")
})

type FormData = z.infer<typeof schema>

export function New() {
  const { user } = useContext(AuthContext);

  const [ carImages, setCarImages ] = useState<string[]>([])
  
  const { register, handleSubmit, formState: {errors}, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if(e.target.files && e.target.files[0]) {
      const image = e.target.files[0]
      
      if(image.type === 'image/jpeg' || image.type === 'image/png') {
        await handleUpload(image)

      }else {
        alert("Envie uma imagem jpeg ou png!")
        return;
      }
    }
  }

  async function handleUpload(image: File) {
    if(!user?.uid) return;

    const uniqueName = `${uuidV4()}-${image.name}`    

    const data = new FormData();
    data.append("file", image)
    data.append("public_id", uniqueName)
    data.append("upload_preset", "Images")
    data.append("cloud_name", "dkfltkoj1")

    const response = await fetch("https://api.cloudinary.com/v1_1/dkfltkoj1/image/upload", {
      method: "POST",
      body: data
    })

    const UploadedImage = await response.json()

    setCarImages((prev) => [...prev, UploadedImage.url])
    toast.success("Imagem cadastrada com sucesso!")
  
  }


  function onSubmit(data: FormData) {
    if(carImages.length === 0) {
      toast.error("Envie pelo menos 1 imagem!")
      return;
    }

    addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carImages
    })
    .then(() => {
      reset();
      setCarImages([])
      console.log("CADASTRADO COM SUCESSO!")
      toast.success("Carro cadastrado com sucesso!")
    })
    .catch((error) => {
      console.log(error)
      console.log("ERRO AO CADASTRAR NO BANCO")
    })

    console.log(data)
  }

  function handleDeleteImage(item: string) {
    setCarImages((prev) => prev.filter((url) => url !== item))
  }


  return (
    <Container>
      <DashboardHeader/>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 border-gray-600 w-48 h-32 rounded-lg flex items-center justify-center cursor-pointer md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000"/>
          </div>

          <div className="cursor-pointer">
            <input 
            type="file" 
            accept="image/*" 
            className="w-48 h-32 opacity-0 cursor-pointer" 
            onChange={handleFile}
             />
          </div>
        </button>

        <div className="flex w-full gap-2 overflow-x-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400">
        {carImages.map((item, index) => (
            <div className="flex justify-center items-center shrink-0 relative" key={index}>
              <button 
              className="absolute p-2 rounded-full hover:bg-gray-800/50 duration-400 cursor-pointer z-10"
              onClick={() => handleDeleteImage(item)}
              >
                <FiTrash size={28} color="#FFF"/>
              </button>
              <img
              className="w-48 h-32 object-cover rounded-lg duration-300"
              src={item}
              />
            </div>
          ))}
          </div>
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <p className="mb-2 font-medium">Nome do carro</p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Onix 1.0..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Modelo do carro</p>
            <Input
              type="text"
              register={register}
              name="model"
              error={errors.model?.message}
              placeholder="Ex: 1.0 Flex Plus Manual..."
            />
          </div>

          <div className="flex w-full mb-3 flex-row gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Ano</p>
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2016/2016..."
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">KM rodados</p>
              <Input
                type="text"
                register={register}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 23.900..."
              />
            </div>
          </div>

          <div className="flex w-full mb-3 flex-row gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone / WhatsApp</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: 011994872259..."
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Cidade</p>
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Campo Grande - MS..."
              />
            </div>
          </div>
          
          <div className="mb-3">
            <p className="mb-2 font-medium">Preço</p>
            <Input
              type="text"
              register={register}
              name="price"
              error={errors.price?.message}
              placeholder="Ex: 69.000..."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
            className="border-2 border-gray-300 w-full rounded-md h-24 px-2"
            {...register("description")}
            name="description"
            id="description"
            placeholder="Digite a descrição completa sobre o carro..."
            />
            {errors.description && <p className="my-1 text-red-500">{errors.description.message}</p>}
          </div>

          <button type="submit" className="w-full  h-10 rounded-md bg-zinc-900 text-white font-medium cursor-pointer">
            Cadastrar
          </button>

        </form>
        </div>
    </Container>
  )
}