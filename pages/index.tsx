import { NextPage } from 'next';
import { useSession, signIn } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SquigglyLines from '../components/SquigglyLines';
import { Testimonials } from '../components/Testimonials';
import va from '@vercel/analytics';

const Home: NextPage = () => {
  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>audio chat</title>
      </Head>
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-20">
        <h1 className="mx-auto max-w-3xl font-display text-5xl font-bold tracking-normal text-slate-900 sm:text-5xl color-dark-olive-green">
          chat with your audio files
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-700 leading-7">
          Lectures, meetings, interviews — who has time to relisten?
        </p>
        <div className="flex justify-center space-x-4">
           <button
              onClick={() => signIn('google', { callbackUrl: '/restore' })}
              className="bg-gray-200 text-black font-semibold py-3 px-6 rounded-2xl flex items-center space-x-2 mt-10 shadow-md hover:bg-gray-300">
                 <img
                  src="google.png" // Path to your image file or URL
                  alt="Google Icon" // Alt text for accessibility
                  className="w-6 h-6" // Adjust size as needed
                />
              <span>Sign in with Google </span>
            </button>
        </div>
       
        <div className="flex justify-center items-center mt-12">
       
      </div>


      </main>
      <Footer />
    </div>
  );
};

export default Home;
