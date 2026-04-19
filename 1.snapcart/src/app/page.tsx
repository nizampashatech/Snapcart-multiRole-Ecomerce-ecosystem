import { auth } from '@/auth'
import AdminDashboard from '@/components/AdminDashboard'
import DeliveryBoy from '@/components/DeliveryBoy'
import EditRoleMobile from '@/components/EditRoleMobile'
import Footer from '@/components/Footer'
import GeoUpdater from '@/components/GeoUpdater'

import Nav from '@/components/Nav'
import UserDashboard from '@/components/UserDashboard'
import connectDb from '@/lib/db'
import Grocery, { IGrocery } from '@/models/grocery.model'

import User from '@/models/user.model'

import { redirect } from 'next/navigation'



async function Home(props:{
  searchParams:Promise<{
    q:string
  }>
}) {

const searchParams=await props.searchParams

  await connectDb()
  const session = await auth()
  if (!session) redirect("/login")
  console.log(session?.user)
  const user = await User.findById(session?.user?.id)
 if (!user) redirect("/login")

  const inComplete = !user.mobile || !user.role || (!user.mobile && user.role == "user")
  if (inComplete) {
    return <EditRoleMobile />
  }

  const plainUser = JSON.parse(JSON.stringify(user))

let groceryList:IGrocery[]=[]

if(user.role==="user"){
  if(searchParams.q){
    groceryList=await Grocery.find({
     $or:[
      { name: { $regex: searchParams?.q || "", $options: "i" } },
      { category: { $regex: searchParams?.q || "", $options: "i" } },
     ]
    })
  }else{
    groceryList=await Grocery.find({})
  }
}



  return (
    <div className="flex flex-col min-h-screen">
      
      <Nav user={plainUser} />
      <GeoUpdater userId={plainUser._id}/>

      <div className="flex-1">
        {user.role == "user" ? (
          groceryList.length > 0 ? (
            <UserDashboard groceryList={groceryList}/>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <h2 className="text-xl font-semibold text-gray-600">
                Sorry, we couldn't find any groceries matching your search 😔
              </h2>

              {/* Back to Home Button */}
              <a 
                href="/" 
                className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Back to Home
              </a>
            </div>
          )
        ) : user.role == "admin" ? (
          <AdminDashboard />
        ) : <DeliveryBoy />}

      </div>

      <Footer/>
    </div>
  )
}

export default Home