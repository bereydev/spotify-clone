import type { NextPage } from 'next'
import Head from 'next/head'
import Sidebar from '../components/Sidebar'
import Center from '../components/Center'
import { getSession } from 'next-auth/react'

const Home: NextPage = () => {
  return (
    <div className="bg-black h-screen overflow-hidden">
      <main className="flex">
        <Sidebar/>
        <Center/>
      </main>
      <div>
        {/* Player */}
      </div>
    </div>
  )
}

export default Home

export async function getServerSideProps(context:any) {
  const session = await getSession(context);

  return {
    props: {
      session
    }
  }
}